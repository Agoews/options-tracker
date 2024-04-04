"use client";
import { fetcher } from "@/components/utils/fetcher";
import React from "react";
import useSWR from "swr";

interface OpenHoldingsProps {
  userEmail: string;
}
const OpenHoldings: React.FC<OpenHoldingsProps> = ({ userEmail }) => {
  const { data, error, isLoading } = useSWR(
    `/api/get-current-holdings?email=${userEmail}`,
    fetcher
  );

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  if (data) {
    console.log("data: ", data.result.rows);
    console.log("data: ", data.result.rows[0]);
  }

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  const holdingsArray = data.result.rows;

  return (
    <div className="">
      <h2 className="text-[#00ee00] text-2xl mb-1">Current Positions</h2>
      <table className="table table-xs w-full text-xs rounded border-2 border-[#00ee00]">
        <thead>
          <tr className="text-slate-200 text-center">
            <th>Ticker</th>
            <th>Quantity</th>
            <th>Entry Price</th>
            <th>Total Value</th>
            <th>Cost Basis</th>
            <th>Profit from Calls</th>
            <th>Date Purchased</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          {holdingsArray.map((obj: any) => (
            <tr
              key={obj.currentholdingsid}
              className="hover:bg-slate-700 hover:text-slate-200 hover: cursor-pointer text-center"
            >
              <td>{obj.ticker}</td>
              <td>{obj.quantity}</td>
              <td>{obj.entryprice}</td>
              <td>{Number(obj.quantity * obj.entryprice).toFixed(2)}</td>
              <td>{obj.costbasis}</td>
              <td>{obj.callssold}</td>
              <td>{formatDate(obj.datepurchased)}</td>
              <td>{obj.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OpenHoldings;
