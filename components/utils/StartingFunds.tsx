"use client";

import React from "react";
import StartingFundsModal from "../wheelUtils/StartingFundsModal";

interface StartingFundsProps {
  totalCredits: string | number;
  userEmail: string;
  startingFunds: number;
  startingFundsModalToggle: boolean;
  handleCancel: () => void;
  handleUpdateFundsModal: () => void;
  handleSaveUpdateFunds: () => void;
  handleStartingFundsInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const StartingFunds: React.FC<StartingFundsProps> = ({
  totalCredits,
  startingFunds,
  startingFundsModalToggle,
  handleCancel,
  handleUpdateFundsModal,
  handleSaveUpdateFunds,
  handleStartingFundsInputChange,
}) => {
  return (
    <>
      <div
        className="tooltip tooltip-right text-[#00ee00]"
        data-tip="P/L of the wheel trades on the starting funds"
      >
        <h2 className="text-[#00ee00] text-2xl text-left xl:text-center mt-2">
          Return on Investments
        </h2>
      </div>

      <table className="table table-xs text-xs border-2 border-[#00ee00]">
        <thead>
          <tr className="text-[#00ee00] text-center">
            <th>Starting Funds</th>
            <th>Return</th>
            <th>P/L (%)</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          <tr>
            <td>{`$${Number(startingFunds).toFixed(2)}`}</td>
            <td>
              {Number(totalCredits) > 0
                ? `$${(Number(totalCredits) * 100).toFixed(2)}`
                : 0}
            </td>
            <td>
              {startingFunds > 0
                ? `${(
                    ((Number(totalCredits) * 100) / startingFunds) *
                    100
                  ).toFixed(2)}%`
                : "Update Funds ->"}
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <button
                onClick={handleUpdateFundsModal}
                className="btn btn-xs text-[#00ee00] border-[#00ee00] bg-[#002f00]"
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

export default StartingFunds;
