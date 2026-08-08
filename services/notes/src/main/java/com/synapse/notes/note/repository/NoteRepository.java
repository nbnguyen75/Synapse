package com.synapse.notes.note.repository;

import com.synapse.notes.note.model.Note;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NoteRepository extends JpaRepository<Note, UUID> {

  @Query(
      """
      SELECT n FROM Note n
      WHERE n.userId = :userId
        AND (:trashed IS NULL OR n.trashed = :trashed)
        AND (:archived IS NULL OR n.archived = :archived)
        AND (:favorite IS NULL OR n.favorite = :favorite)
        AND (
          :q IS NULL OR :q = '' OR
          LOWER(FUNCTION('unaccent', n.title)) LIKE LOWER(CONCAT('%', FUNCTION('unaccent', :q), '%')) OR
          LOWER(FUNCTION('unaccent', n.content)) LIKE LOWER(CONCAT('%', FUNCTION('unaccent', :q), '%'))
        )
      """)
  Page<Note> findNotes(
      @Param("userId") String userId,
      @Param("trashed") Boolean trashed,
      @Param("archived") Boolean archived,
      @Param("favorite") Boolean favorite,
      @Param("q") String q,
      Pageable pageable);

  Optional<Note> findByIdAndUserId(UUID id, String userId);

  boolean existsByIdAndUserId(UUID id, String userId);

  List<Note> findByUserId(String userId);

  @Modifying(clearAutomatically = true)
  @Query("DELETE FROM Note n WHERE n.userId = :userId AND n.trashed = true")
  void deleteAllTrashedByUserId(@Param("userId") String userId);

  @Modifying(clearAutomatically = true)
  @Query("DELETE FROM Note n WHERE n.trashed = true AND n.trashedAt < :cutoff")
  void deleteExpiredTrashedNotes(@Param("cutoff") Instant cutoff);

  @Modifying(clearAutomatically = true)
  @Query(
      """
      UPDATE Note n
      SET n.archived = true, n.pinned = false, n.updatedAt = :now
      WHERE n.userId = :userId AND n.id IN :ids
      """)
  int bulkArchive(
      @Param("userId") String userId,
      @Param("ids") Collection<UUID> ids,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true)
  @Query(
      """
      UPDATE Note n
      SET n.archived = false, n.updatedAt = :now
      WHERE n.userId = :userId AND n.id IN :ids
      """)
  int bulkUnarchive(
      @Param("userId") String userId,
      @Param("ids") Collection<UUID> ids,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true)
  @Query(
      """
      UPDATE Note n
      SET n.trashed = true, n.trashedAt = :now, n.pinned = false, n.updatedAt = :now
      WHERE n.userId = :userId AND n.id IN :ids
      """)
  int bulkTrash(
      @Param("userId") String userId,
      @Param("ids") Collection<UUID> ids,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true)
  @Query(
      """
      UPDATE Note n
      SET n.trashed = false, n.trashedAt = null, n.updatedAt = :now
      WHERE n.userId = :userId AND n.id IN :ids
      """)
  int bulkRestore(
      @Param("userId") String userId,
      @Param("ids") Collection<UUID> ids,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true)
  @Query("DELETE FROM Note n WHERE n.userId = :userId AND n.id IN :ids")
  int bulkDeletePermanent(@Param("userId") String userId, @Param("ids") Collection<UUID> ids);

  @Modifying(clearAutomatically = true)
  @Query(
      """
      UPDATE Note n
      SET n.pinned = :pinned, n.updatedAt = :now
      WHERE n.userId = :userId AND n.id IN :ids AND n.trashed = false
      """)
  int bulkPin(
      @Param("userId") String userId,
      @Param("ids") Collection<UUID> ids,
      @Param("pinned") boolean pinned,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true)
  @Query(
      """
      UPDATE Note n
      SET n.favorite = :favorite, n.updatedAt = :now
      WHERE n.userId = :userId AND n.id IN :ids AND n.trashed = false
      """)
  int bulkFavorite(
      @Param("userId") String userId,
      @Param("ids") Collection<UUID> ids,
      @Param("favorite") boolean favorite,
      @Param("now") Instant now);

  @Query("SELECT n.id FROM Note n WHERE n.userId = :userId AND n.trashed = true")
  List<UUID> findTrashedIdsByUserId(@Param("userId") String userId);

  List<Note> findAllByIdInAndUserId(Collection<UUID> ids, String userId);
}
