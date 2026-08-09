package com.synapse.notes.note.dto.request;

import com.synapse.notes.note.model.Note;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateNoteRequest(
    @NotBlank(message = "NOTE_TITLE_REQUIRED")
        @Size(max = Note.MAX_TITLE_LENGTH, message = "NOTE_TITLE_TOO_LONG")
        String title,
    @NotBlank(message = "NOTE_CONTENT_REQUIRED")
        @Size(max = Note.MAX_CONTENT_LENGTH, message = "NOTE_CONTENT_TOO_LONG")
        String content) {}
