export function calculateTrackedCapital(baselineValue: number, contributedFunds: number) {
  return baselineValue + contributedFunds;
}

export function calculateBaselineValueForTrackedCapital(trackedCapital: number, contributedFunds: number) {
  return trackedCapital - contributedFunds;
}
