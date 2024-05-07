import React from "react";

interface CurrentHoldingsModalProps {
  currentHoldingsModalToggle: boolean;
  handleCancel: () => void;
}

const CurrentHoldingsModal: React.FC<CurrentHoldingsModalProps> = ({
  currentHoldingsModalToggle,
  handleCancel,
}) => {
  if (!currentHoldingsModalToggle) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">
          Current Holdings
        </h3>
        <div className="text-sm">
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

export default CurrentHoldingsModal;
