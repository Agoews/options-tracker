import React from "react";
import { Trade } from "../fetcher";

interface DebitModalProps {
  closedTrades: Trade[];
  handleInputChange: (
    e: React.ChangeEvent<HTMLElement>,
    field: keyof Trade
  ) => void;
  handleSaveClosedTrades: () => void;
  handleCancel: () => void;
  closedTradeModalToggle: boolean;
}

const DebitModal: React.FC<DebitModalProps> = ({
  closedTrades,
  handleInputChange,
  handleSaveClosedTrades,
  handleCancel,
  closedTradeModalToggle,
}) => {
  if (!closedTradeModalToggle) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm bg-slate-600 opacity-95">
        <h3 className="font-bold text-lg text-slate-200 mb-4">Closed Trades</h3>
        <div className="overflow-x-auto">
          <table className="table w-full text-slate-200">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Closing Price</th>
                <th>Closed Quantity</th>
              </tr>
            </thead>
            <tbody>
              {closedTrades.map((trade, index) => (
                <tr key={index}>
                  <td>{trade.ticker}</td>
                  <td>{trade.closingprice}</td>
                  <td>{trade.closedquantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-action mt-4">
          <button
            className="btn bg-slate-800 text-slate-200"
            onClick={handleSaveClosedTrades}
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
  );
};

export default DebitModal;
