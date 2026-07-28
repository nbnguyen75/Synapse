package com.synapse.notes.note;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.Set;
import org.springframework.data.domain.Pageable;

import com.synapse.notes.common.utils.SortSupport;

public record NoteQueryParams(
    String q,
    @Min(value = 0, message = "Page index must be >= 0") 
    Integer page,
    @Min(value = 1, message = "Page size must be at least 1") @Max(value = 100, message = "Page size must not exceed 100") Integer size,
    String sort) {
  
  public NoteQueryParams {
    page = (page == null || page < 0) ? 0 : page;
    size = (size == null || size <= 0) ? 20 : (size > 100 ? 100 : size);
    sort = (sort == null || sort.isBlank()) ? "updatedAt,desc" : sort;
  }

  public Pageable toPageable(Set<String> allowedSortFields) {
    return SortSupport.toPageable(page, size, sort, allowedSortFields);
  }
}