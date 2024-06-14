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
  startingFunds: number;
  startingFundsModalToggle: boolean;
  handleStartingFundsInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleUpdateFundsModal: () => void;
  handleSaveUpdateFunds: () => void;
  handleCancel: () => void;
}

const TotalsTable: React.FC<TotalsTableProps> = ({
  aggregatedTrades,
  userEmail,
  startingFunds,
  startingFundsModalToggle,
  handleStartingFundsInputChange,
  handleUpdateFundsModal,
  handleSaveUpdateFunds,
  handleCancel,
}) => {
  let totalDebits = 0;
  let totalCredits = 0;

  Object.values(aggregatedTrades).forEach((trade) => {
    if (
      trade.totalClosingQuantity > 0 &&
      trade.openTrades[0].strategy === "WHEEL"
    ) {
      totalDebits += trade.averageClosingPrice * trade.totalClosingQuantity;
      totalCredits +=
        trade.totalClosingQuantity * trade.openTrades[0].optionprice;
    }
  });

  const totalPL = totalCredits > 0 ? (totalCredits - totalDebits) * 100 : 0;

  return (
    <div className="xl:w-1/2 mx-auto flex flex-col">
      <PLReturns
        totalCredits={totalCredits}
        totalDebits={totalDebits}
        totalPL={totalPL}
      />
      <StartingFunds
        totalCredits={totalCredits}
        userEmail={userEmail}
        startingFunds={startingFunds}
        startingFundsModalToggle={startingFundsModalToggle}
        handleStartingFundsInputChange={handleStartingFundsInputChange}
        handleSaveUpdateFunds={handleSaveUpdateFunds}
        handleCancel={handleCancel}
        handleUpdateFundsModal={handleUpdateFundsModal}
      />
    </div>
  );
};

export default TotalsTable;
