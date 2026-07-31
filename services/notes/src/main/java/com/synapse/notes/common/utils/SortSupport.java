package com.synapse.notes.common.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class SortSupport {

  public static Pageable toPageable(
      int page, int pageSize, List<String> sortList, Set<String> allowedSortFields) {
    List<Sort.Order> orders = new ArrayList<>();

    if (sortList != null && !sortList.isEmpty()) {
      for (String sortItem : sortList) {
        if (sortItem == null || sortItem.isBlank()) {
          continue;
        }

        String[] parts = sortItem.split(",");
        String property = parts[0].trim();

        if (allowedSortFields.contains(property)) {
          Sort.Direction direction = Sort.Direction.ASC;
          if (parts.length > 1 && parts[1].trim().equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
          }
          orders.add(new Sort.Order(direction, property));
        }
      }
    }

    Sort sort = orders.isEmpty() ? Sort.unsorted() : Sort.by(orders);
    return PageRequest.of(page, pageSize, sort);
  }
}
