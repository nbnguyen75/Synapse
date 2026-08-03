package com.synapse.notes.common.exception;

import com.synapse.notes.common.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  /** 1. Lỗi nghiệp vụ chủ động (Custom Business Exceptions) */
  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex) {
    log.warn("Business Logic Exception: [{}] - {}", ex.getErrorCode().name(), ex.getMessage());

    return ResponseEntity.status(ex.getErrorCode().getHttpStatus())
        .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
  }

  /** 2. Lỗi Validation DTO (@Valid Request Body) */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
    List<ApiResponse.FieldError> details =
        ex.getBindingResult().getFieldErrors().stream()
            .map(f -> new ApiResponse.FieldError(f.getField(), f.getDefaultMessage()))
            .toList();

    log.warn("Validation failed: User sent bad data again.");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.validationError(details));
  }

  /** 3. Lỗi Validation Query/Path Params (@Validated) */
  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
      ConstraintViolationException ex) {
    List<ApiResponse.FieldError> details =
        ex.getConstraintViolations().stream()
            .map(v -> new ApiResponse.FieldError(v.getPropertyPath().toString(), v.getMessage()))
            .toList();

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.validationError(details));
  }

  /** 4. Bổ sung: Lỗi Payload JSON bị hỏng / Thiếu ngoặc / Trailing comma */
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(
      HttpMessageNotReadableException ex) {
    String message =
        "Malformed JSON syntax. Did you forget a closing bracket or leave a trailing comma? We've all been there.";
    log.warn("Invalid JSON payload received.");

    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error(ErrorCode.VALIDATION_ERROR, message));
  }

  /** 5. Bổ sung: Thiếu Query Parameter bắt buộc */
  @ExceptionHandler(MissingServletRequestParameterException.class)
  public ResponseEntity<ApiResponse<Void>> handleMissingParam(
      MissingServletRequestParameterException ex) {
    String message =
        String.format(
            "Required parameter '%s' is missing. Don't leave us hanging!", ex.getParameterName());
    log.warn(message);

    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error(ErrorCode.VALIDATION_ERROR, message));
  }

  /** 6. Xử lý truyền sai kiểu dữ liệu (Type Mismatch) */
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
      MethodArgumentTypeMismatchException ex) {
    String requiredType =
        ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
    String message =
        String.format(
            "Type mismatch! Parameter '%s' received '%s', but expected a '%s'. You can't cast wishes into data types!",
            ex.getName(), ex.getValue(), requiredType);

    log.warn(message);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error(ErrorCode.VALIDATION_ERROR, message));
  }

  /** 7. Xử lý 404 (Route Not Found) - Dev Meme "Worked on Localhost" */
  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleNotFound(NoHandlerFoundException ex) {
    String message =
        String.format(
            "404 Not Found: %s %s doesn't exist. It probably worked fine on localhost, though!",
            ex.getHttpMethod(), ex.getRequestURL());

    log.warn(message);
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.error(ErrorCode.ROUTE_NOT_FOUND, message));
  }

  /** 8. Xử lý 405 (Method Not Allowed) - Sửa lại tiếng Anh tự nhiên hơn */
  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ApiResponse<Void>> handleMethodNotAllowed(
      HttpRequestMethodNotSupportedException ex) {
    String message =
        String.format(
            "HTTP %s is not allowed for this route! Wrong verb. Try knocking with a different HTTP method.",
            ex.getMethod());

    log.warn(message);
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
        .body(ApiResponse.error(ErrorCode.METHOD_NOT_ALLOWED, message));
  }

  /** 9. Xử lý 500 (Unhandled Error) - Huyền thoại "Worked on my machine" */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
    log.error("Unhandled exception caught in GlobalExceptionHandler: ", ex);

    String message =
        "500 Internal Server Error: Something broke. Strange... it worked on my local machine! ¯\\_(ツ)_/¯";

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.error(ErrorCode.INTERNAL_ERROR, message));
  }
}
