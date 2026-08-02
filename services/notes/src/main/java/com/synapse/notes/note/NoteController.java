package com.synapse.notes.note;

import com.synapse.notes.common.annotation.CurrentUserId;
import com.synapse.notes.common.exception.ApiException;
import com.synapse.notes.common.exception.ErrorCode;
import com.synapse.notes.common.response.ApiResponse;
import com.synapse.notes.common.response.PageResponse;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class NoteController {

  private static final Set<String> ALLOWED_SORT_FIELDS =
      Set.of("createdAt", "updatedAt", "title", "pinned", "favorite", "trashedAt");

  private final NoteRepository noteRepository;
  private final NoteService noteService;

  /**
   * Filter notes by state (active by default, or archived/trashed/favorite via query params) GET
   * /?q=meeting&archived=false&trashed=false&page=0&size=10&sort=pinned,desc,updatedAt,desc
   */
  @GetMapping("")
  public ApiResponse<PageResponse<Note>> getNotes(
      @CurrentUserId String userId, @Valid @ModelAttribute NoteQueryParams query) {

    Pageable pageable = query.toPageable(ALLOWED_SORT_FIELDS);
    String searchQuery = (query.q() != null) ? query.q().trim() : null;

    Page<Note> notesPage =
        noteRepository.findNotes(
            userId, query.trashed(), query.archived(), query.favorite(), searchQuery, pageable);

    return ApiResponse.success(PageResponse.from(notesPage));
  }

  @GetMapping("/{id}")
  public ApiResponse<Note> get(@CurrentUserId String userId, @PathVariable UUID id) {
    return noteRepository
        .findByIdAndUserId(id, userId)
        .map(ApiResponse::success)
        .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Note not found"));
  }

  @PostMapping("")
  public ApiResponse<Note> create(
      @CurrentUserId String userId, @RequestBody @Valid CreateNoteRequest req) {
    final var newNote = noteService.createNote(userId, req);

    return ApiResponse.success(newNote);
  }

  @PutMapping("/{id}")
  public ApiResponse<Note> update(
      @CurrentUserId String userId,
      @PathVariable UUID id,
      @RequestBody @Valid UpdateNoteRequest req) {
    final var updatedNote = noteService.updateNote(userId, id, req);

    return ApiResponse.success(updatedNote);
  }

  @PatchMapping("/{id}/pin")
  public ApiResponse<Note> togglePin(@CurrentUserId String userId, @PathVariable UUID id) {
    return noteRepository
        .findByIdAndUserId(id, userId)
        .map(
            note -> {
              note.setPinned(!note.isPinned());
              note.setUpdatedAt(Instant.now());
              return ApiResponse.success(noteRepository.save(note));
            })
        .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Note not found"));
  }

  @PatchMapping("/{id}/favorite")
  public ApiResponse<Note> toggleFavorite(@CurrentUserId String userId, @PathVariable UUID id) {
    return noteRepository
        .findByIdAndUserId(id, userId)
        .map(
            note -> {
              note.setFavorite(!note.isFavorite());
              note.setUpdatedAt(Instant.now());
              return ApiResponse.success(noteRepository.save(note));
            })
        .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Note not found"));
  }

  @PatchMapping("/{id}/archive")
  public ApiResponse<Note> archiveNote(@CurrentUserId String userId, @PathVariable UUID id) {
    return noteRepository
        .findByIdAndUserId(id, userId)
        .map(
            note -> {
              note.setArchived(true);
              note.setPinned(false); // Unpin when archiving
              note.setUpdatedAt(Instant.now());
              return ApiResponse.success(noteRepository.save(note));
            })
        .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Note not found"));
  }

  @PatchMapping("/{id}/unarchive")
  public ApiResponse<Note> unarchiveNote(@CurrentUserId String userId, @PathVariable UUID id) {
    return noteRepository
        .findByIdAndUserId(id, userId)
        .map(
            note -> {
              note.setArchived(false);
              note.setUpdatedAt(Instant.now());
              return ApiResponse.success(noteRepository.save(note));
            })
        .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Note not found"));
  }

  @PatchMapping("/{id}/trash")
  public ApiResponse<Note> moveToTrash(@CurrentUserId String userId, @PathVariable UUID id) {
    return noteRepository
        .findByIdAndUserId(id, userId)
        .map(
            note -> {
              note.setTrashed(true);
              note.setTrashedAt(Instant.now());
              note.setPinned(false); // Unpin when trashed
              note.setUpdatedAt(Instant.now());
              return ApiResponse.success(noteRepository.save(note));
            })
        .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Note not found"));
  }

  @PatchMapping("/{id}/restore")
  public ApiResponse<Note> restoreFromTrash(@CurrentUserId String userId, @PathVariable UUID id) {
    return noteRepository
        .findByIdAndUserId(id, userId)
        .map(
            note -> {
              note.setTrashed(false);
              note.setTrashedAt(null);
              note.setUpdatedAt(Instant.now());
              return ApiResponse.success(noteRepository.save(note));
            })
        .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Note not found"));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Object> delete(@CurrentUserId String userId, @PathVariable UUID id) {
    noteService.deleteNote(userId, id);
    return ApiResponse.success("Note permanently deleted");
  }

  @Transactional
  @DeleteMapping("/trash")
  public ApiResponse<Object> emptyTrash(@CurrentUserId String userId) {
    noteRepository.deleteAllTrashedByUserId(userId);
    return ApiResponse.success("Trash emptied successfully");
  }

  @PatchMapping("/bulk/archive")
  @Transactional
  public ApiResponse<Integer> bulkArchive(
      @CurrentUserId String userId, @RequestBody @Valid BulkNoteRequest req) {

    int affectedCount = noteRepository.bulkArchive(userId, req.ids(), Instant.now());
    return ApiResponse.success(affectedCount);
  }

  @PatchMapping("/bulk/unarchive")
  @Transactional
  public ApiResponse<Integer> bulkUnarchive(
      @CurrentUserId String userId, @RequestBody @Valid BulkNoteRequest req) {

    int affectedCount = noteRepository.bulkUnarchive(userId, req.ids(), Instant.now());
    return ApiResponse.success(affectedCount);
  }

  @PatchMapping("/bulk/trash")
  @Transactional
  public ApiResponse<Integer> bulkTrash(
      @CurrentUserId String userId, @RequestBody @Valid BulkNoteRequest req) {

    int affectedCount = noteRepository.bulkTrash(userId, req.ids(), Instant.now());
    return ApiResponse.success(affectedCount);
  }

  @PatchMapping("/bulk/favorite")
  @Transactional
  public ApiResponse<Integer> bulkFavorite(
      @CurrentUserId String userId,
      @RequestParam(defaultValue = "true") boolean favorite,
      @RequestBody @Valid BulkNoteRequest req) {

    int affectedCount = noteRepository.bulkFavorite(userId, req.ids(), favorite, Instant.now());
    return ApiResponse.success(affectedCount);
  }

  @PatchMapping("/bulk/restore")
  @Transactional
  public ApiResponse<Integer> bulkRestore(
      @CurrentUserId String userId, @RequestBody @Valid BulkNoteRequest req) {

    int affectedCount = noteRepository.bulkRestore(userId, req.ids(), Instant.now());
    return ApiResponse.success(affectedCount);
  }

  @DeleteMapping("/bulk")
  @Transactional
  public ApiResponse<Integer> bulkDeletePermanent(
      @CurrentUserId String userId, @RequestBody @Valid BulkNoteRequest req) {

    int affectedCount = noteRepository.bulkDeletePermanent(userId, req.ids());
    return ApiResponse.success(affectedCount);
  }
}
