package com.synapse.notes.security;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.synapse.notes.common.exception.ErrorCode;
import com.synapse.notes.common.response.ApiResponse;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

   private final ObjectMapper objectMapper;

   public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
      this.objectMapper = objectMapper;
   }

   @Override
   public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
         throws IOException, ServletException {

      ErrorCode errorCode = resolveErrorCode(authException);

      ApiResponse<Void> body = ApiResponse.error(errorCode, authException.getMessage());

      response.setStatus(errorCode.getHttpStatus().value());
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      objectMapper.writeValue(response.getWriter(), body);
   }

   private ErrorCode resolveErrorCode(AuthenticationException ex) {
      if (ex instanceof InvalidBearerTokenException) {
         String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
         if (msg.contains("expired")) {
            return ErrorCode.AUTH_TOKEN_EXPIRED;
         }
      }
      return ErrorCode.UNAUTHORIZED;
   }

}
