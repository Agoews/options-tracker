import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { logServerError } from "@/lib/server/logger";

export type MutationSuccessResponse = {
  ok: true;
  message?: string;
  redirectTo?: string;
} & Record<string, unknown>;

export type MutationErrorResponse = {
  error: string;
  fieldErrors?: Record<string, string>;
  code?: string;
};

export class MutationError extends Error {
  code?: string;
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, options?: { code?: string; status?: number; fieldErrors?: Record<string, string> }) {
    super(message);
    this.name = "MutationError";
    this.code = options?.code;
    this.status = options?.status ?? 400;
    this.fieldErrors = options?.fieldErrors;
  }
}

function getFieldErrors(error: ZodError) {
  const flattened = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened)
      .map(([field, issues]) => [field, issues?.[0]])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
}

export function mutationSuccess(
  data: Record<string, unknown> = {},
  options?: { message?: string; redirectTo?: string; status?: number },
) {
  return NextResponse.json(
    {
      ok: true,
      ...data,
      ...(options?.message ? { message: options.message } : {}),
      ...(options?.redirectTo ? { redirectTo: options.redirectTo } : {}),
    } satisfies MutationSuccessResponse,
    { status: options?.status ?? 200 },
  );
}

export function mutationFailure(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Check the highlighted fields and try again.",
        fieldErrors: getFieldErrors(error),
        code: "validation_error",
      } satisfies MutationErrorResponse,
      { status: 400 },
    );
  }

  if (error instanceof MutationError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
        ...(error.code ? { code: error.code } : {}),
      } satisfies MutationErrorResponse,
      { status: error.status },
    );
  }

  logServerError("Unexpected mutation failure", error, { fallback });

  return NextResponse.json(
    {
      error: fallback,
      code: "internal_error",
    } satisfies MutationErrorResponse,
    { status: 500 },
  );
}
