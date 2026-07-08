package com.synapse.notes.security;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.synapse.notes.common.exception.ErrorCode;
import com.synapse.notes.common.response.ApiResponse;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

   private final ObjectMapper objectMapper;

   public RestAccessDeniedHandler(ObjectMapper objectMapper) {
      this.objectMapper = objectMapper;
   }

   @Override
   public void handle(HttpServletRequest request, HttpServletResponse response,
         AccessDeniedException accessDeniedException) throws IOException, ServletException {
      ApiResponse<Void> body = ApiResponse.error(ErrorCode.FORBIDDEN, "Access denied");

      response.setStatus(HttpStatus.FORBIDDEN.value());
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      objectMapper.writeValue(response.getWriter(), body);
   }

}
