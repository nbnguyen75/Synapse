import type {
  CompanionConversation,
  CompanionSettings,
} from '@/features/companion/types/companion';
import type {
  CompanionSettingsPayload,
  ConversationIdParams,
} from '@/features/companion/schemas';
import type { ApiSuccessResponse } from '@/types/response';
import type { EnsureRouter } from '@/lib/fetch';
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
  '/api/v1/ai/settings': {
    $put: {
      response: ApiSuccessResponse<CompanionSettings>;
      body: CompanionSettingsPayload;
    };
    $get: {
      response: ApiSuccessResponse<CompanionSettings>;
    };
  };
  '/api/v1/ai/conversations/:id/favorite': {
    $patch: {
      response: ApiSuccessResponse<null>;
      params: ConversationIdParams;
      body: { favorited: boolean };
    };
  };
  '/api/v1/ai/conversations/:id/messages': {
    $get: {
      response: ApiSuccessResponse<UIMessage[]>;
      params: ConversationIdParams;
    };
  };
  '/api/v1/ai/conversations': {
    $get: {
      response: ApiSuccessResponse<CompanionConversation[]>;
    };
  };
}>;
