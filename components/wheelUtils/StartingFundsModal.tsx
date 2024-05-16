import React from "react";

interface StartingFundsModalProps {
  startingFunds: number;
  startingFundsModalToggle: boolean;
  handleStartingFundsInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSaveUpdateFunds: () => void;
  handleCancel: () => void;
}

const StartingFundsModal: React.FC<StartingFundsModalProps> = ({
  startingFunds,
  startingFundsModalToggle,
  handleStartingFundsInputChange,
  handleSaveUpdateFunds,
  handleCancel,
}) => {
  if (!startingFundsModalToggle) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm text-slate-200">
        <h3 className="font-bold text-lg mb-4 text-[#00ee00]">Update Funds</h3>
        <div className="mb-2 text-base">
          Current Funds: ${startingFunds.toFixed(2)}
        </div>
        <input
          type="text"
          placeholder="Type here"
          onChange={(e) => {
            handleStartingFundsInputChange(e);
          }}
          className="input input-bordered w-3/  4"
        />
        <div className="modal-action items-center text-base justify-center">
          <button
            className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2"
            onClick={handleSaveUpdateFunds}
          >
            Update Funds
          </button>
          <button
            className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2"
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
