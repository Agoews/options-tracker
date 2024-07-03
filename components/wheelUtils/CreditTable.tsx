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
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${year}/${month}/${day}`;
  };

  return (
    <div className="w-[320px] md:w-1/2 ">
      <h2 className="text-[#00ee00] text-2xl text-left md:text-center">
        Open Options
      </h2>
      <div className="overflow-y-auto overflow-x-auto md:h-[200px] max-h-[200px] border-2 border-[#00ee00]">
        <div className="overflow-x-auto">
          <table className="table table-xs w-full table-pin-rows text-xs">
            <thead>
              <tr className="text-[#00ee00] text-center">
                <th className="md:hidden">Trade Details</th>
                <th className="hidden md:table-cell">Ticker</th>
                <th className="hidden md:table-cell">Action</th>
                <th className="hidden md:table-cell">Strike</th>
                <th>#</th>
                <th>Credit</th>
                <th>Total</th>
                <th className="hidden md:table-cell">Experation</th>
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
                        className="hover:bg-slate-700 hover:text-slate-200 cursor-pointer text-center"
                        onClick={() => handleOpenTradeClick(openTrades[0])}
                      >
                        <td className="md:hidden flex flex-col items-start space-y-1">
                          <span>{openTrades[0].ticker}</span>
                          <span>
                            - {getActionAbbreviation(openTrades[0].actions)}
                          </span>
                          <span>
                            - ${Number(openTrades[0].strike).toFixed(2)}
                          </span>
                          <span>
                            - {formatDate(openTrades[0].expirationdate)}
                          </span>
                        </td>
                        <td className="hidden md:table-cell">
                          {openTrades[0].ticker}
                        </td>
                        <td className="hidden md:table-cell">
                          {getActionAbbreviation(openTrades[0].actions)}
                        </td>
                        <td className="hidden md:table-cell">
                          ${Number(openTrades[0].strike).toFixed(2)}
                        </td>
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
                        <td className="hidden md:table-cell">
                          {formatDate(openTrades[0].expirationdate)}
                        </td>
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
    </div>
  );
};

export default CreditTable;
