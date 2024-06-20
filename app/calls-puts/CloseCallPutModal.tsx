import React, { useState } from "react";

interface CloseCallPutModalProps {
  openTradeModalToggle: boolean;
  editingTradeId: number | null;
  handleCancel: () => void;
  setClosingPrice: (value: string | null) => void;
  setCompletionDate: (value: string | null) => void;
  setClosedQuantity: (value: string | null) => void;
  handleCloseTrade: (e: React.SyntheticEvent) => Promise<void>;
}

const CloseCallPutModal: React.FC<CloseCallPutModalProps> = ({
  editingTradeId,
  openTradeModalToggle,
  handleCancel,
  setClosingPrice,
  setCompletionDate,
  setClosedQuantity,
  handleCloseTrade,
}) => {
  if (!openTradeModalToggle) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">
          {"Close Call/Put Position"}
        </h3>
        <div className="text-sm">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="text-[#00ee00] text-left col-span-1">
              Closing Price:
            </label>
            <input
              type="text"
              placeholder="Closing Price"
              onChange={(e) => setClosingPrice(e.target.value)}
              required
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
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
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
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
              className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
            />
          </div>
          <div className="modal-action items-center justify-center">
            <button
              className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
              onClick={handleCloseTrade}
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

export default CloseCallPutModal;
