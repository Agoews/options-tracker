import React from "react";

interface AddPosiitonModalProps {
  addPositionToggle: boolean;
  setTicker: (value: string | null) => void;
  setQuantity: (value: string | null) => void;
  setEntryPrice: (value: string | null) => void;
  handleAddHolding: (e: React.SyntheticEvent) => Promise<void>;
  handleCancel: () => void;
}

const AddHoldingModal: React.FC<AddPosiitonModalProps> = ({
  addPositionToggle,
  setTicker,
  setQuantity,
  setEntryPrice,
  handleAddHolding,
  handleCancel,
}) => {
  if (!addPositionToggle) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">
          {"Add new stock holding"}
        </h3>
        <div className="text-sm">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
              Ticker:
            </label>
            <input
              type="text"
              placeholder="Stock Ticker"
              onChange={(e) => setTicker(e.target.value)}
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
              placeholder="Number of Shares"
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
              Entry:
            </label>
            <input
              type="text"
              placeholder="Entry Price"
              onChange={(e) => setEntryPrice(e.target.value)}
              required
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
          </div>
          <div className="modal-action items-center justify-center">
            <button
              className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
              onClick={handleAddHolding}
            >
              Submit
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

export default AddHoldingModal;
