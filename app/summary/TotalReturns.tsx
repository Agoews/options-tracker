"use client";
import CallReturns from "@/components/callsPutsUtils/CallReturns";
import PutReturns from "@/components/callsPutsUtils/PutReturns";
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

  const callsPutsOptions = Object.entries(aggregatedTrades).filter(
    (option) =>
      option[1].openTrades[0].actions === "CALL" ||
      option[1].openTrades[0].actions === "PUT"
  );

  let wheelTotalDebits = 0;
  let wheelTotalCredits = 0;
  let callTotalDebits = 0;
  let callTotalCredits = 0;
  let putTotalDebits = 0;
  let putTotalCredits = 0;

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
      callTotalDebits += trade.averageClosingPrice * trade.totalClosingQuantity;
      callTotalCredits +=
        trade.totalClosingQuantity * trade.openTrades[0].optionprice;
    } else if (
      trade.openTrades[0].strategy === "" &&
      trade.openTrades[0].actions === "PUT"
    ) {
      putTotalDebits += trade.averageClosingPrice * trade.totalClosingQuantity;
      putTotalCredits +=
        trade.totalClosingQuantity * trade.openTrades[0].optionprice;
    }
  });

  const wheelTotalPL =
    wheelTotalCredits > 0 ? (wheelTotalCredits - wheelTotalDebits) * 100 : 0;
  const callTotalPL =
    callTotalCredits > 0 ? (callTotalCredits - callTotalDebits) * 100 : 0;
  const putTotalPL =
    putTotalCredits > 0 ? (putTotalCredits - putTotalDebits) * 100 : 0;

  // console.log("callsPutsOptions: ", callsPutsOptions);
  // console.log("wheelOptions: ", wheelTotalCredits, wheelTotalDebits);
  // console.log("aggregatedTrades: ", aggregatedTrades);

  // fix calculations for calls and puts
  // arrange tables better
  // create table for total returns on initial investment

  return (
    <>
      {/* Total Returns */}
      <div className="overflow-x-auto">
        {aggregatedTrades ? (
          <>
            <PLReturns
              totalCredits={wheelTotalCredits}
              totalDebits={wheelTotalDebits}
              totalPL={wheelTotalPL}
            />
            <CallReturns
              totalCredits={callTotalCredits}
              totalDebits={callTotalDebits}
              totalPL={callTotalPL}
            />
            <PutReturns
              totalCredits={putTotalCredits}
              totalDebits={putTotalDebits}
              totalPL={putTotalPL}
            />
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
};

export default TotalReturnsTable;
