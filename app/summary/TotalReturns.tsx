"use client";
import CallReturns from "@/components/callsPutsUtils/CallReturns";
import PutReturns from "@/components/callsPutsUtils/PutReturns";
import StartingFunds from "@/components/utils/StartingFunds";
import TotalReturns from "@/components/utils/TotalReturns";
import { fetcher } from "@/components/utils/fetcher";
import { tradeTableFormatter } from "@/components/utils/tradeTableFormatter";
import PLReturns from "@/components/wheelUtils/PLReturns";
import useSWR from "swr";

interface TotalReturnsTableProps {
  userEmail: string;
}

const TotalReturnsTable: React.FC<TotalReturnsTableProps> = ({ userEmail }) => {
  // fetch all data from /api/get-trades
  const { data, error, isLoading } = useSWR(
    `/api/get-trades?email=${userEmail}`,
    fetcher
  );

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  const aggregatedTrades = tradeTableFormatter(data.result.rows);

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
            <div className="grid grid-cols-3">
              <div className="col-span-3">
                <TotalReturns
                  totalProfits={totalProfits}
                  userEmail={userEmail}
                />
              </div>
              <div className="col-span-1">
                <PLReturns
                  totalCredits={wheelTotalCredits}
                  totalDebits={wheelTotalDebits}
                  totalPL={wheelTotalPL}
                />
              </div>
              <div className="col-span-1 mx-2">
                <CallReturns
                  closingCosts={callClosingCost}
                  openingCosts={callOpeningCost}
                  totalPL={callTotalPL}
                />
              </div>
              <div className="col-span-1">
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
