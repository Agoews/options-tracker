import React from "react";
import { Trade } from "../utils/fetcher";

interface DebitModalProps {
  closedTrades: Trade[];
  handleReopenTrade: (
    closedTradeId: number,
    tradeId: number,
    closedQuantity: number
  ) => void;
  handleCancel: () => void;
  closedTradeModalToggle: boolean;
}

const DebitModal: React.FC<DebitModalProps> = ({
  closedTrades,
  handleReopenTrade,
  handleCancel,
  closedTradeModalToggle,
}) => {
  if (!closedTradeModalToggle) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">Closed Trades</h3>
        <div className="overflow-x-auto">
          <table className="table table-xs w-full">
            <thead>
              <tr className="text-[#00ee00] text-center">
                <th>Closing Price</th>
                <th>Closed Quantity</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {closedTrades.map((trade, index) => (
                <tr key={index} className="text-center">
                  <td>{trade.closingprice}</td>
                  <td>{trade.closedquantity}</td>
                  <td>
                    <button
                      className="btn btn-xs bg-[#002f00] text-[#00ee00] border-[#00ee00]"
                      onClick={() =>
                        handleReopenTrade(
                          trade.closedtradeid,
                          trade.tradeid,
                          trade.closedquantity
                        )
                      }
                    >
                      Reopen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-action items-center justify-center">
          {/* <button
            className="btn bg-slate-800 text-slate-200"
            onClick={handleReopenTrade}
          >
            Save
          </button> */}
          <button
            className="btn btn-sm bg-[#002f00] text-[#00ee00] border-[#00ee00]"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebitModal;
