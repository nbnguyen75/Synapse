package com.synapse.notes.note;

import com.synapse.notes.common.annotation.CurrentUserId;
import com.synapse.notes.common.exception.ErrorCode;
import com.synapse.notes.common.response.ApiResponse;
import com.synapse.notes.common.response.PageResponse;

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class NoteController {
  private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "updatedAt", "title");

  private final NoteRepository noteRepository;

  public NoteController(NoteRepository noteRepository) {
    this.noteRepository = noteRepository;
  }

  /**
   * GET /?q=meeting&page=0&size=10&sort=createdAt,desc
   */
  @GetMapping("")
  public ApiResponse<PageResponse<Note>> getNotes(@CurrentUserId String userId,
      @Valid @ModelAttribute NoteQueryParams query) {
    Pageable pageable = query.toPageable(ALLOWED_SORT_FIELDS);
    Page<Note> notesPage;

    if (query.q() != null && !query.q().isBlank()) {
      notesPage = noteRepository.findByUserIdAndTitleContainingIgnoreCase(userId, query.q().trim(), pageable);
    } else {
      notesPage = noteRepository.findByUserId(userId, pageable);
    }

    return ApiResponse.success(PageResponse.from(notesPage));
  }

  @GetMapping("/{id}")
  public ApiResponse<Note> get(@CurrentUserId String userId, @PathVariable UUID id) {
    return noteRepository.findByIdAndUserId(id, userId)
        .map(ApiResponse::success)
        .orElseGet(() -> ApiResponse.error(ErrorCode.NOT_FOUND, "Note not found"));
  }

  @PostMapping("")
  public ApiResponse<Note> create(@CurrentUserId String userId, @RequestBody @Valid NoteRequest req) {
    Note note = new Note();
    note.setTitle(req.title());
    note.setContent(req.content());
    note.setUserId(userId);

    return ApiResponse.success(noteRepository.save(note));
  }

  @PutMapping("/{id}")
  public ApiResponse<Note> update(@CurrentUserId String userId, @PathVariable UUID id,
      @RequestBody @Valid NoteRequest req) {
    final var noteOpt = noteRepository.findByIdAndUserId(id, userId);

    if (noteOpt.isEmpty()) {
      return ApiResponse.error(ErrorCode.NOT_FOUND, "Note not found");
    }

    Note note = noteOpt.get();
    note.setTitle(req.title());
    note.setContent(req.content());
    note.setUpdatedAt(Instant.now());

    return ApiResponse.success(noteRepository.save(note));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Object> delete(@CurrentUserId String userId, @PathVariable UUID id) {
    if (!noteRepository.existsByIdAndUserId(id, userId)) {
      return ApiResponse.error(ErrorCode.NOT_FOUND, "Note not found");
    }

    noteRepository.deleteById(id);
    return ApiResponse.success("Note deleted");
  }
}
