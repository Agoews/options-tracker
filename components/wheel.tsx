"use client";
import React from "react";
import useSWR, { mutate } from "swr";
import { fetcher, Trade } from "./fetcher";

const TheWheelChart = () => {
  // fetch all data from /api/get-trades
  const { data, error, isLoading } = useSWR("/api/get-trades", fetcher);
  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;
  const trades: Trade[] = data.result.rows;

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  const formatStatus = (statusBool: boolean) => {
    return statusBool ? "Open" : "Closed";
  };

  return (
    <div className="flex justify-center items-center space-x-10">
      {/* Credits Table */}
      <div className="w-1/2">
        <h2 className="text-slate-200 mb-1">Credits</h2>
        <table className="table table-xs w-full text-xs">
          <thead>
            <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
              <th>Ticker</th>
              <th>Action</th>
              <th># of Options</th>
              <th>Credit</th>
              <th>Total</th>
              <th>Status</th>
              <th>Expiration Date</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 text-center">
            {trades.map((trade) => (
              <tr
                key={trade.tradeid}
                className="hover:bg-slate-700 hover:text-slate-200 text-center"
              >
                <td>{trade.ticker}</td>
                <td>
                  {trade.strategy === "COVERED CALL"
                    ? "CC"
                    : trade.strategy === "CASH SECURED PUT"
                    ? "CSP"
                    : trade.strategy === "CALL"
                    ? "CALL"
                    : trade.strategy === "PUT"
                    ? "PUT"
                    : ""}
                </td>
                <td>{trade.strike}</td>
                <td>{trade.optionprice}</td>
                <td>{+trade.optionprice * +trade.strike * 100}</td>
                <td>{formatStatus(trade.open)}</td>
                <td>{formatDate(trade.expirationdate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Debits Table */}
      <div className="w-1/2">
        <h2 className="text-slate-200 mb-1">Debits</h2>
        <table className="table table-xs w-full text-xs">
          <thead>
            <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
              <th>Ticker</th>
              <th>Action</th>
              <th># of Options</th>
              <th>Debit</th>
              <th>Total</th>
              <th>Date Closed</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 text-center">
            {trades.map((trade) => (
              <tr
                key={trade.tradeid}
                className="hover:bg-slate-700 hover:text-slate-200 text-center"
              >
                <td>{trade.ticker}</td>
                <td>
                  {trade.strategy === "COVERED CALL"
                    ? "CC"
                    : trade.strategy === "CASH SECURED PUT"
                    ? "CSP"
                    : trade.strategy === "CALL"
                    ? "CALL"
                    : trade.strategy === "PUT"
                    ? "PUT"
                    : ""}
                </td>
                <td>{trade.strike}</td>
                <td>{trade.optionprice}</td>
                <td>{+trade.optionprice * +trade.strike * 100}</td>
                <td>{formatDate(trade.expirationdate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TheWheelChart;
