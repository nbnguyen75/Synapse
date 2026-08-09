package com.synapse.notes.note.dto.request;

public record PatchNoteRequest(Boolean pinned, Boolean favorite, NoteStatus status) {}
