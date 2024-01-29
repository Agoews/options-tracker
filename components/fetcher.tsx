export interface Trade {
  tradeid: number;
  ticker: string;
  strategy: string;
  optionprice: number | string;
  strike: number | string;
  closingprice?: number | null;
  expirationdate: string;
  open: boolean;
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return response.json();
};
