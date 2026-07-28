package com.synapse.notes.note;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, UUID> {
  Page<Note> findByUserId(String userId, Pageable pageable);

  Page<Note> findByUserIdAndTitleContainingIgnoreCase(String userId, String keyword, Pageable pageable);

  Optional<Note> findByIdAndUserId(UUID id, String userId);

  // Kiểm tra tồn tại theo ID và UserId
  boolean existsByIdAndUserId(UUID id, String userId);

  List<Note> findByUserId(String userId);
}
