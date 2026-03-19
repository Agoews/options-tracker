import { createTradeSchema } from "@/lib/domain/schemas";

describe("createTradeSchema", () => {
  it("requires strike price and expiration for option strategies", () => {
    const result = createTradeSchema.safeParse({
      ticker: "AAPL",
      strategy: "WHEEL",
      openedAt: "2026-03-01",
      contracts: 1,
      entryPer: 1.25,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors).toMatchObject({
      strikePrice: ["Strike price is required for option strategies."],
      expiration: ["Expiration is required for option strategies."],
    });
  });

  it("requires a holding lot for covered calls", () => {
    const result = createTradeSchema.safeParse({
      ticker: "AAPL",
      strategy: "COVERED_CALL",
      openedAt: "2026-03-01",
      expiration: "2026-04-18",
      strikePrice: 195,
      contracts: 1,
      entryPer: 1.25,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.holdingLotId).toEqual([
      "Covered calls must be linked to a holding lot.",
    ]);
  });

  it("rejects dates that move backward in time", () => {
    const result = createTradeSchema.safeParse({
      ticker: "AAPL",
      strategy: "SHORT_PUT",
      openedAt: "2026-03-10",
      expiration: "2026-03-01",
      strikePrice: 180,
      contracts: 1,
      entryPer: 1.25,
      exitPer: 0.4,
      closedAt: "2026-03-05",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors).toMatchObject({
      expiration: ["Expiration cannot be earlier than the opened date."],
      closedAt: ["Closed date cannot be earlier than the opened date."],
    });
  });
});
