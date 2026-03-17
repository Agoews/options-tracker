import "server-only";

export async function getCurrentPrices(tickers: string[]) {
  const uniqueTickers = [...new Set(tickers.map((ticker) => ticker.toUpperCase()))];
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey || uniqueTickers.length === 0) {
    return new Map<string, number | null>(uniqueTickers.map((ticker) => [ticker, null]));
  }

  const entries = await Promise.all(
    uniqueTickers.map(async (ticker) => {
      try {
        const response = await fetch(
          `https://api.twelvedata.com/price?symbol=${encodeURIComponent(ticker)}&apikey=${encodeURIComponent(apiKey)}`,
          {
            next: { revalidate: 60 },
          },
        );

        if (!response.ok) {
          return [ticker, null] as const;
        }

        const payload = (await response.json()) as {
          price?: string;
          status?: string;
        };

        const price = payload.price ? Number(payload.price) : null;

        return [ticker, Number.isFinite(price) ? price : null] as const;
      } catch {
        return [ticker, null] as const;
      }
    }),
  );

  return new Map(entries);
}
