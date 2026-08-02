package com.synapse.notes.note;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.synapse.notes.common.interceptor.AuthenticationInterceptor;
import java.time.Duration;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class NoteTitleClient {
  private static final Logger log = LoggerFactory.getLogger(NoteTitleClient.class);
  private final RestClient restClient;
  private final CircuitBreaker circuitBreaker;

  public NoteTitleClient(
      RestClient.Builder restClientBuilder,
      CircuitBreakerFactory<?, ?> circuitBreakerFactory,
      @Value("${synapse.ai-service.url}") String aiServiceUrl,
      AuthenticationInterceptor authenticationInterceptor) {

    final var requestFactory = new SimpleClientHttpRequestFactory();
    requestFactory.setConnectTimeout(Duration.ofSeconds(3));
    requestFactory.setReadTimeout(Duration.ofSeconds(10));

    this.restClient =
        restClientBuilder
            .baseUrl(aiServiceUrl)
            .requestInterceptor(authenticationInterceptor)
            .requestFactory(requestFactory)
            .build();
    this.circuitBreaker = circuitBreakerFactory.create("aiService");
  }

  public String fallbackGenerateTitle(String content, Throwable throwable) {
    log.warn(
        "AI Service không khả dụng. Lý do: {}. Trả về tiêu đề mặc định.", throwable.getMessage());
    return "Untitled";
  }

  public String generateTitle(String content) {
    return this.circuitBreaker.run(
        () -> {
          TitleResponse response =
              restClient
                  .post()
                  .uri("/generator/note-title")
                  .contentType(MediaType.APPLICATION_JSON)
                  .body(Map.of("content", content))
                  .retrieve()
                  .body(TitleResponse.class);

          if (response != null && response.data() != null && response.data().title() != null) {
            return response.data().title();
          }
          return "Untitled";
        },
        throwable -> fallbackGenerateTitle(content, throwable));
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record TitleResponse(String timestamp, boolean success, Data data) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Data(String title) {}
  }
}
