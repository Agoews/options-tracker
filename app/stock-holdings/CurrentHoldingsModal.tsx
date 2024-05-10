import React from "react";

interface CurrentHoldingsModalProps {
  currentHoldingsModalToggle: boolean;
  holdingData: any;
  handleSubmit: () => void;
  handleCancel: () => void;
  setCoveredCallStrike: (value: string | null) => void;
  setCoveredCallPremium: (value: string | null) => void;
  setCoveredCallQuantity: (value: string | null) => void;
  setCoveredCallExpiration: (value: string | null) => void;
}

const CurrentHoldingsModal: React.FC<CurrentHoldingsModalProps> = ({
  currentHoldingsModalToggle,
  holdingData,
  handleSubmit,
  handleCancel,
  setCoveredCallStrike,
  setCoveredCallPremium,
  setCoveredCallQuantity,
  setCoveredCallExpiration,
}) => {
  if (!currentHoldingsModalToggle) {
    return null;
  } else {
    console.log("Current Holding Data: ", holdingData);
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">
          {"Write Call for " + holdingData.ticker + "?"}
        </h3>
        <div className="text-sm">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
              Strike:
            </label>
            <input
              type="text"
              placeholder="Strike Value"
              onChange={(e) => setCoveredCallStrike(e.target.value)}
              required
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
              Premium:
            </label>
            <input
              type="text"
              placeholder="Premium Collected"
              onChange={(e) => setCoveredCallPremium(e.target.value)}
              required
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
              Quantity:
            </label>
            <input
              type="text"
              placeholder={"Maximum " + holdingData.quantity / 100}
              onChange={(e) => setCoveredCallQuantity(e.target.value)}
              required
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
              Expiration:
            </label>
            <input
              type="date"
              onChange={(e) => setCoveredCallExpiration(e.target.value)}
              required
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-3">
              <span className="text-[#00ee00] text-left">
                Current Cost Basis is:
              </span>
              <span className="text-slate-200">
                {" $" + Number(holdingData.costbasis).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="modal-action items-center justify-center">
            <button
              className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
              onClick={handleSubmit}
            >
              Write Call
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
    </div>
  );
};

export default CurrentHoldingsModal;
