package com.synapse.notes.note.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
  public static final int MAX_CONTENT_LENGTH = 1500;
  public static final int MAX_TITLE_LENGTH = 200;

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private String userId;

  @Column
  @Size(max = MAX_TITLE_LENGTH)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  @NotBlank
  @Size(max = MAX_CONTENT_LENGTH)
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

  private Instant trashedAt;

  @Builder.Default
  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  @Builder.Default
  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  public void updateContent(String title, String content) {
    this.title = title;
    this.content = content;
    this.updatedAt = Instant.now();
  }

  public void togglePin() {
    this.pinned = !this.pinned;
    this.updatedAt = Instant.now();
  }

  public void toggleFavorite() {
    this.favorite = !this.favorite;
    this.updatedAt = Instant.now();
  }

  public void archive() {
    this.archived = true;
    this.pinned = false;
    this.updatedAt = Instant.now();
  }

  public void unarchive() {
    this.archived = false;
    this.updatedAt = Instant.now();
  }

  public void moveToTrash() {
    this.trashed = true;
    this.trashedAt = Instant.now();
    this.pinned = false;
    this.updatedAt = Instant.now();
  }

  public void restoreFromTrash() {
    this.trashed = false;
    this.trashedAt = null;
    this.updatedAt = Instant.now();
  }
}
