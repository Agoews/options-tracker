export interface Trade {
  tradeid: number;
  ticker: string;
  actions: string;
  strategy: string;
  optionprice: number;
  strike: number;
  closingprice: number | null;
  expirationdate: string;
  open: boolean;
  completiondate: string | null;
  totalquantity: number;
  sumClosingPrices: number;
  countClosingPrices: number;
  averageClosingPrice: number | null;
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return response.json();
};
