package com.synapse.notes.note;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findByUserId(String userId);
}
