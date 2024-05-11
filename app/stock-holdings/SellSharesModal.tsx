import React from "react";

interface SellSharesModalProps {
  sellSharesModalToggle: boolean;
  holdingData: any;
  handleCancel: () => void;
}

const SellSharesModal: React.FC<SellSharesModalProps> = ({
  sellSharesModalToggle,
  holdingData,
  handleCancel,
}) => {
  if (!sellSharesModalToggle) return null;

  console.log("Data in Sell Shares Modal", holdingData);

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">
          {"Sell Shares for " + holdingData.ticker + "?"}
        </h3>
        <div className="text-sm">
          <div className="grid grid-cols-3 gap-4 mb-4"></div>
          <div className="modal-action items-center justify-center">
            <button
              className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellSharesModal;
