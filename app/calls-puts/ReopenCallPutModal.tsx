import React from "react";

interface ReopenCallPutModalProps {
  closedTradeModalToggle: boolean;
  selectedClosedTrades: any[]; // replace 'any' with your closed trade type
  handleCancel: () => void;
  handleOpenTrade: (
    tradeId: number,
    closedTradeId: number,
    closedQuantity: number
  ) => void;
}

const ReopenCallPutModal: React.FC<ReopenCallPutModalProps> = ({
  closedTradeModalToggle,
  selectedClosedTrades,
  handleCancel,
  handleOpenTrade,
}) => {
  if (!closedTradeModalToggle) return null;

  console.log("selectedClosedTrades: ", selectedClosedTrades);
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-xl text-[#00ee00] mb-4">
          Reopen Position
        </h3>
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
              {selectedClosedTrades.map((trade, index) => (
                <tr key={index} className="text-center text-slate-200">
                  <td>{trade.closingprice}</td>
                  <td>{trade.closedquantity}</td>

                  <td>
                    <button
                      className="btn btn-xs bg-[#002f00] text-[#00ee00] border-[#00ee00]"
                      onClick={() =>
                        handleOpenTrade(
                          trade.tradeid,
                          trade.closedtradeid,
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

export default ReopenCallPutModal;
