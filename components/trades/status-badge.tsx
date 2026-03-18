import type { TradeStatusValue } from "@/lib/domain/models";

import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: TradeStatusValue }) {
  if (status === "CLOSED") {
    return <Badge variant="default">Closed</Badge>;
  }

  if (status === "ASSIGNED") {
    return <Badge variant="warning">Assigned</Badge>;
  }

  if (status === "PARTIAL") {
    return <Badge variant="neutral">Partial</Badge>;
  }

  return <Badge variant="success">Open</Badge>;
}
