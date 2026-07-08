package com.synapse.notes.common.exception;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import com.synapse.notes.common.response.ApiResponse;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {
   private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

   @ExceptionHandler(ApiException.class)
   public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex) {
      log.warn("API exception: {} - {}", ex.getErrorCode().name(), ex.getMessage());

      return ResponseEntity
            .status(ex.getErrorCode().getHttpStatus())
            .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
   }

   @ExceptionHandler(MethodArgumentNotValidException.class)
   public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
      List<ApiResponse.FieldError> details = ex.getBindingResult().getFieldErrors().stream()
            .map(f -> new ApiResponse.FieldError(f.getField(), f.getDefaultMessage()))
            .toList();

      return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.validationError(details));
   }

   @ExceptionHandler(ConstraintViolationException.class)
   public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException ex) {
      List<ApiResponse.FieldError> details = ex.getConstraintViolations().stream()
            .map(v -> new ApiResponse.FieldError(
                  v.getPropertyPath().toString(),
                  v.getMessage()))
            .toList();

      return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.validationError(details));
   }

   @ExceptionHandler(NoHandlerFoundException.class)
   public ResponseEntity<ApiResponse<Void>> handleNotFound(NoHandlerFoundException ex) {
      return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ErrorCode.ROUTE_NOT_FOUND,
                  "No handler found for " + ex.getHttpMethod() + " " + ex.getRequestURL()));
   }

   @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
   public ResponseEntity<ApiResponse<Void>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
      return ResponseEntity
            .status(HttpStatus.METHOD_NOT_ALLOWED)
            .body(ApiResponse.error(ErrorCode.METHOD_NOT_ALLOWED, ex.getMessage()));
   }

   @ExceptionHandler(Exception.class)
   public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
      log.error("Unexpected error", ex); // log full stacktrace, không lộ ra response

      return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(ErrorCode.INTERNAL_ERROR, "Our service is cooked"));
   }
}
