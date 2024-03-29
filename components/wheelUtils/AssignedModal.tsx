import React from "react";
import { Trade } from "../utils/fetcher";

interface AssignmentModalProps {
  editedTrade: Trade;
  assignmentModalToggle: boolean;
  handleAssignmentModalCancel: () => void;
  handleAssignment: () => void;
}

const AssignedModal: React.FC<AssignmentModalProps> = ({
  editedTrade,
  assignmentModalToggle,
  handleAssignmentModalCancel,
  handleAssignment,
}) => {
  if (!assignmentModalToggle) return null;

  console.log("Assigned Modal: ", editedTrade);
  return (
    <div className={`modal ${assignmentModalToggle ? "modal-open" : ""}`}>
      <div className="modal-box max-w-sm text-slate-200 bg-slate-600 opacity-95">
        {editedTrade.actions === "COVERED CALL"}

        <h3 className="font-bold text-lg text-slate-200 mb-1">Assign Shares</h3>
        <div className="py-2 text-base">
          <div>{`Assign ${editedTrade.openquantity * 100} shares of ${
            editedTrade.ticker
          } at $${Number(editedTrade.strike).toFixed(
            2
          )} with a breakeven of $${Number(
            editedTrade.strike - editedTrade.optionprice
          ).toFixed(2)}?`}</div>
        </div>
        <div className="modal-action items-center justify-center">
          <button
            className="btn bg-slate-800 text-slate-200"
            onClick={handleAssignment}
          >
            Assign Shares
          </button>
          <button
            className="btn bg-slate-800 text-slate-200"
            onClick={handleAssignmentModalCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignedModal;
