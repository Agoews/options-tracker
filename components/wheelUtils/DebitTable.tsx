import React from "react";
import { Trade } from "../utils/fetcher";
import { getActionAbbreviation } from "../utils/getActionAbbreviation";

interface DebitTableProps {
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
  handleClosedTradeClick: (trade: any) => void;
}

const DebitTable: React.FC<DebitTableProps> = ({
  aggregatedTrades,
  handleClosedTradeClick,
}) => {
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${year}/${month}/${day}`;
  };

  return (
    <div className="xl:w-1/2">
      <h2 className="text-[#00ee00] text-2xl text-left xl:text-center">
        Closed Options
      </h2>
      <div className="overflow-y-auto xl:h-[200px] max-h-[200px] rounded border-2 border-[#00ee00]">
        <table className="table table-xs w-full table-pin-rows text-xs">
          <thead>
            <tr className="text-[#00ee00] text-center">
              <th className="md:hidden">Trade Details</th>
              <th className="hidden md:table-cell">Ticker</th>
              <th className="hidden md:table-cell">Action</th>
              <th>Quantity</th>
              <th>Debit</th>
              <th>Total</th>
              <th>P/L</th>
              <th className="hidden md:table-cell">Date Closed</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 text-center">
            {Object.entries(aggregatedTrades).map(
              ([tradeId, { openTrades, closedTrades }]) => {
                // Display only the first closed trade per tradeId
                if (!closedTrades[closedTrades.length - 1]) return null;

                if (openTrades[0].strategy === "WHEEL") {
                  return (
                    <tr
                      key={`${tradeId}-0`}
                      className="hover:bg-slate-700 hover:text-slate-200 hover:cursor-pointer text-center"
                      onClick={() => handleClosedTradeClick(closedTrades[0])}
                    >
                      <td className="md:hidden">
                        {`${openTrades[0].ticker} ${getActionAbbreviation(
                          openTrades[0].actions
                        )} $${Number(openTrades[0].strike).toFixed(
                          2
                        )} ${formatDate(openTrades[0].expirationdate)}`}
                      </td>
                      <td className="hidden md:table-cell">
                        {openTrades[0].ticker}
                      </td>
                      <td className="hidden md:table-cell">
                        {getActionAbbreviation(openTrades[0].actions)}
                      </td>
                      <td>
                        {aggregatedTrades[Number(tradeId)].totalClosingQuantity}
                      </td>
                      <td>
                        {aggregatedTrades[
                          Number(tradeId)
                        ].averageClosingPrice?.toFixed(2)}
                      </td>
                      <td>
                        $
                        {(
                          aggregatedTrades[Number(tradeId)]
                            .totalClosingQuantity *
                          aggregatedTrades[Number(tradeId)]
                            .averageClosingPrice *
                          100
                        ).toFixed(2)}
                      </td>
                      <td>
                        {closedTrades[0]?.closingprice
                          ? (
                              ((Number(openTrades[0]?.optionprice) -
                                Number(
                                  aggregatedTrades[Number(tradeId)]
                                    .averageClosingPrice
                                )) /
                                Number(openTrades[0]?.optionprice)) *
                              100
                            ).toFixed(2) + "%"
                          : "N/A"}
                      </td>
                      <td className="hidden md:table-cell">
                        {closedTrades[0].completiondate
                          ? formatDate(closedTrades[0].completiondate)
                          : "N/A"}
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
  );
};

export default DebitTable;
