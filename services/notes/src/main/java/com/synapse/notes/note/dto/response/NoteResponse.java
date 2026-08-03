package com.synapse.notes.note.dto.response;

import com.synapse.notes.note.model.Note;
import java.time.Instant;
import java.util.UUID;

public record NoteResponse(
    UUID id,
    String userId,
    String title,
    String content,
    boolean pinned,
    boolean favorite,
    boolean archived,
    boolean trashed,
    Instant trashedAt,
    Instant createdAt,
    Instant updatedAt) {

  public static NoteResponse from(Note note) {
    return new NoteResponse(
        note.getId(),
        note.getUserId(),
        note.getTitle(),
        note.getContent(),
        note.isPinned(),
        note.isFavorite(),
        note.isArchived(),
        note.isTrashed(),
        note.getTrashedAt(),
        note.getCreatedAt(),
        note.getUpdatedAt());
  }
}
