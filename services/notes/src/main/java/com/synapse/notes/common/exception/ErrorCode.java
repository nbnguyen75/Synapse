package com.synapse.notes.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    VALIDATION_ERROR("Invalid input data", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("Authentication required", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("Access denied", HttpStatus.FORBIDDEN),
    NOT_FOUND("Resource not found", HttpStatus.NOT_FOUND),
    CONFLICT("Data conflict", HttpStatus.CONFLICT),
    INTERNAL_ERROR("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),

    USER_NOT_FOUND("User not found", HttpStatus.NOT_FOUND),
    USER_EMAIL_DUPLICATE("Email already exists", HttpStatus.CONFLICT),
    ORDER_NOT_FOUND("Order not found", HttpStatus.NOT_FOUND),
    ORDER_ALREADY_CANCELLED("Order has already been cancelled", HttpStatus.CONFLICT),
    PAYMENT_INSUFFICIENT_BALANCE("Insufficient balance", HttpStatus.BAD_REQUEST),
    AUTH_TOKEN_EXPIRED("Access token has expired", HttpStatus.UNAUTHORIZED),
    AUTH_INVALID_CREDENTIALS("Invalid email or password", HttpStatus.UNAUTHORIZED),

    ROUTE_NOT_FOUND("Route not found", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED("HTTP method not supported for this route", HttpStatus.METHOD_NOT_ALLOWED);

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
