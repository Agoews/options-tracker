"use client";

import type { Route } from "next";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type { MutationErrorResponse, MutationSuccessResponse } from "@/lib/server/mutation-response";

export async function readMutationResponse(response: Response) {
  return (await response.json().catch(() => null)) as (MutationSuccessResponse | MutationErrorResponse | null);
}

export async function readMutationError(response: Response, fallback: string) {
  const payload = (await readMutationResponse(response)) as MutationErrorResponse | null;

  return {
    message: payload?.error ?? fallback,
    fieldErrors: payload?.fieldErrors ?? {},
    code: payload?.code,
  };
}

export function applyFieldErrors<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  fieldErrors: Record<string, string>,
) {
  for (const [field, message] of Object.entries(fieldErrors)) {
    setError(field as Path<TFieldValues>, { type: "server", message });
  }
}

export function withStatus(pathname: string, currentSearch: URLSearchParams | ReadonlyURLSearchParams, status: string) {
  const next = new URLSearchParams(currentSearch.toString());
  next.set("status", status);
  const query = next.toString();

  return (query ? `${pathname}?${query}` : pathname) as Route;
}
