package com.synapse.notes.note.event;

import com.google.cloud.spring.pubsub.core.PubSubTemplate;
import com.synapse.notes.config.PubSubConfiguration;
import com.synapse.notes.note.model.Note;
import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
@RequiredArgsConstructor
@Slf4j
public class NoteEventPublisher {

  private final PubSubTemplate pubSubTemplate;

  public void publishCreated(Note note) {
    publishAfterCommit(PubSubConfiguration.ROUTING_KEY_CREATED, NoteEventPayload.from(note));
  }

  public void publishUpdated(Note note) {
    publishAfterCommit(PubSubConfiguration.ROUTING_KEY_UPDATED, NoteEventPayload.from(note));
  }

  public void publishUpdated(Collection<Note> notes) {
    if (notes == null || notes.isEmpty()) {
      return;
    }
    final var payloadList = notes.stream().map(NoteEventPayload::from).toList();

    publishAfterCommit(
        PubSubConfiguration.ROUTING_KEY_UPDATED, new NoteBulkUpdatedPayload(payloadList));
  }

  public void publishDeleted(UUID noteId) {
    publishAfterCommit(PubSubConfiguration.ROUTING_KEY_DELETED, new NoteDeletedPayload(noteId));
  }

  public void publishDeleted(Collection<UUID> noteIds) {
    if (noteIds == null || noteIds.isEmpty()) {
      return;
    }
    publishAfterCommit(
        PubSubConfiguration.ROUTING_KEY_DELETED, new NoteBulkDeletedPayload(noteIds));
  }

  private void publishAfterCommit(String routingKey, Object payload) {
    if (TransactionSynchronizationManager.isActualTransactionActive()) {
      TransactionSynchronizationManager.registerSynchronization(
          new TransactionSynchronization() {
            @Override
            public void afterCommit() {
              sendToPubSub(routingKey, payload);
            }
          });
    } else {
      sendToPubSub(routingKey, payload);
    }
  }

  private void sendToPubSub(String routingKey, Object payload) {
    try {
      Map<String, String> attributes = Map.of("eventType", routingKey);

      pubSubTemplate.publish(PubSubConfiguration.NOTE_TOPIC, payload, attributes);

      log.info(
          "[PubSub] Successfully published event [{}] to topic [{}]",
          routingKey,
          PubSubConfiguration.NOTE_TOPIC);
    } catch (Exception e) {
      log.error(
          "[PubSub] Failed to publish event [{}] to topic [{}]",
          routingKey,
          PubSubConfiguration.NOTE_TOPIC,
          e);
    }
  }

  public record NoteEventPayload(
      UUID noteId,
      String userId,
      String title,
      String content,
      boolean trashed,
      Instant createdAt,
      Instant updatedAt) {
    public static NoteEventPayload from(Note note) {
      return new NoteEventPayload(
          note.getId(),
          note.getUserId(),
          note.getTitle(),
          note.getContent(),
          note.isTrashed(),
          note.getCreatedAt(),
          note.getUpdatedAt());
    }
  }

  public record NoteDeletedPayload(UUID noteId) {}

  public record NoteBulkDeletedPayload(Collection<UUID> noteIds) {}

  public record NoteBulkUpdatedPayload(Collection<NoteEventPayload> notes) {}
}
