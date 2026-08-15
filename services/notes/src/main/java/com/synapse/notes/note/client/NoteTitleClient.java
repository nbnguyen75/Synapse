package com.synapse.notes.note.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.synapse.notes.common.interceptor.AuthenticationInterceptor;
import com.synapse.notes.note.model.Note;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
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
  private static final String DEFAULT_TITLE = "Untitled";
  private static final Pattern MARKDOWN_HEADER_PATTERN =
      Pattern.compile("^#+\\s+(.*)$", Pattern.MULTILINE);

  private static final int FALLBACK_TITLE_MAX_LENGTH = 80;

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

  public String initialTitle(String content) {
    return extractTitleFromMarkdown(content);
  }

  public String fallbackGenerateTitle(String content, Throwable throwable) {
    String reason = throwable != null ? throwable.getMessage() : "N/A";
    log.warn(
        "AI Service is unavailable. Reason: {}. Falling back to Markdown title extraction.",
        reason);

    return extractTitleFromMarkdown(content);
  }

  public String generateTitle(String content) {
    final var rawTitle =
        this.circuitBreaker.run(
            () -> {
              TitleResponse response =
                  restClient
                      .post()
                      .uri("/generator/note-title")
                      .contentType(MediaType.APPLICATION_JSON)
                      .body(Map.of("content", content))
                      .retrieve()
                      .body(TitleResponse.class);

              return Optional.ofNullable(response)
                  .map(res -> res.data())
                  .map(data -> data.title())
                  .map(title -> title.trim())
                  .filter(title -> !title.isBlank())
                  .orElseGet(() -> extractTitleFromMarkdown(content));
            },
            throwable -> fallbackGenerateTitle(content, throwable));

    return truncate(rawTitle, Note.MAX_TITLE_LENGTH);
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record TitleResponse(String timestamp, boolean success, Data data) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Data(String title) {}
  }

  private String truncate(String text, int maxLength) {
    if (text == null) {
      return DEFAULT_TITLE;
    }
    String trimmed = text.trim();
    return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength - 3) + "...";
  }

  private String extractTitleFromMarkdown(String content) {
    if (content == null || content.isBlank()) {
      return DEFAULT_TITLE;
    }

    var matcher = MARKDOWN_HEADER_PATTERN.matcher(content);
    if (matcher.find()) {
      String headerText = matcher.group(1).trim();
      if (!headerText.isBlank()) {
        return truncate(headerText, FALLBACK_TITLE_MAX_LENGTH);
      }
    }

    String[] lines = content.split("\\r?\\n");
    for (String line : lines) {
      String cleanLine = line.replaceAll("[#*`>_~-]", "").trim();
      if (!cleanLine.isBlank()) {
        return truncate(cleanLine, FALLBACK_TITLE_MAX_LENGTH);
      }
    }

    return DEFAULT_TITLE;
  }
}
