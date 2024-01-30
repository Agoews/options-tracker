"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, Trade } from "./utils/fetcher";
import { getActionAbbreviation } from "./utils/getActionAbbreviation";
import TradeEditModal from "./utils/TradeEditModal";

const Chart = () => {
  const initialTradeState: Trade = {
    tradeid: 0,
    ticker: "",
    actions: "",
    strategy: "",
    optionprice: 0,
    strike: 0,
    closingprice: 0,
    expirationdate: "",
    open: false,
    completiondate: "",
  };

  // fetch all data from /api/get-trades
  const { data, error, isLoading } = useSWR("/api/get-trades", fetcher);

  const [editingTradeId, setEditingTradeId] = useState<number | null>(null);
  const [editedTrade, setEditedTrade] = useState<Trade>(initialTradeState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;
  const trades: Trade[] = data.result.rows;

  console.log(trades);

  const handleRowClick = (trade: Trade) => {
    setEditingTradeId(trade.tradeid);
    setEditedTrade({ ...trade });
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLElement>,
    field: keyof Trade
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    let value: string | number | null = target.value;

    if (
      field === "closingprice" ||
      field === "optionprice" ||
      field === "strike"
    ) {
      const parsedValue = parseFloat(value);

      if (!isNaN(parsedValue)) {
        value = parsedValue.toFixed(2);
      } else {
        value = null;
      }
    }
    setEditedTrade({ ...editedTrade, [field]: value });
  };

  const handleSave = async () => {
    const url = `/api/update-trades/`;
    console.log(editedTrade);
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedTrade),
      });

      if (!response.ok) {
        throw new Error("Failed to update the trade.");
      }
      mutate("/api/get-trades");
    } catch (error) {
      console.error("Error updating trade:", error);
    }

    setEditingTradeId(null);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setEditingTradeId(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  const formatStatus = (statusBool: boolean) => {
    return statusBool ? "Open" : "Closed";
  };

  return (
    <>
      <table className="table table-xs table-pin-rows table-pin-cols text-xs">
        <thead>
          <tr className="bg-slate-400 text-slate-800 text-center">
            <td>Ticker</td>
            <td>Action</td>
            <td>Strategy</td>
            <td>Strike</td>
            <td>Option Price</td>
            <td>Breakeven</td>
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
              className="hover:bg-slate-700 hover:text-slate-200 text-center"
              onClick={() => handleRowClick(trade)}
            >
              <td>{trade.ticker}</td>
              <td>{getActionAbbreviation(trade.actions)}</td>
              <td>{trade.strategy}</td>
              <td>{Number(trade.strike).toFixed(2)}</td>
              <td>{Number(trade.optionprice).toFixed(2)}</td>
              <td>
                {trade.actions === "COVERED CALL" || trade.actions === "CALL"
                  ? Number(+trade.strike + +trade.optionprice).toFixed(2)
                  : Number(+trade.strike - +trade.optionprice).toFixed(2)}
              </td>
              <td>{trade.closingprice}</td>
              <td>
                {trade.closingprice
                  ? (
                      ((+trade.closingprice - +trade.optionprice) /
                        +trade.optionprice) *
                      100
                    ).toFixed(2) + "%"
                  : null}
              </td>
              <td>{formatStatus(trade.open)}</td>
              <td>{formatDate(trade.expirationdate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal for editing trade */}
      <TradeEditModal
        editedTrade={editedTrade}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
      />
    </>
  );
};

export default Chart;
