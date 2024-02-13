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

  if (closedTradeModalToggle) {
    console.log("Closed Modal Data: ", closedTrades);
  }
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm bg-slate-600 opacity-95">
        <h3 className="font-bold text-lg text-slate-200 mb-1">Update Trade</h3>

        <div className="modal-action">
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
