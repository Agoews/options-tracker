"use client";
import CallReturns from "@/components/callsPutsUtils/CallReturns";
import PutReturns from "@/components/callsPutsUtils/PutReturns";
import TotalReturns from "@/components/utils/TotalReturns";
import { fetcher } from "@/components/utils/fetcher";
import { tradeTableFormatter } from "@/components/utils/tradeTableFormatter";
import PLReturns from "@/components/wheelUtils/PLReturns";
import { useState, useEffect } from "react";
import useSWR from "swr";

interface TotalReturnsTableProps {
  userEmail: string;
}

const TotalReturnsTable: React.FC<TotalReturnsTableProps> = ({ userEmail }) => {
  // fetch trades data
  const { data: tradesData, error: tradesError } = useSWR(
    `/api/get-trades?email=${userEmail}`,
    fetcher
  );

  // fetch funds data
  const { data: fundsData, error: fundsError } = useSWR(
    `/api/get-funds?email=${userEmail}`,
    fetcher
  );

  const [startingFunds, setStartingFunds] = useState(0);
  const [editedStartingFunds, setEditedStartingFunds] = useState(0);
  const [startingFundsModalToggle, setStartingFundsModalToggle] =
    useState(false);

  useEffect(() => {
    if (fundsData && fundsData.result.rows) {
      setStartingFunds(Number(fundsData.result.rows[0].funds) || 0);
    }
  }, [fundsData]);

  if (tradesError || fundsError) return <div>Failed to load</div>;
  if (!tradesData || !fundsData) return <div>Loading...</div>;

  const handleSaveUpdateFunds = async () => {
    const updatedStartingFunds = startingFunds + editedStartingFunds;
    const url = `/api/update-funds?email=${userEmail}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updatedStartingFunds }),
      });

      if (!response.ok) {
        throw new Error("Failed to update the funds.");
      }
      setStartingFunds(updatedStartingFunds);
      setEditedStartingFunds(0);
      handleUpdateFundsModal();
    } catch (error) {
      console.error("Error updating funds: ", error);
    }
  };

  const handleUpdateFundsModal = () => {
    setStartingFundsModalToggle(!startingFundsModalToggle);
  };

  const handleCancel = () => {
    setStartingFundsModalToggle(!startingFundsModalToggle);
  };

  const handleStartingFundsInputChange = (
    e: React.ChangeEvent<HTMLElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    let funds: number = Number(target.value);
    setEditedStartingFunds(funds);
  };

  console.log("funds data: ", fundsData.result);
  console.log("trade data: ", tradesData.result);
  const aggregatedTrades = tradeTableFormatter(tradesData.result.rows);

  let wheelTotalDebits = 0;
  let wheelTotalCredits = 0;
  let callOpeningCost = 0;
  let callClosingCost = 0;
  let putOpeningCost = 0;
  let putClosingCost = 0;

  Object.values(aggregatedTrades).forEach((trade) => {
    if (
      trade.totalClosingQuantity > 0 &&
      trade.openTrades[0].strategy === "WHEEL"
    ) {
      wheelTotalDebits +=
        trade.averageClosingPrice * trade.totalClosingQuantity;
      wheelTotalCredits +=
        trade.totalClosingQuantity * trade.openTrades[0].optionprice;
    } else if (
      trade.openTrades[0].strategy === "" &&
      trade.openTrades[0].actions === "CALL"
    ) {
      callOpeningCost += trade.averageClosingPrice * trade.totalClosingQuantity;
      callClosingCost +=
        trade.totalClosingQuantity * trade.openTrades[0].optionprice;
    } else if (
      trade.openTrades[0].strategy === "" &&
      trade.openTrades[0].actions === "PUT"
    ) {
      putOpeningCost += trade.averageClosingPrice * trade.totalClosingQuantity;
      putClosingCost +=
        trade.totalClosingQuantity * trade.openTrades[0].optionprice;
    }
  });

  const wheelTotalPL =
    wheelTotalCredits > 0 ? (wheelTotalCredits - wheelTotalDebits) * 100 : 0;
  const callTotalPL =
    callClosingCost > 0 ? (callOpeningCost - callClosingCost) * 100 : 0;
  const putTotalPL =
    putClosingCost > 0 ? (putOpeningCost - putClosingCost) * 100 : 0;

  const totalProfits = (wheelTotalPL + callTotalPL + putTotalPL) / 100;

  return (
    <>
      {/* Total Returns */}
      <div className="text-2xl">
        {aggregatedTrades ? (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-6 xl:space-x-4 space-y-2">
              <div className="col-span-1 xl:col-span-1"></div>
              <div className="col-span-1 xl:col-span-4 items-left text-left xl:items-center xl:text-center">
                <TotalReturns
                  totalProfits={totalProfits}
                  startingFunds={startingFunds}
                  startingFundsModalToggle={startingFundsModalToggle}
                  handleCancel={handleCancel}
                  handleSaveUpdateFunds={handleSaveUpdateFunds}
                  handleUpdateFundsModal={handleUpdateFundsModal}
                  handleStartingFundsInputChange={
                    handleStartingFundsInputChange
                  }
                />
              </div>
              <div className="col-span-1 xl:col-span-1"></div>
              <div className="col-span-1 xl:col-span-2">
                <PLReturns
                  totalCredits={wheelTotalCredits}
                  totalDebits={wheelTotalDebits}
                  totalPL={wheelTotalPL}
                />
              </div>
              <div className="col-span-1 xl:col-span-2 ">
                <CallReturns
                  closingCosts={callClosingCost}
                  openingCosts={callOpeningCost}
                  totalPL={callTotalPL}
                />
              </div>
              <div className="col-span-1 xl:col-span-2">
                <PutReturns
                  closingCosts={putClosingCost}
                  openingCosts={putOpeningCost}
                  totalPL={putTotalPL}
                />
              </div>
            </div>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
};

export default TotalReturnsTable;
