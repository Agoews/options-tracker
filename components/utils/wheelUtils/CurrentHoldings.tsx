import React from "react";
import { Trade } from "../fetcher";

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
  return <div>CurrentHoldings</div>;
};

export default CurrentHoldings;
