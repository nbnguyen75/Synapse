package com.synapse.notes.common.annotation;

import com.synapse.notes.common.exception.ApiException;
import com.synapse.notes.common.exception.ErrorCode;
import org.jspecify.annotations.Nullable;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

public class CurrentUserIdArgumentResolver implements HandlerMethodArgumentResolver {

  @Override
  public boolean supportsParameter(MethodParameter parameter) {
    return parameter.hasParameterAnnotation(CurrentUserId.class)
        && parameter.getParameterType().equals(String.class);
  }

  @Override
  public Object resolveArgument(
      MethodParameter parameter,
      @Nullable ModelAndViewContainer mavContainer,
      NativeWebRequest webRequest,
      @Nullable WebDataBinderFactory binderFactory)
      throws Exception {
    final var auth = SecurityContextHolder.getContext().getAuthentication();

    if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) {
      throw new ApiException(
          ErrorCode.UNAUTHORIZED, "Who goes there? Show your JWT badge or step away from the API!");
    }

    return jwt.getSubject();
  }
}
