import React from "react";
import { Trade } from "../utils/fetcher";
import { getActionAbbreviation } from "../utils/getActionAbbreviation";

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
    <div className="xl:w-1/2">
      <h2 className="text-[#00ee00] text-2xl text-left xl:text-center">
        Credits
      </h2>
      <div className="overflow-y-auto xl:h-[200px] max-h-[200px] rounded border-2 border-[#00ee00]">
        <table className="table table-xs w-full table-pin-rows text-xs">
          <thead>
            <tr className="text-[#00ee00] text-center">
              <th>Ticker</th>
              <th>Action</th>
              <th>Strike</th>
              <th># of Options</th>
              <th>Credit</th>
              <th>Total</th>
              <th>Expiration</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 text-center">
            {Object.entries(aggregatedTrades).map(
              ([tradeId, { openTrades }]) => {
                if (
                  openTrades.length > 0 &&
                  openTrades[0].isclosed !== true &&
                  openTrades[0].strategy === "WHEEL"
                ) {
                  return (
                    <tr
                      key={tradeId}
                      className="hover:bg-slate-700 hover:text-slate-200 hover: cursor-pointer text-center"
                      onClick={() => handleOpenTradeClick(openTrades[0])}
                    >
                      <td>{openTrades[0].ticker}</td>
                      <td>{getActionAbbreviation(openTrades[0].actions)}</td>
                      <td>${Number(openTrades[0].strike).toFixed(2)}</td>
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
                      <td>{formatDate(openTrades[0].expirationdate)}</td>
                    </tr>
                  );
                }
                return null; // Skip rendering if there are no open trades
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreditTable;
