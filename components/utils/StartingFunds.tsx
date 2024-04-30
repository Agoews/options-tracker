"use client";

import React, { useState } from "react";
import StartingFundsModal from "../wheelUtils/StartingFundsModal";
import useSWR from "swr";
import { fetcher } from "./fetcher";

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
  const { data, error, isLoading } = useSWR(
    `/api/get-funds?email=${userEmail}`,
    fetcher
  );

  const [startingFunds, setStartingFunds] = useState(0);
  const [editedStartingFunds, setEditedStartingFunds] = useState(0);
  const [startingFundsModalToggle, setStartingFundsModalToggle] =
    useState(false);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  if (!startingFunds) {
    console.log(data.result);
    setStartingFunds(
      Number(data.result.rows[0].funds) ? Number(data.result.rows[0].funds) : 0
    );
  }

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
      <div
        className="tooltip tooltip-right text-[#00ee00]"
        data-tip="P/L of the wheel trades on the starting funds"
      >
        <h2 className="text-[#00ee00] text-2xl text-left xl:text-center mt-2">
          Return on Initial Investments
        </h2>
      </div>

      <table className="table table-xs text-xs rounded border-2 border-[#00ee00]">
        <thead>
          <tr className="text-[#00ee00] text-center">
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
                : "Update Funds ->"}
            </td>
            <td>
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
        handleInputChange={handleInputChange}
        handleSaveUpdateFunds={handleSaveUpdateFunds}
        handleCancel={handleCancel}
      />
    </>
  );
};

export default StartingFunds;
