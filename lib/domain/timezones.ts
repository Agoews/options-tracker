export const usTimezones = [
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "America/Anchorage", label: "Alaska Time (US)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (US)" },
] as const;

export type USTimezoneValue = (typeof usTimezones)[number]["value"];

export function getTimezoneLabel(timezone: string) {
  return usTimezones.find((entry) => entry.value === timezone)?.label ?? timezone;
}
