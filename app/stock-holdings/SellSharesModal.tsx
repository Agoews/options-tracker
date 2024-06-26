import React from "react";

interface SellSharesModalProps {
  sellSharesModalToggle: boolean;
  holdingData: any;
  closedQuantity: any;
  exitPrice: any;
  setClosedQuantity: any;
  setExitPrice: any;
  handleSellShares: (e: React.SyntheticEvent) => Promise<void>;
  handleCancel: () => void;
  quantityError: string | null;
  quantityTouched: boolean;
  priceError: string | null;
  priceTouched: boolean;
}

const SellSharesModal: React.FC<SellSharesModalProps> = ({
  sellSharesModalToggle,
  holdingData,
  closedQuantity,
  exitPrice,
  setClosedQuantity,
  setExitPrice,
  handleSellShares,
  handleCancel,
  quantityError,
  quantityTouched,
  priceError,
  priceTouched,
}) => {
  if (!sellSharesModalToggle) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">
          {"Sell Shares for " + holdingData.ticker + "?"}
        </h3>
        <div className="text-sm">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
              Quantity:
            </label>
            <input
              type="text"
              placeholder="Number of Shares Sold"
              onChange={(e) => setClosedQuantity(e.target.value)}
              required
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
            {quantityTouched && quantityError && (
              <p className="text-red-500 text-xs col-span-3 text-center">
                {quantityError}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
              Price:
            </label>
            <input
              type="text"
              placeholder="Share Price"
              onChange={(e) => setExitPrice(e.target.value)}
              required
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
            {priceTouched && priceError && (
              <p className="text-red-500 text-xs col-span-3 text-center">
                {priceError}
              </p>
            )}
          </div>
          <div className="modal-action items-center justify-center">
            <button
              className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
              onClick={handleSellShares}
            >
              Sell Shares
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

export default SellSharesModal;
