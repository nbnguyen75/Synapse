package com.synapse.notes.note.event;

import java.util.UUID;

public record NoteCreatedEvent(UUID noteId, String content) {}
