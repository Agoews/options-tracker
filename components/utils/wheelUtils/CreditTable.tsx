import React from "react";
import { Trade } from "../fetcher";
import { getActionAbbreviation } from "../getActionAbbreviation";

interface CreditTableProps {
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
  handleOpenTradeClick: (trade: any) => void;
}

export const CreditTable: React.FC<CreditTableProps> = ({
  aggregatedTrades,
  handleOpenTradeClick,
}) => {
  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  return (
    <div className="w-1/2 mr-5">
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
          {Object.entries(aggregatedTrades).map(([tradeId, { openTrades }]) => {
            if (
              openTrades.length > 0 &&
              openTrades[0].isclosed !== true &&
              openTrades[0].strategy === "WHEEL"
            ) {
              return (
                <tr
                  key={tradeId}
                  className="hover:bg-slate-700 hover:text-slate-200 text-center"
                  onClick={() => handleOpenTradeClick(openTrades[0])}
                >
                  <td>{openTrades[0].ticker}</td>
                  <td>{getActionAbbreviation(openTrades[0].actions)}</td>
                  <td>{Number(openTrades[0].openquantity)}</td>
                  <td>{Number(openTrades[0].optionprice).toFixed(2)}</td>
                  <td>
                    $
                    {(
                      +openTrades[0].openquantity *
                      +openTrades[0].optionprice *
                      100
                    ).toFixed(2)}
                  </td>
                  <td>
                    {openTrades[0].openquantity === 0 ? "Closed" : "Open"}
                  </td>
                  <td>{formatDate(openTrades[0].expirationdate)}</td>
                </tr>
              );
            }
            return null; // Skip rendering if there are no open trades
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CreditTable;
