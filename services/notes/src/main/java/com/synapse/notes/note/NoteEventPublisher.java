package com.synapse.notes.note;

import com.synapse.notes.config.RabbitConfig;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NoteEventPublisher {
  private final RabbitTemplate rabbitTemplate;

  public void publishCreated(Note note) {
    rabbitTemplate.convertAndSend(
        RabbitConfig.EXCHANGE,
        "note.created",
        Map.of(
            "noteId", note.getId().toString(),
            "userId", note.getUserId(),
            "content", note.getContent(),
            "trashed", note.isTrashed()));
  }

  public void publishUpdated(Note note) {
    rabbitTemplate.convertAndSend(
        RabbitConfig.EXCHANGE,
        "note.updated",
        Map.of(
            "noteId", note.getId().toString(),
            "userId", note.getUserId(),
            "content", note.getContent(),
            "trashed", note.isTrashed()));
  }

  public void publishDeleted(UUID noteId) {
    rabbitTemplate.convertAndSend(
        RabbitConfig.EXCHANGE, "note.deleted", Map.of("noteId", noteId.toString()));
  }
}
