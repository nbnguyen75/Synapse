import { createAuthClient } from 'better-auth/react';

import { m } from '@/paraglides/messages';
import { env } from '@/env';

export const authClient = createAuthClient({
   baseURL: env.VITE_API_URL,
});

export const { useSession, signOut, signIn, signUp } = authClient;

export type AuthSession = typeof authClient.$Infer.Session;
export type AuthUser = typeof authClient.$Infer.Session.user;

export type AuthErrorCode = keyof typeof authClient.$ERROR_CODES;

export function getTranslatedAuthErrorMessage(code: AuthErrorCode) {
   switch (code) {
      case 'USER_NOT_FOUND':
         return m.auth_error_code_USER_NOT_FOUND();
      case 'FAILED_TO_CREATE_USER':
         return m.auth_error_code_FAILED_TO_CREATE_USER();
      case 'FAILED_TO_CREATE_SESSION':
         return m.auth_error_code_FAILED_TO_CREATE_SESSION();
      case 'FAILED_TO_UPDATE_USER':
         return m.auth_error_code_FAILED_TO_UPDATE_USER();
      case 'FAILED_TO_GET_SESSION':
         return m.auth_error_code_FAILED_TO_GET_SESSION();
      case 'INVALID_PASSWORD':
         return m.auth_error_code_INVALID_PASSWORD();
      case 'INVALID_EMAIL':
         return m.auth_error_code_INVALID_EMAIL();
      case 'INVALID_EMAIL_OR_PASSWORD':
         return m.auth_error_code_INVALID_EMAIL_OR_PASSWORD();
      case 'INVALID_USER':
         return m.auth_error_code_INVALID_USER();
      case 'SOCIAL_ACCOUNT_ALREADY_LINKED':
         return m.auth_error_code_SOCIAL_ACCOUNT_ALREADY_LINKED();
      case 'PROVIDER_NOT_FOUND':
         return m.auth_error_code_PROVIDER_NOT_FOUND();
      case 'INVALID_TOKEN':
         return m.auth_error_code_INVALID_TOKEN();
      case 'TOKEN_EXPIRED':
         return m.auth_error_code_TOKEN_EXPIRED();
      case 'ID_TOKEN_NOT_SUPPORTED':
         return m.auth_error_code_ID_TOKEN_NOT_SUPPORTED();
      case 'FAILED_TO_GET_USER_INFO':
         return m.auth_error_code_FAILED_TO_GET_USER_INFO();
      case 'USER_EMAIL_NOT_FOUND':
         return m.auth_error_code_USER_EMAIL_NOT_FOUND();
      case 'EMAIL_NOT_VERIFIED':
         return m.auth_error_code_EMAIL_NOT_VERIFIED();
      case 'PASSWORD_TOO_SHORT':
         return m.auth_error_code_PASSWORD_TOO_SHORT();
      case 'PASSWORD_TOO_LONG':
         return m.auth_error_code_PASSWORD_TOO_LONG();
      case 'USER_ALREADY_EXISTS':
         return m.auth_error_code_USER_ALREADY_EXISTS();
      case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
         return m.auth_error_code_USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL();
      case 'EMAIL_CAN_NOT_BE_UPDATED':
         return m.auth_error_code_EMAIL_CAN_NOT_BE_UPDATED();
      case 'CREDENTIAL_ACCOUNT_NOT_FOUND':
         return m.auth_error_code_CREDENTIAL_ACCOUNT_NOT_FOUND();
      case 'SESSION_EXPIRED':
         return m.auth_error_code_SESSION_EXPIRED();
      case 'FAILED_TO_UNLINK_LAST_ACCOUNT':
         return m.auth_error_code_FAILED_TO_UNLINK_LAST_ACCOUNT();
      case 'ACCOUNT_NOT_FOUND':
         return m.auth_error_code_ACCOUNT_NOT_FOUND();
      case 'USER_ALREADY_HAS_PASSWORD':
         return m.auth_error_code_USER_ALREADY_HAS_PASSWORD();
      case 'CROSS_SITE_NAVIGATION_LOGIN_BLOCKED':
         return m.auth_error_code_CROSS_SITE_NAVIGATION_LOGIN_BLOCKED();
      case 'VERIFICATION_EMAIL_NOT_ENABLED':
         return m.auth_error_code_VERIFICATION_EMAIL_NOT_ENABLED();
      case 'EMAIL_ALREADY_VERIFIED':
         return m.auth_error_code_EMAIL_ALREADY_VERIFIED();
      case 'EMAIL_MISMATCH':
         return m.auth_error_code_EMAIL_MISMATCH();
      case 'SESSION_NOT_FRESH':
         return m.auth_error_code_SESSION_NOT_FRESH();
      case 'LINKED_ACCOUNT_ALREADY_EXISTS':
         return m.auth_error_code_LINKED_ACCOUNT_ALREADY_EXISTS();
      case 'INVALID_ORIGIN':
         return m.auth_error_code_INVALID_ORIGIN();
      case 'INVALID_CALLBACK_URL':
         return m.auth_error_code_INVALID_CALLBACK_URL();
      case 'INVALID_REDIRECT_URL':
         return m.auth_error_code_INVALID_REDIRECT_URL();
      case 'INVALID_ERROR_CALLBACK_URL':
         return m.auth_error_code_INVALID_ERROR_CALLBACK_URL();
      case 'INVALID_NEW_USER_CALLBACK_URL':
         return m.auth_error_code_INVALID_NEW_USER_CALLBACK_URL();
      case 'MISSING_OR_NULL_ORIGIN':
         return m.auth_error_code_MISSING_OR_NULL_ORIGIN();
      case 'CALLBACK_URL_REQUIRED':
         return m.auth_error_code_CALLBACK_URL_REQUIRED();
      case 'FAILED_TO_CREATE_VERIFICATION':
         return m.auth_error_code_FAILED_TO_CREATE_VERIFICATION();
      case 'FIELD_NOT_ALLOWED':
         return m.auth_error_code_FIELD_NOT_ALLOWED();
      case 'ASYNC_VALIDATION_NOT_SUPPORTED':
         return m.auth_error_code_ASYNC_VALIDATION_NOT_SUPPORTED();
      case 'VALIDATION_ERROR':
         return m.auth_error_code_VALIDATION_ERROR();
      case 'MISSING_FIELD':
         return m.auth_error_code_MISSING_FIELD();
      case 'METHOD_NOT_ALLOWED_DEFER_SESSION_REQUIRED':
         return m.auth_error_code_METHOD_NOT_ALLOWED_DEFER_SESSION_REQUIRED();
      case 'BODY_MUST_BE_AN_OBJECT':
         return m.auth_error_code_BODY_MUST_BE_AN_OBJECT();
      case 'PASSWORD_ALREADY_SET':
         return m.auth_error_code_PASSWORD_ALREADY_SET();
      default:
         return m.auth_error_code_VALIDATION_ERROR();
   }
}
