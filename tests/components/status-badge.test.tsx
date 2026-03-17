import { render, screen } from "@testing-library/react";
import { TradeStatus } from "@prisma/client";

import { StatusBadge } from "@/components/trades/status-badge";

describe("StatusBadge", () => {
  it("renders assigned status text", () => {
    render(<StatusBadge status={TradeStatus.ASSIGNED} />);
    expect(screen.getByText("Assigned")).toBeInTheDocument();
  });
});
