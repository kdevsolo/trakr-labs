"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { useIsClient } from "./use-is-client";

type ClientQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;

export function useClientQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: ClientQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const isClient = useIsClient();

  return useQuery({
    ...options,
    enabled: isClient && (options.enabled ?? true),
  });
}
