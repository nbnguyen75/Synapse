package com.synapse.notes.common.response;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.synapse.notes.common.exception.ErrorCode;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        String errorCode,
        List<FieldError> details,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime timestamp) {

    public record FieldError(String field, String message) {
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, null, data, null, null, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, null, null, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return new ApiResponse<>(false, errorCode.getDefaultMessage(), null, errorCode.name(), null,
                LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String customMessage) {
        return new ApiResponse<>(false, customMessage, null, errorCode.name(), null, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> validationError(List<FieldError> details) {
        return new ApiResponse<>(false, "Invalid input data", null, ErrorCode.VALIDATION_ERROR.name(), details,
                LocalDateTime.now());
    }
}
