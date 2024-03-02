"use client";

import React, { useState } from "react";

import StartingFundsModal from "../wheelUtils/StartingFundsModal";

interface StartingFundsProps {
  funds: number;
  totalCredits: string | number;
  userEmail: string;
}

const StartingFunds: React.FC<StartingFundsProps> = ({
  funds,
  totalCredits,
  userEmail,
}) => {
  const [startingFunds, setStartingFunds] = useState(funds ? funds : 0);
  const [editedStartingFunds, setEditedStartingFunds] = useState(0);
  const [startingFundsModalToggle, setStartingFundsModalToggle] =
    useState(false);

  const handleUpdateFundsModal = () => {
    setStartingFundsModalToggle(!startingFundsModalToggle);
  };

  const handleSaveUpdateFunds = async () => {
    const updatedStartingFunds = Number(startingFunds) + editedStartingFunds;
    const url = `/api/update-funds?email=${userEmail}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updatedStartingFunds }),
      });

      if (!response.ok) {
        throw new Error("Failed to update the funds.");
      }
      setStartingFunds(updatedStartingFunds);
      setEditedStartingFunds(0);
      handleUpdateFundsModal();
    } catch (error) {
      console.error("Error updating funds: ", error);
    }
  };

  const handleCancel = () => {
    setStartingFundsModalToggle(!startingFundsModalToggle);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    let funds: number = Number(target.value);
    setEditedStartingFunds(funds);
  };

  return (
    <>
      <h2 className="text-slate-200 my-1">Initial Investment P/L</h2>

      <table className="table table-xs text-xs">
        <thead>
          <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
            <th>Starting Funds</th>
            <th>Returns</th>
            <th>Total P/L (%)</th>
            <th>Add/Remove Funds</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          <tr>
            <td>{`$${Number(startingFunds).toFixed(2)}`}</td>
            <td>{`$${(Number(totalCredits) * 100).toFixed(2)}`}</td>
            <td>
              {startingFunds > 0
                ? `${(
                    ((Number(totalCredits) * 100) / startingFunds) *
                    100
                  ).toFixed(2)}%`
                : "Update Funds"}
            </td>
            <td>
              <button
                onClick={handleUpdateFundsModal}
                className="btn btn-xs bg-slate-800 text-slate-200"
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
        handleInputChange={handleInputChange}
        handleSaveUpdateFunds={handleSaveUpdateFunds}
        handleCancel={handleCancel}
      />
    </>
  );
};

export default StartingFunds;
