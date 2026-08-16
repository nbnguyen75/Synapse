package com.synapse.notes.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.MessageRecoverer;
import org.springframework.amqp.rabbit.retry.RepublishMessageRecoverer;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfiguration {

  // * Exchanges
  public static final String MAIN_EXCHANGE = "note.exchange";
  public static final String DLX_EXCHANGE = "note.dlx";

  // * Routing Keys
  public static final String ROUTING_KEY_CREATED = "note.created";
  public static final String ROUTING_KEY_UPDATED = "note.updated";
  public static final String ROUTING_KEY_DELETED = "note.deleted";

  // * Queue & DLQ dành riêng cho AI Sync (Vector Embedding)
  public static final String QUEUE_AI_SYNC = "note.ai-sync.queue";
  public static final String QUEUE_AI_SYNC_DLQ = "note.ai-sync.dlq";
  public static final String DLQ_ROUTING_KEY_AI_SYNC = "note.ai-sync.dlq.routing.key";

  @Bean
  public DirectExchange mainExchange() {
    return new DirectExchange(MAIN_EXCHANGE);
  }

  @Bean
  public DirectExchange deadLetterExchange() {
    return new DirectExchange(DLX_EXCHANGE);
  }

  // Bindings cho AI Sync Queue
  @Bean
  public Queue aiSyncQueue() {
    return QueueBuilder.durable(QUEUE_AI_SYNC)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY_AI_SYNC)
        .build();
  }

  @Bean
  public Binding aiSyncCreatedBinding() {
    return BindingBuilder.bind(aiSyncQueue()).to(mainExchange()).with(ROUTING_KEY_CREATED);
  }

  @Bean
  public Binding aiSyncUpdatedBinding() {
    return BindingBuilder.bind(aiSyncQueue()).to(mainExchange()).with(ROUTING_KEY_UPDATED);
  }

  @Bean
  public Binding aiSyncDeletedBinding() {
    return BindingBuilder.bind(aiSyncQueue()).to(mainExchange()).with(ROUTING_KEY_DELETED);
  }

  // DLQ cho AI Sync
  @Bean
  public Queue aiSyncDlq() {
    return QueueBuilder.durable(QUEUE_AI_SYNC_DLQ).build();
  }

  @Bean
  public Binding aiSyncDlqBinding() {
    return BindingBuilder.bind(aiSyncDlq()).to(deadLetterExchange()).with(DLQ_ROUTING_KEY_AI_SYNC);
  }

  @Bean
  public MessageConverter jsonMessageConverter() {
    return new JacksonJsonMessageConverter();
  }

  @Bean
  public MessageRecoverer messageRecoverer(RabbitTemplate rabbitTemplate) {
    return new RepublishMessageRecoverer(rabbitTemplate, DLX_EXCHANGE, DLQ_ROUTING_KEY_AI_SYNC);
  }
}
