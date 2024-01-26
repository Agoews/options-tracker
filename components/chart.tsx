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
    closingprice: 0,
    expirationdate: "",
    open: false,
  };
  const { data, error, isLoading } = useSWR("/api/get-trades", fetcher);
  const [editingTradeId, setEditingTradeId] = useState<number | null>(null);
  const [editedTrade, setEditedTrade] = useState<Trade>(initialTradeState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  const trades: Trade[] = data.result.rows;

  const handleRowClick = (trade: Trade) => {
    setEditingTradeId(trade.tradeid);
    setEditedTrade({ ...trade });
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Trade
  ) => {
    setEditedTrade({ ...editedTrade, [field]: e.target.value });
  };

  const handleSave = async () => {
    console.log("save clicked", editedTrade);
    setEditingTradeId(null);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    console.log("cancel clicked");
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
          <tr className="bg-slate-400 text-slate-800">
            <td>Ticker</td>
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
              <td>{trade.strategy}</td>
              <td>{trade.strike}</td>
              <td>{trade.optionprice}</td>
              <td>
                {trade.strategy === "COVERED CALL" || trade.strategy === "CALL"
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for editing trade */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm bg-slate-600 opacity-95">
            <h3 className="font-bold text-lg text-slate-200 mb-1">
              Update Trade
            </h3>
            <div className="py-2 text-sm">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <label className="text-slate-200 text-left col-span-1">
                  Ticker:
                </label>
                <input
                  type="text"
                  value={editedTrade.ticker}
                  onChange={(e) => handleInputChange(e, "ticker")}
                  className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <span className="text-slate-200 text-left col-span-1 ">
                  Strategy:
                </span>
                <select
                  className="select select-bordered bg-slate-700 text-slate-200 flex-1 col-span-2 text-center"
                  value={editedTrade.strategy}
                  onChange={(e) => handleInputChange(e, "strategy")}
                >
                  <option disabled value="">
                    Please select...
                  </option>
                  <option value="CALL">CALL</option>
                  <option value="PUT">PUT</option>
                  <option value="COVERED CALL">COVERED CALL</option>
                  <option value="CASH SECURED PUT">CASH SECURED PUT</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <label className="text-slate-200 text-left col-span-1">
                  Strike:
                </label>
                <input
                  type="text"
                  value={editedTrade.strike}
                  onChange={(e) => handleInputChange(e, "strike")}
                  className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <label className="text-slate-200 text-left col-span-1">
                  Option Price:
                </label>
                <input
                  type="text"
                  value={editedTrade.optionprice}
                  onChange={(e) => handleInputChange(e, "optionprice")}
                  className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="text-slate-200 text-left col-span-1">
                  Closing Price:
                </label>
                <input
                  type="text"
                  value={editedTrade.closingprice || ""}
                  onChange={(e) => handleInputChange(e, "closingprice")}
                  className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn bg-slate-800 text-slate-200"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="btn bg-slate-800 text-slate-200"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chart;
