package com.synapse.notes.note.service;

import com.synapse.notes.common.exception.ApiException;
import com.synapse.notes.common.exception.ErrorCode;
import com.synapse.notes.common.response.PageResponse;
import com.synapse.notes.note.client.NoteTitleClient;
import com.synapse.notes.note.dto.request.BulkActionRequest.BulkAction;
import com.synapse.notes.note.dto.request.CreateNoteRequest;
import com.synapse.notes.note.dto.request.NoteQueryParams;
import com.synapse.notes.note.dto.request.PatchNoteRequest;
import com.synapse.notes.note.dto.request.UpdateNoteRequest;
import com.synapse.notes.note.dto.response.NoteResponse;
import com.synapse.notes.note.event.NoteCreatedEvent;
import com.synapse.notes.note.event.NoteEventPublisher;
import com.synapse.notes.note.model.Note;
import com.synapse.notes.note.repository.NoteRepository;
import java.time.Instant;
import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoteService {
  private static final Set<String> ALLOWED_SORT_FIELDS =
      Set.of("createdAt", "updatedAt", "title", "pinned", "favorite", "trashedAt");

  private final NoteRepository noteRepository;
  private final NoteEventPublisher eventPublisher;
  private final NoteTitleClient titleClient;
  private final ApplicationEventPublisher applicationEventPublisher;

  public PageResponse<NoteResponse> getNotes(String userId, NoteQueryParams query) {
    final var pageable = query.toPageable(ALLOWED_SORT_FIELDS);
    String searchQuery = (query.q() != null) ? query.q().trim() : null;

    final var notesPage =
        noteRepository
            .findNotes(
                userId, query.trashed(), query.archived(), query.favorite(), searchQuery, pageable)
            .map(NoteResponse::from);

    return PageResponse.from(notesPage);
  }

  public NoteResponse getNoteById(String userId, UUID id) {
    return noteRepository
        .findByIdAndUserId(id, userId)
        .map(NoteResponse::from)
        .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Note not found"));
  }

  @Transactional
  public NoteResponse createNote(String userId, CreateNoteRequest req) {
    boolean isCustomTitle = req.title() != null && !req.title().isBlank();
    String title = isCustomTitle ? req.title() : titleClient.initialTitle(req.content());

    final var note =
        noteRepository.save(
            Note.builder().userId(userId).title(title).content(req.content()).build());

    eventPublisher.publishCreated(note);

    if (!isCustomTitle) {
      applicationEventPublisher.publishEvent(new NoteCreatedEvent(note.getId(), note.getContent()));
    }

    return NoteResponse.from(note);
  }

  @Transactional
  public NoteResponse updateNote(String userId, UUID id, UpdateNoteRequest req) {
    Note note = getNoteEntity(userId, id);
    note.updateContent(req.title(), req.content());

    eventPublisher.publishUpdated(note);
    return NoteResponse.from(note);
  }

  @Transactional
  public NoteResponse patchNote(String userId, UUID id, PatchNoteRequest req) {
    Note note = getNoteEntity(userId, id);
    boolean wasTrashed = note.isTrashed();

    if (req.status() != null) {
      note.changeStatus(req.status());
    }

    if (req.pinned() != null) {
      note.setPinned(req.pinned());
    }

    if (req.favorite() != null) {
      note.setFavorite(req.favorite());
    }

    if (wasTrashed != note.isTrashed()) {
      eventPublisher.publishUpdated(note);
    }

    return NoteResponse.from(note);
  }

  @Transactional
  public void deleteNotePermanent(String userId, UUID id) {
    if (!noteRepository.existsByIdAndUserId(id, userId)) {
      throw new ApiException(ErrorCode.NOT_FOUND, "Note not found");
    }
    noteRepository.deleteById(id);
    eventPublisher.publishDeleted(id);
  }

  @Transactional
  public void emptyTrash(String userId) {
    final var trashedIds = noteRepository.findTrashedIdsByUserId(userId);

    if (!trashedIds.isEmpty()) {
      noteRepository.deleteAllTrashedByUserId(userId);
      eventPublisher.publishDeleted(trashedIds);
    }
  }

  @Transactional
  public int executeBulkAction(String userId, Collection<UUID> ids, BulkAction action) {
    if (ids == null || ids.isEmpty()) {
      return 0;
    }

    Instant now = Instant.now();

    return switch (action) {
      case ARCHIVE -> noteRepository.bulkArchive(userId, ids, now);
      case UNARCHIVE -> noteRepository.bulkUnarchive(userId, ids, now);
      case PIN -> noteRepository.bulkPin(userId, ids, true, now);
      case UNPIN -> noteRepository.bulkPin(userId, ids, false, now);
      case FAVORITE -> noteRepository.bulkFavorite(userId, ids, true, now);
      case UNFAVORITE -> noteRepository.bulkFavorite(userId, ids, false, now);

      case TRASH -> {
        int affected = noteRepository.bulkTrash(userId, ids, now);
        if (affected > 0) {
          final var notes = noteRepository.findAllByIdInAndUserId(ids, userId);
          eventPublisher.publishUpdated(notes);
        }
        yield affected;
      }

      case RESTORE -> {
        int affected = noteRepository.bulkRestore(userId, ids, now);
        if (affected > 0) {
          final var notes = noteRepository.findAllByIdInAndUserId(ids, userId);
          eventPublisher.publishUpdated(notes);
        }
        yield affected;
      }

      case DELETE_PERMANENT -> {
        int affected = noteRepository.bulkDeletePermanent(userId, ids);
        if (affected > 0) {
          eventPublisher.publishDeleted(ids);
        }
        yield affected;
      }
    };
  }

  private Note getNoteEntity(String userId, UUID id) {
    return noteRepository
        .findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Note not found"));
  }
}
