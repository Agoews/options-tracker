export interface Trade {
  tradeid: number;
  ticker: string;
  strike: number;
  currentprice: number;
  openquantity: number;
  optionprice: number;
  actions: string;
  strategy: string;
  expirationdate: string;
  isclosed: boolean;
  closedtradeid: number;
  closingprice: number | null;
  completiondate: string | null;
  closedquantity: number;
  averageClosingPrice: number | null;
  totalClosingQuantity: number;
  openTrades: Trade[];
  closedTrades: Trade[];
}

export const fetcher = async (url: string) => {
  console.log("url in fetcher: ", url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("An error occurred while fetching the data.");
  }

  return response.json();
};
