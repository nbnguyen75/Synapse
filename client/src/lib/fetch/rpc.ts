import type { ApiErrorResponse } from '@/types/response';
import type z from 'zod/v4';

import { createFetch, type CreateFetchOption } from '@better-fetch/fetch';

import { env } from '@/config/env';

type InferSchema<T> = T extends z.ZodType<infer Output> ? Output : T;

type EndpointDef = {
  headers?: Record<string, undefined | string>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  response?: unknown;
  body?: unknown;
};

type MethodMap = {
  $delete?: EndpointDef;
  $patch?: EndpointDef;
  $post?: EndpointDef;
  $get?: EndpointDef;
  $put?: EndpointDef;
};

type CleanUndefined<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type InferRequest<T extends EndpointDef> = CleanUndefined<{
  headers: 'headers' extends keyof T ? InferSchema<T['headers']> : never;
  params: 'params' extends keyof T ? InferSchema<T['params']> : never;
  query: 'query' extends keyof T ? InferSchema<T['query']> : never;
  body: 'body' extends keyof T ? InferSchema<T['body']> : never;
}>;

type RequestArgs<Endpoint extends EndpointDef> =
  Record<string, never> extends InferRequest<Endpoint>
    ? [options?: InferRequest<Endpoint>]
    : [options: InferRequest<Endpoint>];

type RequestOptions = {
  headers?: Record<string, undefined | string>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
};

type Split<S extends string> = S extends `${infer Head}/${infer Tail}`
  ? Head extends ''
    ? Split<Tail>
    : [Head, ...Split<Tail>]
  : S extends ''
    ? []
    : [S];

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type MethodClient<Methods extends MethodMap, Throw extends boolean> = {
  [M in keyof Methods as Methods[M] extends EndpointDef ? M : never]: Methods[M] extends EndpointDef
    ? (
        ...args: RequestArgs<Methods[M]>
      ) => Promise<
        Throw extends true ? InferResponse<Methods[M]> : RpcResponse<InferResponse<Methods[M]>>
      >
    : never;
};

type BuildBranch<Segments extends readonly string[], Leaf> = Segments extends readonly [
  infer Head extends string,
  ...infer Rest extends readonly string[],
]
  ? Rest extends readonly []
    ? { [K in Head]: Leaf }
    : { [K in Head]: BuildBranch<Rest, Leaf> }
  : never;

type BaseRouter = Record<string, MethodMap>;

type ProxyTree<Router extends BaseRouter, Throw extends boolean = false> = UnionToIntersection<
  {
    [Path in keyof Router]: Path extends string
      ? BuildBranch<Split<Path>, MethodClient<Router[Path], Throw>>
      : never;
  }[keyof Router]
>;

type HttpMethod = 'DELETE' | 'PATCH' | 'POST' | 'GET' | 'PUT';

type RpcResponse<T> = { error: ApiErrorResponse; data: null } | { error: null; data: T };

const METHOD_KEY_MAP: Record<string, HttpMethod> = {
  $delete: 'DELETE',
  $patch: 'PATCH',
  $post: 'POST',
  $get: 'GET',
  $put: 'PUT',
};

export type InferRequestType<T extends (...args: never[]) => unknown> = Parameters<T>[0];

export type InferResponseType<T extends (...args: never[]) => unknown> = Awaited<ReturnType<T>>;

type InferResponse<T extends EndpointDef> = InferSchema<T['response']>;

export type EnsureRouter<T extends BaseRouter> = T;

export type CreateRpcClientOption = Omit<CreateFetchOption, 'baseUrl' | 'body'>;

function createProxyClient(
  makeRequest: (method: HttpMethod, path: string, options?: RequestOptions) => unknown,
  segments: string[] = [],
) {
  return new Proxy(() => {}, {
    get(_target, prop: string) {
      if (prop in METHOD_KEY_MAP) {
        const method = METHOD_KEY_MAP[prop];
        const path = '/' + segments.join('/');
        return (options?: RequestOptions) => makeRequest(method, path, options);
      }
      return createProxyClient(makeRequest, [...segments, prop]);
    },
  });
}

export function createRpcClient<Router extends BaseRouter>(
  baseUrl: undefined | string,
  option: CreateRpcClientOption & { throw: true },
): ProxyTree<Router, true>;

export function createRpcClient<Router extends BaseRouter>(
  baseUrl?: string,
  option?: CreateRpcClientOption,
): ProxyTree<Router>;

export function createRpcClient<Router extends BaseRouter>(
  baseUrl: undefined | string = env.VITE_API_URL,
  option: CreateRpcClientOption = {},
): ProxyTree<Router, boolean> {
  const $fetchBase = createFetch({
    baseURL: baseUrl,
    ...option,
  });

  const makeRequest = (method: HttpMethod, path: string, options?: RequestOptions) => {
    return $fetchBase(path, {
      headers: options?.headers,
      params: options?.params,
      query: options?.query,
      body: options?.body,
      method,
    });
  };

  // The proxy client is intentionally untyped at construction; it is cast to
  // the caller-facing `ProxyTree` type on this boundary.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return createProxyClient(makeRequest) as ProxyTree<Router, boolean>;
}
