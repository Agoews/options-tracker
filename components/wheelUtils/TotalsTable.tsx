import React from "react";
import { Trade } from "../utils/fetcher";
import StartingFunds from "../utils/StartingFunds";
import PLReturns from "./PLReturns";
import { fetcher } from "../utils/fetcher";
import useSWR from "swr";

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
  userEmail: string;
}

const TotalsTable: React.FC<TotalsTableProps> = ({
  aggregatedTrades,
  userEmail,
}) => {
  const { data, error, isLoading } = useSWR(
    `/api/get-holdings?email=${userEmail}`,
    fetcher
  );

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  const funds = Number(data.result.rows[0].funds);

  let totalDebits = 0;
  let totalCredits = 0;

  Object.values(aggregatedTrades).forEach((trade) => {
    if (trade.totalClosingQuantity > 0) {
      totalDebits += trade.averageClosingPrice * trade.totalClosingQuantity;
      totalCredits +=
        trade.totalClosingQuantity * trade.openTrades[0].optionprice;
    }
  });

  const totalPL =
    totalCredits > 0 ? ((totalCredits - totalDebits) / totalCredits) * 100 : 0;

  return (
    <div className="w-1/4 mx-auto flex flex-col items-center">
      <PLReturns
        totalCredits={totalCredits}
        totalDebits={totalDebits}
        totalPL={totalPL}
      />
      <StartingFunds
        funds={funds}
        totalCredits={totalCredits}
        userEmail={userEmail}
      />
    </div>
  );
};

export default TotalsTable;
