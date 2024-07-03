import React from "react";

interface CloseCallPutModalProps {
  openTradeModalToggle: boolean;
  handleCancel: () => void;
  setClosingPrice: (value: string | null) => void;
  setCompletionDate: (value: string | null) => void;
  setClosedQuantity: (value: string | null) => void;
  handleCloseTrade: (e: React.SyntheticEvent) => Promise<void>;
  closingPriceValid: boolean;
  completionDateValid: boolean;
  closedQuantityValid: boolean;
}

const CloseCallPutModal: React.FC<CloseCallPutModalProps> = ({
  openTradeModalToggle,
  handleCancel,
  setClosingPrice,
  setCompletionDate,
  setClosedQuantity,
  handleCloseTrade,
  closingPriceValid,
  completionDateValid,
  closedQuantityValid,
}) => {
  if (!openTradeModalToggle) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">
          Close Call/Put Position
        </h3>
        <div className="text-sm">
          <form onSubmit={handleCloseTrade}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <label className="text-[#00ee00] text-left col-span-1">
                Closing Price:
              </label>
              <input
                type="text"
                placeholder="Closing Price"
                onChange={(e) => setClosingPrice(e.target.value)}
                required
                className={`bg-slate-700 rounded-md flex-1 col-span-2 text-center ${
                  !closingPriceValid ? "text-red-500" : "text-slate-200"
                }`}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <label className="text-[#00ee00] text-left col-span-1">
                Completion Date:
              </label>
              <input
                type="date"
                placeholder="Completion Date"
                onChange={(e) => setCompletionDate(e.target.value)}
                required
                className={`bg-slate-700 rounded-md flex-1 col-span-2 text-center ${
                  !completionDateValid ? "text-red-500" : "text-slate-200"
                }`}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <label className="text-[#00ee00] text-left col-span-1">
                Closed Quantity:
              </label>
              <input
                type="text"
                placeholder="Closed Quantity"
                onChange={(e) => setClosedQuantity(e.target.value)}
                required
                className={`bg-slate-700 rounded-md flex-1 col-span-2 text-center ${
                  !closedQuantityValid ? "text-red-500" : "text-slate-200"
                }`}
              />
            </div>
            <div className="modal-action items-center justify-center">
              <button
                type="submit"
                className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
              >
                Submit
              </button>
              <button
                type="button"
                className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CloseCallPutModal;
