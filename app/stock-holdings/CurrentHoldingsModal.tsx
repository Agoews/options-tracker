import React from "react";

interface CurrentHoldingsModalProps {
  currentHoldingsModalToggle: boolean;
  holdingData: any;
  handleSubmit: (e: React.SyntheticEvent) => Promise<void>;
  handleOpenSellSharesModal: () => void;
  handleCancel: () => void;
  handleDelete: () => void;
  setCoveredCallStrike: (value: string | null) => void;
  setCoveredCallPremium: (value: string | null) => void;
  setCoveredCallQuantity: (value: string | null) => void;
  setCoveredCallExpiration: (value: string | null) => void;
  setCoveredCallStockPrice: (value: string | null) => void;
}

const CurrentHoldingsModal: React.FC<CurrentHoldingsModalProps> = ({
  currentHoldingsModalToggle,
  holdingData,
  handleSubmit,
  handleOpenSellSharesModal,
  handleCancel,
  handleDelete,
  setCoveredCallStrike,
  setCoveredCallPremium,
  setCoveredCallQuantity,
  setCoveredCallExpiration,
  setCoveredCallStockPrice,
}) => {
  if (!currentHoldingsModalToggle) {
    return null;
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
              placeholder={"Maximum " + holdingData.maxoptions}
              onChange={(e) => setCoveredCallQuantity(e.target.value)}
              required
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
              Price:
            </label>
            <input
              type="text"
              placeholder={"Current Stock Price"}
              onChange={(e) => setCoveredCallStockPrice(e.target.value)}
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
              onClick={handleOpenSellSharesModal}
            >
              Sell
            </button>
            <button
              className="btn btn-sm btn-error bg-slate-800 text-red-500"
              onClick={handleDelete}
            >
              Delete
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
