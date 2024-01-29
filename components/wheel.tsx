"use client";
import React from "react";
import useSWR, { mutate } from "swr";
import { fetcher, Trade } from "./utils/fetcher";
import { getActionAbbreviation } from "./utils/getActionAbbreviation";

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
    <div className="flex justify-center space-x-10">
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
            {trades.map((trade) => {
              if (trade.strategy === "WHEEL") {
                return (
                  <tr
                    key={trade.tradeid}
                    className="hover:bg-slate-700 hover:text-slate-200 text-center"
                  >
                    <td>{trade.ticker}</td>
                    <td>{getActionAbbreviation(trade.actions)}</td>
                    <td>{Number(trade.strike).toFixed(2)}</td>
                    <td>{Number(trade.optionprice).toFixed(2)}</td>
                    <td>${+trade.optionprice * +trade.strike * 100}</td>
                    <td>{formatStatus(trade.open)}</td>
                    <td>{formatDate(trade.expirationdate)}</td>
                  </tr>
                );
              }
              return null;
            })}
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
              <th>P/L</th>
              <th>Date Closed</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 text-center">
            {trades.map((trade) => {
              if (trade.strategy === "WHEEL" && trade.closingprice) {
                return (
                  <tr
                    key={trade.tradeid}
                    className="hover:bg-slate-700 hover:text-slate-200 text-center"
                  >
                    <td>{trade.ticker}</td>
                    <td>{getActionAbbreviation(trade.actions)}</td>
                    <td>{trade.strike}</td>
                    <td>{trade.closingprice}</td>
                    <td>
                      ${((+trade.closingprice ?? 0) - +trade.optionprice) * 100}
                    </td>
                    <td>{formatDate(trade.expirationdate)}</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TheWheelChart;
