package com.synapse.notes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import com.synapse.notes.security.RestAccessDeniedHandler;
import com.synapse.notes.security.RestAuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
   private final RestAuthenticationEntryPoint authenticationEntryPoint;
   private final RestAccessDeniedHandler accessDeniedHandler;

   public SecurityConfig(RestAuthenticationEntryPoint authenticationEntryPoint,
         RestAccessDeniedHandler accessDeniedHandler) {
      this.authenticationEntryPoint = authenticationEntryPoint;
      this.accessDeniedHandler = accessDeniedHandler;
   }

   @Bean
   public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
      http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                  .requestMatchers("/actuator/health").permitAll()
                  .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2
                  .jwt(Customizer.withDefaults())
                  .authenticationEntryPoint(authenticationEntryPoint) // 401
                  .accessDeniedHandler(accessDeniedHandler) // 403
            )
            .exceptionHandling(exception -> exception
                  .authenticationEntryPoint(authenticationEntryPoint) // fallback cho request không qua filter jwt (vd:
                  .accessDeniedHandler(accessDeniedHandler));
      return http.build();
   }
}
