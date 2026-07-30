package com.synapse.notes.note;

import com.synapse.notes.common.utils.SortSupport;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.Set;
import org.springframework.data.domain.Pageable;

public record NoteQueryParams(
    String q,
    Boolean archived,
    Boolean trashed,
    Boolean favorite,
    @Min(value = 0, message = "Page index must be >= 0") Integer page,
    @Min(value = 1, message = "Page size must be at least 1")
        @Max(value = 100, message = "Page size must not exceed 100")
        Integer pageSize,
    String sort) {

  public NoteQueryParams {
    page = (page == null || page < 0) ? 0 : page;
    pageSize = (pageSize == null || pageSize <= 0) ? 20 : (pageSize > 100 ? 100 : pageSize);
    sort = (sort == null || sort.isBlank()) ? "pinned,desc,updatedAt,desc" : sort;

    // Default: Show active (non-trashed, non-archived) notes unless explicitly requested
    archived = (archived == null) ? false : archived;
    trashed = (trashed == null) ? false : trashed;
  }

  public Pageable toPageable(Set<String> allowedSortFields) {
    return SortSupport.toPageable(page, pageSize, sort, allowedSortFields);
  }
}
