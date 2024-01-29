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

  return (
    <div className="flex justify-center items-center space-x-4">
      {/* Credits Table */}
      <div className="w-1/2">
        <h2 className="text-slate-200 mb-1">Credits</h2>
        <table className="table table-xs w-full text-xs">
          <thead>
            <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
              <th>Action</th>
              <th># of Options</th>
              <th>Credit</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date Opened</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 text-center">
            {/* Table rows for Credits */}
            {/* Replace with actual data */}
            <tr>
              <td>CC</td>
              <td>12</td>
              <td>2.O0</td>
              <td>2400</td>
              <td>OPEN</td>
              <td>OPEN</td>
            </tr>
            <tr>
              <td>CALL</td>
              <td>12</td>
              <td>2.O0</td>
              <td>2400</td>
              <td>OPEN</td>
              <td>OPEN</td>
            </tr>
            {/* ... more rows ... */}
          </tbody>
        </table>
      </div>

      {/* Debits Table */}
      <div className="w-1/2">
        <h2 className="text-slate-200 mb-1">Debits</h2>
        <table className="table table-xs w-full text-xs">
          <thead>
            <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
              <th>Action</th>
              <th># of Options</th>
              <th>Debit</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date Closed</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 text-center">
            {/* Table rows for Debits */}
            {/* Replace with actual data */}
            <tr>
              <td>1</td>
              <td>Item 1</td>
              <td>$50</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Item 2</td>
              <td>$75</td>
            </tr>
            {/* ... more rows ... */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TheWheelChart;
