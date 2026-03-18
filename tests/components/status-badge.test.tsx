import { render, screen } from "@testing-library/react";

import { StatusBadge } from "@/components/trades/status-badge";

describe("StatusBadge", () => {
  it("renders assigned status text", () => {
    render(<StatusBadge status="ASSIGNED" />);
    expect(screen.getByText("Assigned")).toBeInTheDocument();
  });
});
