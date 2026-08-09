package com.synapse.notes.note.controller;

import com.synapse.notes.common.annotation.CurrentUserId;
import com.synapse.notes.common.response.ApiResponse;
import com.synapse.notes.common.response.PageResponse;
import com.synapse.notes.note.dto.request.BulkActionRequest;
import com.synapse.notes.note.dto.request.CreateNoteRequest;
import com.synapse.notes.note.dto.request.NoteQueryParams;
import com.synapse.notes.note.dto.request.PatchNoteRequest;
import com.synapse.notes.note.dto.request.UpdateNoteRequest;
import com.synapse.notes.note.dto.response.NoteResponse;
import com.synapse.notes.note.service.NoteService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class NoteController {
  private final NoteService noteService;

  /**
   * Filter notes by state (active by default, or archived/trashed/favorite via query params) GET
   * /?q=meeting&archived=false&trashed=false&page=0&size=10&sort=pinned,desc,updatedAt,desc
   */
  @GetMapping("")
  public ApiResponse<PageResponse<NoteResponse>> getNotes(
      @CurrentUserId String userId, @Valid @ModelAttribute NoteQueryParams query) {

    return ApiResponse.success(noteService.getNotes(userId, query));
  }

  @GetMapping("/{id}")
  public ApiResponse<NoteResponse> get(@CurrentUserId String userId, @PathVariable UUID id) {
    return ApiResponse.success(noteService.getNoteById(userId, id));
  }

  @PostMapping("")
  public ApiResponse<NoteResponse> create(
      @CurrentUserId String userId, @RequestBody @Valid CreateNoteRequest req) {
    return ApiResponse.success(noteService.createNote(userId, req));
  }

  @PutMapping("/{id}")
  public ApiResponse<NoteResponse> update(
      @CurrentUserId String userId,
      @PathVariable UUID id,
      @RequestBody @Valid UpdateNoteRequest req) {
    return ApiResponse.success(noteService.updateNote(userId, id, req));
  }

  @PatchMapping("/{id}")
  public ApiResponse<NoteResponse> patchNote(
      @CurrentUserId String userId,
      @PathVariable UUID id,
      @RequestBody @Valid PatchNoteRequest req) {
    return ApiResponse.success(noteService.patchNote(userId, id, req));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Object> delete(@CurrentUserId String userId, @PathVariable UUID id) {
    noteService.deleteNotePermanent(userId, id);
    return ApiResponse.success(null);
  }

  @DeleteMapping("/trash")
  public ApiResponse<Object> emptyTrash(@CurrentUserId String userId) {
    noteService.emptyTrash(userId);
    return ApiResponse.success(null);
  }

  @PostMapping("/bulk/actions")
  public ApiResponse<Integer> executeBulkAction(
      @CurrentUserId String userId, @RequestBody @Valid BulkActionRequest req) {
    int affected = noteService.executeBulkAction(userId, req.ids(), req.action());
    return ApiResponse.success(affected);
  }
}
