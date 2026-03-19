import {
  calculateBaselineValueForTrackedCapital,
  calculateTrackedCapital,
} from "@/lib/domain/portfolio-capital";

describe("portfolio capital helpers", () => {
  it("derives tracked capital from baseline plus contributed funds", () => {
    expect(calculateTrackedCapital(10000, 2500)).toBe(12500);
    expect(calculateTrackedCapital(10000, -750)).toBe(9250);
  });

  it("derives baseline from the desired tracked capital and existing adjustments", () => {
    expect(calculateBaselineValueForTrackedCapital(12500, 2500)).toBe(10000);
    expect(calculateBaselineValueForTrackedCapital(9250, -750)).toBe(10000);
  });
});
