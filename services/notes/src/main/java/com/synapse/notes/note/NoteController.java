package com.synapse.notes.note;

import com.synapse.notes.common.annotation.CurrentUserId;
import com.synapse.notes.common.exception.ErrorCode;
import com.synapse.notes.common.response.ApiResponse;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
  private final NoteRepository noteRepository;

  public NoteController(NoteRepository noteRepository) {
    this.noteRepository = noteRepository;
  }

  @GetMapping("")
  public ApiResponse<List<Note>> getNotes(@CurrentUserId String userId) {
    final var noteList = noteRepository.findByUserId(userId);

    return ApiResponse.success(noteList);
  }

  @GetMapping("/{id}")
  public ApiResponse<Note> get(@PathVariable UUID id) {
    final var noteOpt = noteRepository.findById(id);

    if (noteOpt.isEmpty()) return ApiResponse.error(ErrorCode.NOT_FOUND, "Note not found");

    Note note = noteOpt.get();
    return ApiResponse.success(note);
  }

  @PostMapping("")
  public ApiResponse<Note> create(
      @RequestBody @Valid NoteRequest req, @CurrentUserId String userId) {
    Note note = new Note();
    note.setTitle(req.title());
    note.setContent(req.content());
    note.setUserId(userId);

    return ApiResponse.success(noteRepository.save(note));
  }

  @PutMapping("/{id}")
  public ApiResponse<Note> update(@PathVariable UUID id, @RequestBody @Valid NoteRequest req) {
    final var noteOpt = noteRepository.findById(id);

    if (noteOpt.isEmpty()) return ApiResponse.error(ErrorCode.NOT_FOUND, "Note not found");

    Note note = noteOpt.get();
    note.setTitle(req.title());
    note.setContent(req.content());
    note.setUpdatedAt(Instant.now());

    return ApiResponse.success(noteRepository.save(note));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable UUID id) {
    if (!noteRepository.existsById(id))
      return ApiResponse.error(ErrorCode.NOT_FOUND, "Note not found");

    noteRepository.deleteById(id);
    return ApiResponse.success(null, "Note deleted");
  }
}
