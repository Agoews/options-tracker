"use client";
import { useState } from "react";
import useSWR from "swr";

interface Trade {
  tradeid: number;
  ticker: string;
  strategy: string;
  optionprice: number;
  strike: number;
  closingprice?: number;
  expirationdate: string;
  open: boolean;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return response.json();
};

const Chart = () => {
  const initialTradeState: Trade = {
    tradeid: 0,
    ticker: "",
    strategy: "",
    optionprice: 0,
    strike: 0,
    expirationdate: "",
    open: false,
  };
  const { data, error, isLoading } = useSWR("/api/get-trades", fetcher);
  const [editingTradeId, setEditingTradeId] = useState<number | null>(null);
  const [editedTrade, setEditedTrade] = useState<Trade>(initialTradeState);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  const trades: Trade[] = data.result.rows;

  const handleRowClick = (trade: Trade) => {
    setEditingTradeId(trade.tradeid);
    setEditedTrade({ ...trade }); // Clone the trade object to edit
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Trade
  ) => {
    setEditedTrade({ ...editedTrade, [field]: e.target.value });
  };

  const handleSave = async () => {
    // Implement logic to save the edited data to the backend
    // Reset the editing state
    console.log("save clicked");
    setEditingTradeId(null);
  };

  const handleCancel = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("cancel clicked");
    e.stopPropagation();
    setEditingTradeId(null);
  };

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0]; // Splits at 'T' and takes the first part (date)
  };

  const formatStatus = (statusBool: boolean) => {
    if (statusBool) return "Open";
    return "Closed";
  };

  return (
    <table className="table table-xs table-pin-rows table-pin-cols">
      <thead>
        <tr className="bg-slate-400 text-slate-800">
          <td>Company</td>
          <td>Strategy</td>
          <td>Strike Price</td>
          <td>Option Price</td>
          <td>Break Even</td>
          <td>Closing Price</td>
          <td>P/L</td>
          <td>Status</td>
          <td>Expiration Date</td>
        </tr>
      </thead>
      <tbody className="text-slate-200">
        {trades.map((trade) => (
          <tr
            key={trade.tradeid}
            className="hover:bg-slate-700 hover:text-slate-200"
            onClick={() => handleRowClick(trade)}
          >
            {editingTradeId === trade.tradeid ? (
              // Render input fields for editing
              <>
                <td>{trade.ticker}</td>
                <td>{trade.strategy}</td>
                <td>
                  <input
                    type="text"
                    value={editedTrade ? editedTrade.strike.toString() : ""}
                    onChange={(e) => handleInputChange(e, "strike")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={
                      editedTrade ? editedTrade.optionprice.toString() : ""
                    }
                    onChange={(e) => handleInputChange(e, "optionprice")}
                  />
                </td>
                <td>
                  {trade.strategy === "COVERED CALL" ||
                  trade.strategy === "CALL"
                    ? +trade.strike + +trade.optionprice
                    : +trade.strike - +trade.optionprice}
                </td>
                <td>
                  <input
                    type="text"
                    value={
                      editedTrade ? editedTrade.closingprice?.toString() : ""
                    }
                    onChange={(e) => handleInputChange(e, "closingprice")}
                  />
                </td>
                <td>
                  <button onClick={handleSave}>Save</button>
                  <button onClick={(e) => handleCancel(e)}>Cancel</button>
                </td>
                <td>{formatStatus(trade.open)}</td>
                <td>{formatDate(trade.expirationdate)}</td>
              </>
            ) : (
              // Render regular row
              <>
                <td>{trade.ticker}</td>
                <td>{trade.strategy}</td>
                <td>{trade.strike}</td>
                <td>{trade.optionprice}</td>
                <td>
                  {trade.strategy === "COVERED CALL" ||
                  trade.strategy === "CALL"
                    ? +trade.strike + +trade.optionprice
                    : +trade.strike - +trade.optionprice}
                </td>
                <td>{trade.closingprice}</td>
                <td>
                  {trade.closingprice
                    ? (+trade.closingprice - +trade.optionprice) * 100
                    : null}
                </td>
                <td>{formatStatus(trade.open)}</td>
                <td>{formatDate(trade.expirationdate)}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Chart;
