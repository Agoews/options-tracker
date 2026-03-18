import { z } from "zod";

import { MutationError, mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";

describe("mutation-response", () => {
  it("returns structured field errors for zod validation failures", async () => {
    const schema = z.object({
      ticker: z.string().min(1, "Ticker is required."),
      contracts: z.number().positive("Contracts must be greater than zero."),
    });

    const error = schema.safeParse({ ticker: "", contracts: 0 }).error;
    const response = mutationFailure(error, "fallback");
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      error: "Check the highlighted fields and try again.",
      fieldErrors: {
        ticker: "Ticker is required.",
        contracts: "Contracts must be greater than zero.",
      },
      code: "validation_error",
    });
  });

  it("returns mutation error metadata for known business-rule failures", async () => {
    const response = mutationFailure(
      new MutationError("Open assets exceed the tracked portfolio value.", {
        code: "portfolio_capacity_exceeded",
      }),
      "fallback",
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      error: "Open assets exceed the tracked portfolio value.",
      code: "portfolio_capacity_exceeded",
    });
  });

  it("returns success payloads with ok and message", async () => {
    const response = mutationSuccess({ tradeId: "trade_123" }, { status: 201, message: "Trade created." });
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      ok: true,
      tradeId: "trade_123",
      message: "Trade created.",
    });
  });
});
