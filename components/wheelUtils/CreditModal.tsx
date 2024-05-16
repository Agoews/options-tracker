import React from "react";
import RolloutModal from "./RolloutModal";
import { Trade } from "../utils/fetcher";
import AssignedModal from "./AssignedModal";

interface CreditModalProps {
  editedTrade: Trade;
  handleInputChange: (
    e: React.ChangeEvent<HTMLElement>,
    field: keyof Trade
  ) => void;
  handleSaveOpenTrades: () => void;
  handleOpenRolloutModal: () => void;
  handleRolloutModalCancel: () => void;
  handleAssignment: () => void;
  handleOpenAssignmentModal: () => void;
  handleCancel: () => void;
  openTradeModalToggle: boolean;
  rolloutModalToggle: boolean;
  assignmentModalToggle: boolean;
}

const CreditModal: React.FC<CreditModalProps> = ({
  editedTrade,
  handleInputChange,
  handleSaveOpenTrades,
  handleOpenRolloutModal,
  handleRolloutModalCancel,
  handleAssignment,
  handleOpenAssignmentModal,
  handleCancel,
  openTradeModalToggle,
  rolloutModalToggle,
  assignmentModalToggle,
}) => {
  if (!openTradeModalToggle) return null;

  if (openTradeModalToggle) {
    console.log("Open Modal Data", editedTrade);
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">Update Trade</h3>
        <div className="text-sm">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
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
            <span className="text-[#00ee00] text-left col-span-1 ">
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
            <label className="text-[#00ee00] text-left col-span-1">
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
            <label className="text-[#00ee00] text-left col-span-1">
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
            <label className="text-[#00ee00] text-left col-span-1">
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
            <label className="text-[#00ee00] text-left col-span-1">
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
            <label className="text-[#00ee00] text-left col-span-1">
              Current Open Quantity:
              <span className="text-slate-200">{` ${editedTrade.openquantity}`}</span>
            </label>
          </div>

          <div className="modal-action items-center justify-center">
            <button
              className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
              onClick={handleSaveOpenTrades}
            >
              Save
            </button>
            <button
              className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
              onClick={handleOpenRolloutModal}
            >
              Rollout
            </button>
            <button
              className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
              onClick={handleOpenAssignmentModal}
            >
              Assign
            </button>
            <button
              className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
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
      <AssignedModal
        editedTrade={editedTrade}
        assignmentModalToggle={assignmentModalToggle}
        handleCancel={handleCancel}
        handleAssignment={handleAssignment}
      />
    </div>
  );
};

export default CreditModal;
