export const PAGE_STATUS_MESSAGES = {
  "trade-created": {
    tone: "success",
    title: "Trade created",
    description: "The opening trade was recorded and its lifecycle is ready to manage.",
  },
  "trade-lifecycle-updated": {
    tone: "success",
    title: "Lifecycle updated",
    description: "The option event was recorded and the trade summary was refreshed.",
  },
  "trade-archived": {
    tone: "success",
    title: "Trade archived",
    description: "The trade was removed from normal views but its history was preserved.",
  },
  "trade-restored": {
    tone: "success",
    title: "Trade restored",
    description: "The trade is visible in normal views again.",
  },
  "trade-deleted": {
    tone: "success",
    title: "Trade deleted",
    description: "The accidental trade entry was removed permanently.",
  },
  "holding-closed": {
    tone: "success",
    title: "Holding updated",
    description: "The share sale was recorded against the selected lot.",
  },
  "covered-call-created": {
    tone: "success",
    title: "Covered call opened",
    description: "The covered call was linked to the holding lot and reserved those shares.",
  },
  "holding-archived": {
    tone: "success",
    title: "Holding archived",
    description: "The lot was removed from normal views but its basis history was preserved.",
  },
  "holding-restored": {
    tone: "success",
    title: "Holding restored",
    description: "The lot is visible in normal views again.",
  },
  "holding-deleted": {
    tone: "success",
    title: "Holding deleted",
    description: "The accidental holding entry was removed permanently.",
  },
  "onboarding-saved": {
    tone: "success",
    title: "Workspace configured",
    description: "Your defaults were saved and the dashboard is ready to use.",
  },
} as const;

export type PageStatusKey = keyof typeof PAGE_STATUS_MESSAGES;

export function getPageStatus(status: string | null | undefined) {
  if (!status || !(status in PAGE_STATUS_MESSAGES)) {
    return null;
  }

  return PAGE_STATUS_MESSAGES[status as PageStatusKey];
}
