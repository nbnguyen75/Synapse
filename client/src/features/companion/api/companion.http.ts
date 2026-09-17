import type { InferRequestType, InferResponseType } from '@/lib/fetch';

import { $fetch } from '@/lib/fetch';

export type GetConversationsRequest = InferRequestType<typeof $fetch.api.v1.ai.conversations.$get>;
export type GetConversationsResponse = InferResponseType<
  typeof $fetch.api.v1.ai.conversations.$get
>['data'];

export async function getConversationsClient() {
  const result = await $fetch.api.v1.ai.conversations.$get();

  return result.data;
}

export type GetConversationMessagesRequest = InferRequestType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['messages']['$get']
>;
export type GetConversationMessagesResponse = InferResponseType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['messages']['$get']
>['data'];

export async function getConversationMessagesClient(args: GetConversationMessagesRequest) {
  const result = await $fetch.api.v1.ai.conversations[':id'].messages.$get(args);

  return result.data;
}

export type RenameConversationRequest = InferRequestType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['$patch']
>;
export type RenameConversationResponse = InferResponseType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['$patch']
>['data'];

export async function renameConversationClient(args: RenameConversationRequest) {
  const result = await $fetch.api.v1.ai.conversations[':id'].$patch(args);

  return result.data;
}

export type DeleteConversationRequest = InferRequestType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['$delete']
>;
export type DeleteConversationResponse = InferResponseType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['$delete']
>['data'];

export async function deleteConversationClient(args: DeleteConversationRequest) {
  const result = await $fetch.api.v1.ai.conversations[':id'].$delete(args);

  return result.data;
}

export type ToggleConversationFavoriteRequest = InferRequestType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['favorite']['$patch']
>;
export type ToggleConversationFavoriteResponse = InferResponseType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['favorite']['$patch']
>['data'];

export async function toggleConversationFavoriteClient(args: ToggleConversationFavoriteRequest) {
  const result = await $fetch.api.v1.ai.conversations[':id'].favorite.$patch(args);

  return result.data;
}

export type CloneConversationRequest = InferRequestType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['clone']['$post']
>;
export type CloneConversationResponse = InferResponseType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['clone']['$post']
>['data'];

export async function cloneConversationClient(args: CloneConversationRequest) {
  const result = await $fetch.api.v1.ai.conversations[':id'].clone.$post(args);

  return result.data;
}

export type SetCurrentMessageRequest = InferRequestType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['current-message']['$patch']
>;
export type SetCurrentMessageResponse = InferResponseType<
  (typeof $fetch.api.v1.ai.conversations)[':id']['current-message']['$patch']
>['data'];

export async function setCurrentMessageClient(args: SetCurrentMessageRequest) {
  const result = await $fetch.api.v1.ai.conversations[':id']['current-message'].$patch(args);

  return result.data;
}

export type GetCompanionSettingsResponse = InferResponseType<
  typeof $fetch.api.v1.ai.settings.$get
>['data'];

export async function getCompanionSettingsClient() {
  const result = await $fetch.api.v1.ai.settings.$get();

  return result.data;
}

export type UpdateCompanionSettingsRequest = InferRequestType<
  typeof $fetch.api.v1.ai.settings.$put
>;
export type UpdateCompanionSettingsResponse = InferResponseType<
  typeof $fetch.api.v1.ai.settings.$put
>['data'];

export async function updateCompanionSettingsClient(args: UpdateCompanionSettingsRequest) {
  const result = await $fetch.api.v1.ai.settings.$put(args);

  return result.data;
}
