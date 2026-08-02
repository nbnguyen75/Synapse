package com.synapse.notes.note;

import com.synapse.notes.common.exception.ApiException;
import com.synapse.notes.common.exception.ErrorCode;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NoteService {
  private final NoteRepository noteRepository;
  private final NoteEventPublisher eventPublisher;
  private final NoteTitleClient titleClient;

  public Note createNote(String userId, CreateNoteRequest req) {
    String title =
        (req.title() != null && !req.title().isBlank())
            ? req.title()
            : titleClient.generateTitle(req.content());

    Note note =
        noteRepository.save(
            Note.builder().userId(userId).title(title).content(req.content()).build());

    eventPublisher.publishCreated(note);
    return note;
  }

  public Note updateNote(String userId, UUID id, UpdateNoteRequest req) {

    Note note =
        noteRepository
            .findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Note not found"));

    note.setTitle(req.title());
    note.setContent(req.content());
    noteRepository.save(note);

    eventPublisher.publishUpdated(note);
    return note;
  }

  public void deleteNote(String userId, UUID id) {
    if (!noteRepository.existsByIdAndUserId(id, userId)) {
      throw new ApiException(ErrorCode.NOT_FOUND, "Note not found");
    }

    noteRepository.deleteById(id);
    eventPublisher.publishDeleted(id);
  }
}
