package com.synapse.notes.note;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateNoteRequest(
    @NotBlank @Size(max = Note.MAX_TITLE_LENGTH) String title,
    @NotBlank @Size(max = Note.MAX_CONTENT_LENGTH) String content) {}
