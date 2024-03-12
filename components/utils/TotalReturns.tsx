"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Trade, fetcher } from "./fetcher";

interface TotalReturnsProps {
  totalProfits: number;
  userEmail: string;
}

const TotalReturns: React.FC<TotalReturnsProps> = ({
  totalProfits,
  userEmail,
}) => {
  const { data, error, isLoading } = useSWR(
    `/api/get-holdings?email=${userEmail}`,
    fetcher
  );

  const [startingFunds, setStartingFunds] = useState(Number);
  const [editedStartingFunds, setEditedStartingFunds] = useState(0);
  const [startingFundsModalToggle, setStartingFundsModalToggle] =
    useState(false);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  if (!startingFunds) {
    setStartingFunds(
      Number(data.result.rows[0].funds) ? Number(data.result.rows[0].funds) : 0
    );
  }

  const handleUpdateFundsModal = () => {
    setStartingFundsModalToggle(!startingFundsModalToggle);
  };

  return (
    <>
      <div
        className="tooltip tooltip-right text-slate-200"
        data-tip="P/L of the wheel trades on the starting funds"
      >
        <h2 className="text-slate-200 my-1">Return on Initial Investments</h2>
      </div>

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
            <td>{`$${(Number(totalProfits) * 100).toFixed(2)}`}</td>
            <td>
              {startingFunds > 0
                ? `${(
                    ((Number(totalProfits) * 100) / startingFunds) *
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
    </>
  );
};

export default TotalReturns;
