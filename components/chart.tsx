"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";

interface Trade {
  tradeid: number;
  ticker: string;
  strategy: string;
  optionprice: number | string;
  strike: number | string;
  closingprice?: number | null;
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
                  required
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
                  required
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
                  required
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
                  required
                  className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="text-slate-200 text-left col-span-1">
                  Closing Price:
                </label>
                <input
                  type="number"
                  value={editedTrade.closingprice || ""}
                  onChange={(e) => handleInputChange(e, "closingprice")}
                  className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
                  step="0.01"
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
