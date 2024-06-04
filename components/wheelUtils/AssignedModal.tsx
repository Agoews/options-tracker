import React from "react";
import { Trade } from "../utils/fetcher";

interface AssignmentModalProps {
  editedTrade: Trade;
  assignmentModalToggle: boolean;
  handleCancel: () => void;
  handleAssignment: () => void;
}

const AssignedModal: React.FC<AssignmentModalProps> = ({
  editedTrade,
  assignmentModalToggle,
  handleCancel,
  handleAssignment,
}) => {
  if (!assignmentModalToggle) return null;

  return (
    <div className={`modal ${assignmentModalToggle ? "modal-open" : ""}`}>
      <div className="modal-box max-w-sm">
        {editedTrade.actions === "COVERED CALL"}

        <h3 className="font-bold text-xl mb-2 text-[#00ee00]">Assign Shares</h3>
        <div className="text-sm text-[#00ee00]">
          <div>
            Assign
            <span className="text-slate-200">
              {` ${editedTrade.openquantity * 100} `}
            </span>
            shares of
            <span className="text-slate-200"> {editedTrade.ticker} </span> at
            <span className="text-slate-200">
              {` $${Number(editedTrade.strike).toFixed(2)}`}
            </span>
          </div>
          <div>
            Breakeven:
            <span className="text-slate-200">
              {` $${Number(
                editedTrade.strike - editedTrade.optionprice
              ).toFixed(2)}`}
            </span>
          </div>
        </div>
        <div className="modal-action items-center justify-center">
          <button
            className="btn btn-sm bg-[#002f00] text-[#00ee00] border-[#00ee00]"
            onClick={handleAssignment}
          >
            Assign Shares
          </button>
          <button
            className="btn btn-sm bg-[#002f00] text-[#00ee00] border-[#00ee00]"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignedModal;
