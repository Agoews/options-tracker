import { TradeStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: TradeStatus }) {
  if (status === TradeStatus.CLOSED) {
    return <Badge variant="default">Closed</Badge>;
  }

  if (status === TradeStatus.ASSIGNED) {
    return <Badge variant="warning">Assigned</Badge>;
  }

  if (status === TradeStatus.PARTIAL) {
    return <Badge variant="neutral">Partial</Badge>;
  }

  return <Badge variant="success">Open</Badge>;
}
