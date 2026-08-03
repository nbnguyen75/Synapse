package com.synapse.notes.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
  VALIDATION_ERROR("Invalid input data", HttpStatus.BAD_REQUEST),
  INVALID_SORT_FIELD("Invalid sort field specified", HttpStatus.BAD_REQUEST),
  UNAUTHORIZED("Authentication required", HttpStatus.UNAUTHORIZED),
  FORBIDDEN("Access denied", HttpStatus.FORBIDDEN),
  NOT_FOUND("Resource not found", HttpStatus.NOT_FOUND),
  CONFLICT("Data conflict", HttpStatus.CONFLICT),
  INTERNAL_ERROR("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),

  // Auth & Routing
  AUTH_TOKEN_EXPIRED("Access token has expired", HttpStatus.UNAUTHORIZED),
  AUTH_INVALID_CREDENTIALS("Invalid email or password", HttpStatus.UNAUTHORIZED),
  ROUTE_NOT_FOUND("Route not found", HttpStatus.NOT_FOUND),
  METHOD_NOT_ALLOWED("HTTP method not supported for this route", HttpStatus.METHOD_NOT_ALLOWED),

  // Note Specific Errors
  NOTE_NOT_FOUND("Note not found", HttpStatus.NOT_FOUND),
  NOTE_ACCESS_DENIED("You do not have permission to access this note", HttpStatus.FORBIDDEN);

  private final String defaultMessage;
  private final HttpStatus httpStatus;

  ErrorCode(String defaultMessage, HttpStatus httpStatus) {
    this.defaultMessage = defaultMessage;
    this.httpStatus = httpStatus;
  }

  public String getDefaultMessage() {
    return defaultMessage;
  }

  public HttpStatus getHttpStatus() {
    return httpStatus;
  }
}
