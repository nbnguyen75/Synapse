package com.synapse.notes.note.dto.request;

import com.synapse.notes.note.model.Note;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateNoteRequest(
    @Size(max = Note.MAX_TITLE_LENGTH) String title,
    @NotBlank @Size(max = Note.MAX_CONTENT_LENGTH) String content) {}
