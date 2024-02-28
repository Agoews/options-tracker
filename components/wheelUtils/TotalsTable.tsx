import React from "react";
import { Trade } from "../utils/fetcher";
import StartingFunds from "./StartingFunds";
import PLReturns from "./PLReturns";

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

  Object.values(aggregatedTrades).forEach((trade) => {
    if (trade.totalClosingQuantity > 0) {
      totalReturns += trade.averageClosingPrice * trade.totalClosingQuantity;
      totalInvested +=
        trade.totalClosingQuantity * trade.openTrades[0].optionprice;
    }
  });

  const totalPL =
    totalInvested > 0
      ? ((totalInvested - totalReturns) / totalInvested) * 100
      : 0;

  return (
    <div className="w-1/4 mx-auto flex flex-col items-center">
      <StartingFunds
        totalInvested={totalInvested}
        totalReturns={totalReturns}
        totalPL={totalPL}
      />
      <PLReturns
        totalInvested={totalInvested}
        totalReturns={totalReturns}
        totalPL={totalPL}
      />
    </div>
  );
};

export default TotalsTable;
