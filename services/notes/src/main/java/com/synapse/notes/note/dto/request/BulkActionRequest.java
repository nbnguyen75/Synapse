package com.synapse.notes.note.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;
import java.util.UUID;

public record BulkActionRequest(
    @NotEmpty(message = "Danh sách IDs không được để trống")
        @Size(
            max = 100,
            message =
                "We appreciate your enthusiasm, but 100 notes at a time is where we draw the line.")
        Set<UUID> ids,
    @NotNull BulkAction action) {
  public enum BulkAction {
    PIN,
    UNPIN,
    FAVORITE,
    UNFAVORITE,
    ARCHIVE,
    UNARCHIVE,
    TRASH,
    RESTORE,
    DELETE_PERMANENT
  }
}
