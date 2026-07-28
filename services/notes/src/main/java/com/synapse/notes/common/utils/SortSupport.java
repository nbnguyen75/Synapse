package com.synapse.notes.common.utils;

import com.synapse.notes.common.exception.ApiException;
import com.synapse.notes.common.exception.ErrorCode;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class SortSupport {

  public static Pageable toPageable(int page, int size, String sort, Set<String> allowedSortFields) {
    if (sort == null || sort.isBlank()) {
      return PageRequest.of(page, size);
    }

    String[] parts = sort.split(",");
    String field = parts[0].trim();

    if (!allowedSortFields.contains(field)) {
      throw new ApiException(ErrorCode.INVALID_SORT_FIELD,
          String.format("We asked the database to sort by '%s', and it just laughed at us.", field));
    }

    Sort.Direction dir = (parts.length > 1 && parts[1].trim().equalsIgnoreCase("asc"))
        ? Sort.Direction.ASC
        : Sort.Direction.DESC;

    return PageRequest.of(page, size, Sort.by(dir, field));
  }
}