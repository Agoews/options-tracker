"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Trade, fetcher } from "./fetcher";
import StartingFundsModal from "../wheelUtils/StartingFundsModal";

interface TotalReturnsProps {
  totalProfits: number;
  userEmail: string;
}

const TotalReturns: React.FC<TotalReturnsProps> = ({
  totalProfits,
  userEmail,
}) => {
  // const { data, error, isLoading } = useSWR(
  //   `/api/get-trades?email=${userEmail}`,
  //   fetcher
  // );

  const [startingFunds, setStartingFunds] = useState(Number);
  const [editedStartingFunds, setEditedStartingFunds] = useState(0);
  const [startingFundsModalToggle, setStartingFundsModalToggle] =
    useState(false);

  // if (error) return <div>Failed to load</div>;
  // if (isLoading) return <div>Loading...</div>;

  // if (!startingFunds) {
  //   setStartingFunds(
  //     Number(data.result.rows[0].funds) ? Number(data.result.rows[0].funds) : 0
  //   );
  // }

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

  const handleUpdateFundsModal = () => {
    setStartingFundsModalToggle(!startingFundsModalToggle);
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
      <div
        className="tooltip tooltip-right text-[#00ee00]"
        data-tip="P/L of the wheel trades on the starting funds"
      >
        <h2 className="text-[#00ee00] my-1">Total Returns</h2>
      </div>

      <table className="table table-xs text-xs">
        <thead>
          <tr className="text-slate-200 text-center">
            <th>Starting Funds</th>
            <th>Returns</th>
            <th>Total P/L (%)</th>
            <th>Add/Remove Funds</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          <tr>
            <td>{`$${Number(startingFunds).toFixed(2)}`}</td>
            <td>{`$${(Number(totalProfits) * 100).toFixed(2)}`}</td>
            <td>
              {startingFunds > 0
                ? `${(
                    ((Number(totalProfits) * 100) / startingFunds) *
                    100
                  ).toFixed(2)}%`
                : "Update Funds ->"}
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

export default TotalReturns;
