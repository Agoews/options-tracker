import React from "react";
import { Trade } from "../utils/fetcher";

interface CurrentHoldingsProps {
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

const CurrentHoldings: React.FC<CurrentHoldingsProps> = ({
  aggregatedTrades,
}) => {
  return <div className="text-slate-200">CurrentHoldings (WIP)</div>;
};

export default CurrentHoldings;
