"use client";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return response.json();
};

interface Trade {
  tradeid: number;
  ticker: string;
  strategy: string;
  strike: number;
  closingprice?: number;
  expirationdate: string;
  open: boolean;
}

const Chart = () => {
  const { data, error, isLoading } = useSWR("/api/get-trades", fetcher);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  const trades: Trade[] = data.result.rows;
  console.log(
    trades.map((trade) => {
      return trade.ticker;
    })
  );

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0]; // Splits at 'T' and takes the first part (date)
  };

  return (
    <table className="table table-xs table-pin-rows table-pin-cols">
      <thead>
        <tr className="bg-slate-400 text-slate-800">
          <td>Company</td>
          <td>Strike Price</td>
          <td>Expiration Date</td>
        </tr>
      </thead>
      <tbody className="text-slate-200">
        {trades.map((trade) => (
          <tr
            key={trade.tradeid}
            className="hover:bg-slate-700 hover:text-slate-200"
          >
            <td>{trade.ticker}</td>
            <td>{trade.strike}</td>
            <td>{formatDate(trade.expirationdate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Chart;
