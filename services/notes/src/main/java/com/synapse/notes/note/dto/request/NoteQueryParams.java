package com.synapse.notes.note.dto.request;

import com.synapse.notes.common.utils.SortSupport;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
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
    List<String> sort) {

  public NoteQueryParams {
    page = (page == null || page < 0) ? 0 : page;
    pageSize = (pageSize == null || pageSize <= 0) ? 20 : (pageSize > 100 ? 100 : pageSize);
    archived = (archived == null) ? false : archived;
    trashed = (trashed == null) ? false : trashed;

    sort = (sort == null || sort.isEmpty()) ? List.of("pinned,desc", "updatedAt,desc") : sort;
  }

  public Pageable toPageable(Set<String> allowedSortFields) {
    return SortSupport.toPageable(page, pageSize, sort, allowedSortFields);
  }
}
