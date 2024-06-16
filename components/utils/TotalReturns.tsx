import React from "react";
import StartingFundsModal from "../wheelUtils/StartingFundsModal";

interface TotalReturnsProps {
  totalProfits: number;
  startingFunds: number;
  startingFundsModalToggle: boolean;
  handleCancel: () => void;
  handleSaveUpdateFunds: () => void;
  handleUpdateFundsModal: () => void;
  handleStartingFundsInputChange: (e: React.ChangeEvent<HTMLElement>) => void;
}

const TotalReturns: React.FC<TotalReturnsProps> = ({
  totalProfits,
  startingFunds,
  startingFundsModalToggle,
  handleCancel,
  handleSaveUpdateFunds,
  handleUpdateFundsModal,
  handleStartingFundsInputChange,
}) => {
  return (
    <>
      <div
        className="tooltip tooltip-right text-[#00ee00]"
        data-tip="P/L of the wheel trades on the starting funds"
      >
        <h2 className="text-[#00ee00] text-2xl mb-1 text-left">
          Total Returns
        </h2>
      </div>

      <table className="table table-xs rounded border-2 border-[#00ee00]">
        <thead>
          <tr className="text-[#00ee00] text-center">
            <th>Starting Funds</th>
            <th>Returns</th>
            <th>Total P/L (%)</th>
            <th className="hidden md:table-cell">Add/Remove Funds</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          <tr>
            <td>
              {startingFunds > 0 ? `$${Number(startingFunds).toFixed(2)}` : 0}
            </td>
            <td>
              {totalProfits > 0
                ? `$${(Number(totalProfits) * 100).toFixed(2)}`
                : 0}
            </td>
            <td>
              {startingFunds > 0
                ? `${(
                    ((Number(totalProfits) * 100) / startingFunds) *
                    100
                  ).toFixed(2)}%`
                : "Update Funds ->"}
            </td>
            <td className="hidden md:table-cell">
              <button
                onClick={handleUpdateFundsModal}
                className="btn btn-xs text-[#00ee00] border-[#00ee00] bg-[#002f00]"
              >
                Update Funds
              </button>
            </td>
          </tr>
          <tr className="md:hidden">
            <td colSpan={4}>
              <button
                onClick={handleUpdateFundsModal}
                className="btn btn-xs text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2"
              >
                Update Funds
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <StartingFundsModal
        startingFunds={startingFunds}
        startingFundsModalToggle={startingFundsModalToggle}
        handleStartingFundsInputChange={handleStartingFundsInputChange}
        handleSaveUpdateFunds={handleSaveUpdateFunds}
        handleCancel={handleCancel}
      />
    </>
  );
};

export default TotalReturns;
