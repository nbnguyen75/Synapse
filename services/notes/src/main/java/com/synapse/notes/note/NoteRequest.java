package com.synapse.notes.note;

import jakarta.validation.constraints.NotBlank;

public record NoteRequest(@NotBlank(message = "Title is required") String title, String content) {}
