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

  const handleCurrentHoldingClick = (data: any) => {
    console.log("clicked", data);
  };
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
            <th>Options Profit</th>
            <th>Date Purchased</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          {holdingsArray.map((obj: any) => (
            <tr
              key={obj.currentholdingsid}
              className="hover:bg-slate-700 hover:text-slate-200 hover: cursor-pointer text-center"
              onClick={() => handleCurrentHoldingClick(obj)}
            >
              <td>{obj.ticker}</td>
              <td>{obj.quantity}</td>
              <td>{"$" + Number(obj.entryprice).toFixed(2)}</td>
              <td>{"$" + Number(obj.quantity * obj.entryprice).toFixed(2)}</td>
              <td>{"$" + Number(obj.costbasis).toFixed(2)}</td>
              <td>{"$" + obj.optionsprofit}</td>
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

// make the assignments work for covered calls as well as CSP
// modal for current holdings
// sell calls on current holdings
// sell holdings
