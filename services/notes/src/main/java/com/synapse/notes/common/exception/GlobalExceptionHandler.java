package com.synapse.notes.common.exception;

import com.synapse.notes.common.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex) {
    log.warn("API exception: {} - {}", ex.getErrorCode().name(), ex.getMessage());

    return ResponseEntity.status(ex.getErrorCode().getHttpStatus())
        .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
    List<ApiResponse.FieldError> details =
        ex.getBindingResult().getFieldErrors().stream()
            .map(f -> new ApiResponse.FieldError(f.getField(), f.getDefaultMessage()))
            .toList();

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.validationError(details));
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
      MethodArgumentTypeMismatchException ex) {
    String message =
        String.format(
            "Tried putting a square peg in a round hole? Parameter '%s' got '%s' and is totally confused.",
            ex.getName(), ex.getValue());

    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error(ErrorCode.VALIDATION_ERROR, message));
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
      ConstraintViolationException ex) {
    List<ApiResponse.FieldError> details =
        ex.getConstraintViolations().stream()
            .map(v -> new ApiResponse.FieldError(v.getPropertyPath().toString(), v.getMessage()))
            .toList();

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.validationError(details));
  }

  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleNotFound(NoHandlerFoundException ex) {
    String message =
        String.format(
            "We searched high and low, but %s %s doesn't exist in this dimension.",
            ex.getHttpMethod(), ex.getRequestURL());

    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.error(ErrorCode.ROUTE_NOT_FOUND, message));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ApiResponse<Void>> handleMethodNotAllowed(
      HttpRequestMethodNotSupportedException ex) {
    String message =
        String.format(
            "You can't %s here! Try knocking on this endpoint with a different HTTP verb.",
            ex.getMethod());

    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
        .body(ApiResponse.error(ErrorCode.METHOD_NOT_ALLOWED, message));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
    log.error("Unexpected error", ex);

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(
            ApiResponse.error(
                ErrorCode.INTERNAL_ERROR,
                "Our service is cooked 🍳. Engineers have been dispatched!"));
  }
}
