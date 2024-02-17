import React from "react";
import { Trade } from "../fetcher";

interface TotalsTableProps {
  aggregatedTrades: {
    [key: number]: {
      openTrades: Array<
        Pick<
          Trade,
          | "tradeid"
          | "ticker"
          | "actions"
          | "strategy"
          | "strike"
          | "openquantity"
          | "isclosed"
          | "optionprice"
          | "expirationdate"
        >
      >;
      closedTrades: Array<
        Pick<
          Trade,
          | "tradeid"
          | "closedtradeid"
          | "closingprice"
          | "completiondate"
          | "closedquantity"
        >
      >;
      averageClosingPrice: number;
      totalClosingQuantity: number;
    };
  };
}

const TotalsTable: React.FC<TotalsTableProps> = ({ aggregatedTrades }) => {
  let totalReturns = 0;
  let totalInvested = 0;

  // figure out the PL and Total

  Object.values(aggregatedTrades).forEach((trade) => {
    if (trade.averageClosingPrice > 0) {
      totalReturns += trade.averageClosingPrice * trade.totalClosingQuantity;
      totalInvested +=
        trade.totalClosingQuantity * trade.openTrades[0].optionprice;
    }
  });
  // Object.values(aggregatedTrades).forEach(({ openTrades, closedTrades }) => {
  //   closedTrades.forEach((trade) => {
  //     if (trade.closingprice && trade.closedquantity > 0) {
  //       totalReturns += trade.closingprice;
  //       totalClosures++;
  //     }
  //   });

  //   openTrades.forEach((trade) => {
  //     totalInvested += trade.optionprice * trade.openquantity;
  //   });
  // });

  // Assuming totalInvested is not 0 to avoid division by zero error
  const totalPL =
    totalInvested > 0
      ? ((totalInvested - totalReturns) / totalInvested) * 100
      : 0;

  return (
    <div className="w-1/4 mx-auto flex flex-col items-center">
      <h2 className="text-slate-200 my-1">Totals</h2>
      <table className="table table-xs text-xs">
        <thead>
          <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
            <th>Total Credits</th>
            <th>Total Debits</th>
            <th>Running P/L (%)</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          <tr>
            <td>${Number(totalInvested).toFixed(2)}</td>
            <td>${Number(totalReturns).toFixed(2)}</td>
            <td>{totalPL.toFixed(2)}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TotalsTable;