package com.synapse.notes.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.api.gax.core.CredentialsProvider;
import com.google.api.gax.core.NoCredentialsProvider;
import com.google.cloud.spring.pubsub.support.converter.JacksonPubSubMessageConverter;
import com.google.cloud.spring.pubsub.support.converter.PubSubMessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PubSubConfiguration {

  public static final String NOTE_TOPIC = "note-events";

  public static final String ROUTING_KEY_CREATED = "note.created";
  public static final String ROUTING_KEY_UPDATED = "note.updated";
  public static final String ROUTING_KEY_DELETED = "note.deleted";

  @Bean
  @ConditionalOnProperty(name = "spring.cloud.gcp.pubsub.emulator-host")
  public CredentialsProvider credentialsProvider() {
    return NoCredentialsProvider.create();
  }

  @Bean
  public ObjectMapper objectMapper() {
    return JsonMapper.builder()
        .addModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        .build();
  }

  @Bean
  public PubSubMessageConverter pubSubMessageConverter(ObjectMapper objectMapper) {
    return new JacksonPubSubMessageConverter(objectMapper);
  }
}
