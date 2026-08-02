package com.synapse.notes.config;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import io.github.resilience4j.timelimiter.TimeLimiterRegistry;
import java.time.Duration;
import java.util.concurrent.Executors;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JCircuitBreakerFactory;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JConfigBuilder;
import org.springframework.cloud.client.circuitbreaker.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.concurrent.DelegatingSecurityContextExecutorService;

@Configuration
public class CircuitBreakerConfiguration {

  private static final String AI_SERVICE_ID = "aiService";

  private static final TimeLimiterConfig AI_SERVICE_TIME_LIMITER_CONFIG =
      TimeLimiterConfig.custom().timeoutDuration(Duration.ofSeconds(12)).build();

  private static final CircuitBreakerConfig AI_SERVICE_CIRCUIT_BREAKER_CONFIG =
      CircuitBreakerConfig.custom()
          .slidingWindowSize(10)
          .failureRateThreshold(50)
          .waitDurationInOpenState(Duration.ofSeconds(10))
          .build();

  @Bean
  public TimeLimiterRegistry timeLimiterRegistry() {
    var registry = TimeLimiterRegistry.ofDefaults();
    registry.timeLimiter(AI_SERVICE_ID, AI_SERVICE_TIME_LIMITER_CONFIG);
    return registry;
  }

  @Bean
  public CircuitBreakerRegistry circuitBreakerRegistry() {
    var registry = CircuitBreakerRegistry.ofDefaults();
    registry.circuitBreaker(AI_SERVICE_ID, AI_SERVICE_CIRCUIT_BREAKER_CONFIG);
    return registry;
  }

  @Bean
  public Customizer<Resilience4JCircuitBreakerFactory> defaultCustomizer(
      TimeLimiterRegistry timeLimiterRegistry, CircuitBreakerRegistry circuitBreakerRegistry) {
    return factory -> {
      var securityExecutor =
          new DelegatingSecurityContextExecutorService(Executors.newVirtualThreadPerTaskExecutor());
      factory.configureExecutorService(securityExecutor);

      factory.configureDefault(
          id ->
              new Resilience4JConfigBuilder(id)
                  .circuitBreakerConfig(AI_SERVICE_CIRCUIT_BREAKER_CONFIG)
                  .timeLimiterConfig(AI_SERVICE_TIME_LIMITER_CONFIG)
                  .build());
    };
  }
}
