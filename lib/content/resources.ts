export const strategyResources = [
  {
    slug: "wheel-strategy",
    title: "Wheel Strategy",
    summary: "Cycle through short puts, assignment, covered calls, and final exits with a consistent audit trail.",
    bullets: [
      "Sell cash-secured puts at defined deltas and earnings rules.",
      "Track assignment-adjusted basis before the covered-call phase begins.",
      "Log rolls, partial closes, and called-away exits without rewriting history.",
    ],
  },
  {
    slug: "covered-calls",
    title: "Covered Calls",
    summary: "Systematically monetize stock lots while preserving basis visibility and assignment risk.",
    bullets: [
      "Match calls to eligible share lots.",
      "Measure call premium separately from stock gains.",
      "Flag ex-dividend and upside-capping risk in the journal.",
    ],
  },
  {
    slug: "cash-secured-puts",
    title: "Cash-Secured Puts",
    summary: "Capture entry premium while treating cash collateral, assignment probability, and basis as first-class data.",
    bullets: [
      "Separate premium income from eventual stock ownership.",
      "Track strike selection versus support and implied volatility.",
      "Roll defensively without obscuring the original thesis.",
    ],
  },
  {
    slug: "directional-options",
    title: "Standalone Calls and Puts",
    summary: "Journal long and short directional option trades with clear risk, duration, and exit metadata.",
    bullets: [
      "Store debit or credit entry, Greeks notes, and catalyst context.",
      "Review win rate by strategy and expiration window.",
      "Analyze partial profit-taking and reopen patterns.",
    ],
  },
];
