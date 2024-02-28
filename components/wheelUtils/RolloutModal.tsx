import React from "react";
import { Trade } from "../utils/fetcher";
import { getActionAbbreviation } from "../utils/getActionAbbreviation";

interface RolloutModallProps {
  editedTrade: Trade;
  handleInputChange: (
    e: React.ChangeEvent<HTMLElement>,
    field: keyof Trade
  ) => void;
  handleSaveOpenTrades: () => void;
  handleRolloutModalCancel: () => void;
  rolloutModalToggle: boolean;
}

const RolloutModal: React.FC<RolloutModallProps> = ({
  editedTrade,
  handleInputChange,
  handleSaveOpenTrades,
  handleRolloutModalCancel,
  rolloutModalToggle,
}) => {
  if (!rolloutModalToggle) return null;

  console.log("Rollout modal: ", editedTrade);
  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  return (
    <div className={`modal ${rolloutModalToggle ? "modal-open" : ""}`}>
      <div className="modal-box max-w-sm text-slate-200 bg-slate-600 opacity-95">
        <div className="py-2">
          <div className="font-bold text-lg mb-1">{`${
            editedTrade.ticker
          }  ${formatDate(editedTrade.expirationdate)}  $${
            editedTrade.strike
          }  ${getActionAbbreviation(editedTrade.actions)}`}</div>
          <div className="grid grid-cols-2 text-center my-1">
            <div className="col-span-1"></div>
            <div className="col-span-1">Rollout</div>
          </div>
          <div className="grid grid-cols-2 text-center my-1">
            <div className="col-span-1">Strike:</div>
            <input
              type="text"
              value={editedTrade.strike}
              onChange={(e) => handleInputChange(e, "strike")}
              required
              className="bg-slate-700 rounded-md flex-1 col-span-1 text-center"
            />
          </div>
          <div className="grid grid-cols-2 text-center my-1">
            <div className="col-span-1">Option Price:</div>

            <input
              type="text"
              value={editedTrade.optionprice}
              onChange={(e) => handleInputChange(e, "optionprice")}
              required
              className="bg-slate-700 rounded-md flex-1 col-span-1 text-center"
            />
          </div>
          <div className="grid grid-cols-2 text-center my-1">
            <div className="col-span-1">Expiration:</div>

            <input
              type="text"
              value={formatDate(editedTrade.expirationdate)}
              onChange={(e) => handleInputChange(e, "expirationdate")}
              required
              className="bg-slate-700 rounded-md flex-1 col-span-1 text-center"
            />
          </div>
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
            onClick={handleRolloutModalCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolloutModal;
