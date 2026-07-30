package com.synapse.notes.note;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.Set;
import java.util.UUID;

public record BulkNoteRequest(
    @NotEmpty(message = "Danh sách IDs không được để trống")
        @Size(
            max = 100,
            message =
                "We appreciate your enthusiasm, but 100 notes at a time is where we draw the line.")
        Set<UUID> ids) {}
