import React from "react";

interface StartingFundsModalProps {
  startingFunds: number;
  startingFundsModalToggle: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLElement>) => void;
  handleSaveUpdateFunds: () => void;
  handleCancel: () => void;
}

const StartingFundsModal: React.FC<StartingFundsModalProps> = ({
  startingFunds,
  startingFundsModalToggle,
  handleInputChange,
  handleSaveUpdateFunds,
  handleCancel,
}) => {
  if (!startingFundsModalToggle) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm text-slate-200 bg-slate-600 opacity-95">
        <h3 className="font-bold text-lg mb-4">Update Funds</h3>
        <div className="mb-2 text-base">
          Current Funds: ${startingFunds.toFixed(2)}
        </div>
        <input
          type="text"
          placeholder="Type here"
          onChange={(e) => {
            handleInputChange(e);
          }}
          className="input input-bordered w-3/  4"
        />
        <div className="modal-action items-center text-base justify-center">
          <button
            className="btn bg-slate-800 text-slate-200"
            onClick={handleSaveUpdateFunds}
          >
            Update Funds
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

export default StartingFundsModal;
