import { OptionType, StrategyType, TradeEventType } from "@prisma/client";
import { z } from "zod";

import { usTimezones } from "@/lib/domain/timezones";

export const onboardingSchema = z.object({
  displayName: z.string().min(2).max(60),
  timezone: z.enum(usTimezones.map((entry) => entry.value) as [string, ...string[]]),
  baseCurrency: z.string().length(3),
  defaultAccountLabel: z.string().min(2).max(32),
  experienceLevel: z.enum(["new", "intermediate", "advanced"]),
});

export const createTradeSchema = z
  .object({
    ticker: z.string().min(1).max(8).transform((value) => value.toUpperCase()),
    accountLabel: z.string().max(32).optional(),
    strategy: z.nativeEnum(StrategyType),
    openedAt: z.coerce.date(),
    expiration: z.coerce.date().optional(),
    strikePrice: z.coerce.number().positive().optional(),
    contracts: z.coerce.number().int().min(1).max(100),
    entryPer: z.coerce.number(),
    exitPer: z.coerce.number().optional(),
    closedAt: z.coerce.date().optional(),
    thesis: z.string().max(500).optional(),
    holdingLotId: z.string().optional(),
  })
  .refine((data) => !data.exitPer || !!data.closedAt, {
    message: "Closed at is required when exit price is provided",
    path: ["closedAt"],
  })
  .refine((data) => !data.closedAt || data.exitPer !== undefined, {
    message: "Exit price is required when closed at is provided",
    path: ["exitPer"],
  });

export const appendTradeEventSchema = z.object({
  type: z.nativeEnum(TradeEventType),
  occurredAt: z.coerce.date(),
  optionType: z.nativeEnum(OptionType).optional(),
  contractsDelta: z.coerce.number().int().optional(),
  sharesDelta: z.coerce.number().int().optional(),
  strikePrice: z.coerce.number().positive().optional(),
  expiration: z.coerce.date().optional(),
  premium: z.coerce.number().optional(),
  fees: z.coerce.number().min(0).optional(),
  realizedPnl: z.coerce.number().optional(),
  underlyingPrice: z.coerce.number().positive().optional(),
  sharePrice: z.coerce.number().positive().optional(),
  notes: z.string().max(1000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createHoldingSchema = z.object({
  ticker: z.string().min(1).max(8).transform((value) => value.toUpperCase()),
  quantity: z.coerce.number().int().positive(),
  costBasisPerShare: z.coerce.number().positive(),
  notes: z.string().max(1000).optional(),
  openedAt: z.coerce.date(),
});

export const closeHoldingSchema = z.object({
  quantityToSell: z.coerce.number().int().positive(),
  salePrice: z.coerce.number().positive(),
  soldAt: z.coerce.date(),
  notes: z.string().max(1000).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CreateTradeFormValues = z.infer<typeof createTradeSchema>;
export type AppendTradeEventFormValues = z.infer<typeof appendTradeEventSchema>;
export type CreateHoldingFormValues = z.infer<typeof createHoldingSchema>;
export type CloseHoldingFormValues = z.infer<typeof closeHoldingSchema>;
