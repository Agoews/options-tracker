import { z } from "zod";

import { OPTION_TYPES, STRATEGY_TYPES, TRADE_EVENT_TYPES } from "@/lib/domain/models";
import { usTimezones } from "@/lib/domain/timezones";

export const onboardingSchema = z.object({
  displayName: z.string().min(2).max(60),
  timezone: z.enum(usTimezones.map((entry) => entry.value) as [string, ...string[]]),
  baseCurrency: z.string().length(3),
  defaultAccountLabel: z.string().min(2).max(32),
  experienceLevel: z.enum(["new", "intermediate", "advanced"]),
  portfolioBaselineValue: z.coerce.number().nonnegative(),
  portfolioBaselineAt: z.coerce.date(),
});

export const createTradeSchema = z
  .object({
    ticker: z.string().min(1).max(8).transform((value) => value.toUpperCase()),
    accountLabel: z.string().max(32).optional(),
    strategy: z.enum(STRATEGY_TYPES),
    openedAt: z.coerce.date(),
    expiration: z.coerce.date().optional(),
    strikePrice: z.coerce.number().positive().optional(),
    contracts: z.coerce.number().int().min(1),
    entryPer: z.coerce.number().nonnegative(),
    exitPer: z.coerce.number().nonnegative().optional(),
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
  })
  .superRefine((data, ctx) => {
    if (data.strategy !== "STOCK" && data.strikePrice === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["strikePrice"],
        message: "Strike price is required for option strategies.",
      });
    }

    if (data.strategy !== "STOCK" && !data.expiration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiration"],
        message: "Expiration is required for option strategies.",
      });
    }

    if (data.strategy === "COVERED_CALL" && !data.holdingLotId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["holdingLotId"],
        message: "Covered calls must be linked to a holding lot.",
      });
    }

    if (data.closedAt && data.closedAt < data.openedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closedAt"],
        message: "Closed date cannot be earlier than the opened date.",
      });
    }

    if (data.expiration && data.expiration < data.openedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiration"],
        message: "Expiration cannot be earlier than the opened date.",
      });
    }
  });

export const appendTradeEventSchema = z.object({
  type: z.enum(TRADE_EVENT_TYPES),
  occurredAt: z.coerce.date(),
  optionType: z.enum(OPTION_TYPES).optional(),
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

export const archiveEntitySchema = z.object({
  archived: z.boolean(),
});

export const deleteEntitySchema = z.object({
  confirmText: z.literal("DELETE"),
});

export const tradeLifecycleActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("close_option"),
    occurredAt: z.coerce.date(),
    contracts: z.coerce.number().int().positive(),
    premium: z.coerce.number().nonnegative(),
    notes: z.string().max(1000).optional(),
  }),
  z.object({
    action: z.literal("expire_option"),
    occurredAt: z.coerce.date(),
    contracts: z.coerce.number().int().positive(),
    notes: z.string().max(1000).optional(),
  }),
  z.object({
    action: z.literal("roll_option"),
    occurredAt: z.coerce.date(),
    netCredit: z.coerce.number(),
    nextExpiration: z.coerce.date(),
    nextStrikePrice: z.coerce.number().positive(),
    fromEventId: z.string().min(1),
    notes: z.string().max(1000).optional(),
  }),
  z.object({
    action: z.literal("assign_put"),
    occurredAt: z.coerce.date(),
    contracts: z.coerce.number().int().positive(),
    strikePrice: z.coerce.number().positive(),
    notes: z.string().max(1000).optional(),
  }),
  z.object({
    action: z.literal("assign_called_shares"),
    occurredAt: z.coerce.date(),
    contracts: z.coerce.number().int().positive(),
    strikePrice: z.coerce.number().positive(),
    notes: z.string().max(1000).optional(),
  }),
]);

export const setTrackedCapitalSchema = z.object({
  trackedCapital: z.coerce.number().nonnegative(),
});

export const addCapitalAdjustmentSchema = z.object({
  amount: z.coerce.number().refine((value) => value !== 0, {
    message: "Enter a non-zero amount.",
  }),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(60),
  timezone: z.enum(usTimezones.map((entry) => entry.value) as [string, ...string[]]),
  baseCurrency: z.string().length(3),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CreateTradeFormValues = z.infer<typeof createTradeSchema>;
export type AppendTradeEventFormValues = z.infer<typeof appendTradeEventSchema>;
export type CreateHoldingFormValues = z.infer<typeof createHoldingSchema>;
export type CloseHoldingFormValues = z.infer<typeof closeHoldingSchema>;
export type ArchiveEntityFormValues = z.infer<typeof archiveEntitySchema>;
export type DeleteEntityFormValues = z.infer<typeof deleteEntitySchema>;
export type TradeLifecycleActionFormValues = z.infer<typeof tradeLifecycleActionSchema>;
export type SetTrackedCapitalFormValues = z.infer<typeof setTrackedCapitalSchema>;
export type AddCapitalAdjustmentFormValues = z.infer<typeof addCapitalAdjustmentSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
