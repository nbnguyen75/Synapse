package com.synapse.notes.note.event;

import com.synapse.notes.note.client.NoteTitleClient;
import com.synapse.notes.note.repository.NoteRepository;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class NoteEventListener {

  private static final Logger log = LoggerFactory.getLogger(NoteEventListener.class);

  private final NoteTitleClient noteTitleClient;
  private final NoteRepository noteRepository;

  public NoteEventListener(NoteTitleClient noteTitleClient, NoteRepository noteRepository) {
    this.noteTitleClient = noteTitleClient;
    this.noteRepository = noteRepository;
  }

  @Async
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void handleNoteCreatedEvent(NoteCreatedEvent event) {
    log.info("Starting background AI title generation for Note ID: {}", event.noteId());

    try {
      String aiTitle = noteTitleClient.generateTitle(event.content());

      noteRepository
          .findById(event.noteId())
          .ifPresent(
              note -> {
                if (note.getTitle().equals(noteTitleClient.initialTitle(event.content()))) {
                  note.setTitle(aiTitle);
                  note.setUpdatedAt(Instant.now());
                  noteRepository.save(note);
                  log.info(
                      "Successfully updated AI title for Note ID: {} -> '{}'",
                      event.noteId(),
                      aiTitle);
                }
              });
    } catch (Exception e) {
      log.error(
          "Failed to generate AI title asynchronously for Note ID {}: {}",
          event.noteId(),
          e.getMessage(),
          e);
    }
  }
}
