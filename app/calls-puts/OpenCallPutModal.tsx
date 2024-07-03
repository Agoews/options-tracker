import React from "react";

interface OpenCallPutModalProps {
  closedTradeModalToggle: boolean;
  handleCancel: () => void;
  handleOpenTrade: (e: React.SyntheticEvent) => Promise<void>;
  setReopenQuantity: (value: string | null) => void;
}

const OpenCallPutModal: React.FC<OpenCallPutModalProps> = ({
  closedTradeModalToggle,
  handleCancel,
  handleOpenTrade,
  setReopenQuantity,
}) => {
  if (!closedTradeModalToggle) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">
          Reopen Position
        </h3>

        <div className="text-sm">
          <label className="text-[#00ee00] text-left">
            Quantity to Reopen:{" "}
          </label>
        </div>
        <input
          type="text"
          placeholder="Quantity"
          onChange={(e) => setReopenQuantity(e.target.value)}
          required
          className="bg-slate-700 text-slate-200 rounded-md flex-1 col-span-2 text-center"
        />
        <div className="modal-action items-center justify-center">
          <button
            className="btn btn-sm text-[#00ee00] border-[#00ee00] bg-[#002f00]"
            onClick={handleOpenTrade}
          >
            Reopen
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
  );
};

export default OpenCallPutModal;
