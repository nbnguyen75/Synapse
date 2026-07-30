package com.synapse.notes.note;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private String userId;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String content;

  @Builder.Default
  @Column(nullable = false)
  private boolean pinned = false;

  @Builder.Default
  @Column(nullable = false)
  private boolean favorite = false;

  @Builder.Default
  @Column(nullable = false)
  private boolean archived = false;

  @Builder.Default
  @Column(nullable = false)
  private boolean trashed = false;

  /**
   * Timestamp for when the note was moved to trash. Useful for scheduled jobs that permanently
   * purge notes older than 30 days.
   */
  private Instant trashedAt;

  @Builder.Default
  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  @Builder.Default
  @Column(nullable = false)
  private Instant updatedAt = Instant.now();
}
