import React from "react";
import RolloutModal from "./RolloutModal";
import { Trade } from "../utils/fetcher";

interface CreditModalProps {
  editedTrade: Trade;
  handleInputChange: (
    e: React.ChangeEvent<HTMLElement>,
    field: keyof Trade
  ) => void;
  handleSaveOpenTrades: () => void;
  handleOpenRolloutModal: () => void;
  handleRolloutModalCancel: () => void;
  handleCancel: () => void;
  openTradeModalToggle: boolean;
  rolloutModalToggle: boolean;
}

const CreditModal: React.FC<CreditModalProps> = ({
  editedTrade,
  handleInputChange,
  handleSaveOpenTrades,
  handleOpenRolloutModal,
  handleRolloutModalCancel,
  handleCancel,
  openTradeModalToggle,
  rolloutModalToggle,
}) => {
  if (!openTradeModalToggle) return null;

  if (openTradeModalToggle) {
    console.log("Open Modal Data", editedTrade);
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm bg-slate-600 opacity-95">
        <h3 className="font-bold text-lg text-slate-200 mb-1">Update Trade</h3>
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
              Action:
            </span>
            <select
              className="select select-bordered bg-slate-700 text-slate-200 flex-1 col-span-2 text-center"
              value={editedTrade.actions}
              onChange={(e) => handleInputChange(e, "actions")}
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

          <div className="grid grid-cols-3 gap-4 mb-4">
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

          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-slate-200 text-left col-span-1">
              Close Quantity:
            </label>
            <input
              type="number"
              value={editedTrade.closedquantity || ""}
              onChange={(e) => handleInputChange(e, "closedquantity")}
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
          </div>
          <div className="gap-4 items-center">
            <label className="text-slate-200 text-left col-span-1">
              {`Current Open Quantity: ${editedTrade.openquantity}`}
            </label>
          </div>
          <div className="modal-action items-center justify-center">
            <button
              className="btn bg-slate-800 text-slate-200"
              onClick={handleSaveOpenTrades}
            >
              Save
            </button>
            <button
              className="btn bg-slate-800 text-slate-200"
              onClick={handleOpenRolloutModal}
            >
              Rollout
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
      <RolloutModal
        editedTrade={editedTrade}
        handleInputChange={handleInputChange}
        handleSaveOpenTrades={handleSaveOpenTrades}
        handleRolloutModalCancel={handleRolloutModalCancel}
        rolloutModalToggle={rolloutModalToggle}
      />
    </div>
  );
};

export default CreditModal;
