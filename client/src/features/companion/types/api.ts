import type {
  CompanionSettingsPayload,
  ConversationIdParams,
} from '@/features/companion/schemas';
import type {
  CompanionConversation,
  CompanionSettings,
} from '@/features/companion/types/companion';
import type { EnsureRouter } from '@/lib/fetch';
import type { ApiSuccessResponse } from '@/types/response';
import type { UIMessage } from 'ai';

export type CompanionFetchRouter = EnsureRouter<{
  '/api/v1/ai/conversations/:id': {
    $patch: {
      response: ApiSuccessResponse<null>;
      params: ConversationIdParams;
      body: { title: string };
    };
    $delete: {
      response: ApiSuccessResponse<null>;
      params: ConversationIdParams;
    };
  };
  '/api/v1/ai/conversations/:id/messages': {
    $get: {
      response: ApiSuccessResponse<(UIMessage & { parentId: string | null })[]>;
      query: { offset?: number; limit?: number };
      params: ConversationIdParams;
    };
  };
  '/api/v1/ai/settings': {
    $put: {
      response: ApiSuccessResponse<CompanionSettings>;
      body: CompanionSettingsPayload;
    };
    $get: {
      response: ApiSuccessResponse<CompanionSettings>;
    };
  };
  '/api/v1/ai/conversations/:id/clone': {
    $post: {
      response: ApiSuccessResponse<CompanionConversation>;
      body: { upToMessageId?: string };
      params: ConversationIdParams;
    };
  };
  '/api/v1/ai/conversations/:id/current-message': {
    $patch: {
      response: ApiSuccessResponse<null>;
      params: ConversationIdParams;
      body: { messageId: string };
    };
  };
  '/api/v1/ai/conversations/:id/favorite': {
    $patch: {
      response: ApiSuccessResponse<null>;
      params: ConversationIdParams;
      body: { favorited: boolean };
    };
  };
  '/api/v1/ai/conversations': {
    $get: {
      response: ApiSuccessResponse<CompanionConversation[]>;
    };
  };
}>;
