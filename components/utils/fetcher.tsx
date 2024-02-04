export interface Trade {
  tradeid: number;
  ticker: string;
  actions: string;
  strategy: string;
  optionprice: number;
  strike: number;
  closingprice: number | null;
  expirationdate: string;
  completiondate: string | null;
  openquantity: number;
  closedquantity: number;
  sumClosingPrices: number;
  countClosingPrices: number;
  averageClosingPrice: number | null;
  openTrades: Trade[];
  closedTrades: Trade[];
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return response.json();
};
