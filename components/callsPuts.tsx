"use client";
import React, { useState } from "react";
import { Trade, fetcher } from "./utils/fetcher";
import useSWR from "swr";
import { tradeTableFormatter } from "./utils/tradeTableFormatter";
import { getActionAbbreviation } from "./utils/getActionAbbreviation";

interface CallsPutsProps {
  userEmail: string;
}

const CallsPutsTable: React.FC<CallsPutsProps> = ({ userEmail }) => {
  const initialTradeState: Trade = {
    tradeid: 0,
    closedtradeid: 0,
    ticker: "",
    actions: "",
    strategy: "",
    optionprice: 0,
    strike: 0,
    currentprice: 0,
    closingprice: 0,
    expirationdate: "",
    completiondate: "",
    openquantity: 0,
    closedquantity: 0,
    isclosed: false,
    averageClosingPrice: 0,
    totalClosingQuantity: 0,
    openTrades: [],
    closedTrades: [],
  };

  // fetch all data from /api/get-trades
  const { data, error, isLoading } = useSWR(
    `/api/get-trades?email=${userEmail}`,
    fetcher
  );

  const [editingTradeId, setEditingTradeId] = useState<number | null>(null);
  const [editedTrade, setEditedTrade] = useState<Trade>(initialTradeState);
  const [openTradeModalToggle, setOpenTradeModalToggle] = useState(false);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  const handleRowClick = (trade: Trade) => {
    setEditingTradeId(trade.tradeid);
    setEditedTrade({ ...trade });
    setOpenTradeModalToggle(true);
  };

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  const calculateDTE = (expirationDateString: string) => {
    const today = new Date();
    const expirationDate = new Date(expirationDateString);
    const differenceInTime = expirationDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };

  const aggregatedTrades = tradeTableFormatter(data.result.rows);
  // console.log("data", data.result.rows);

  const filteredOptions = Object.entries(aggregatedTrades).filter(
    (option) =>
      option[1].openTrades[0].actions === "CALL" ||
      option[1].openTrades[0].actions === "PUT"
  );

  console.log("filteredOptions: ", filteredOptions);

  return (
    <>
      <div className="space-y-2">
        <div>
          {/* OPEN TRADES */}
          <table className="table table-xs table-pin-rows table-pin-cols text-xs">
            <thead>
              <tr className="bg-slate-400 text-slate-800 text-center">
                <td>Ticker</td>
                <td>Action</td>
                <td>Strike</td>
                <td>Contracts</td>
                <td>Entry Price</td>
                <td>Stock Entry</td>
                <td>Breakeven</td>
                <td>DTE</td>
                <td>Expiration Date</td>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {filteredOptions.map((trade) => {
                if (trade[1].openTrades[0].openquantity) {
                  return (
                    <tr
                      key={trade[0]}
                      className="hover:bg-slate-700 hover:text-slate-200 text-center"
                    >
                      <td>{trade[1].openTrades[0].ticker}</td>
                      <td>
                        {getActionAbbreviation(trade[1].openTrades[0].actions)}
                      </td>
                      <td>{trade[1].openTrades[0].strike}</td>
                      <td>{trade[1].openTrades[0].openquantity}</td>
                      <td>{trade[1].openTrades[0].optionprice}</td>
                      <td>{trade[1].openTrades[0].currentprice}</td>
                      <td>
                        $
                        {trade[1].openTrades[0].actions === "COVERED CALL" ||
                        trade[1].openTrades[0].actions === "CALL"
                          ? Number(
                              +trade[1].openTrades[0].strike +
                                +trade[1].openTrades[0].optionprice
                            ).toFixed(2)
                          : Number(
                              +trade[1].openTrades[0].strike -
                                +trade[1].openTrades[0].optionprice
                            ).toFixed(2)}
                      </td>
                      <td>
                        {calculateDTE(
                          formatDate(trade[1].openTrades[0].expirationdate)
                        )}
                      </td>
                      <td>
                        {formatDate(trade[1].openTrades[0].expirationdate)}
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>

        <div>
          {/* CLOSED TRADES */}
          <table className="table table-xs table-pin-rows table-pin-cols text-xs">
            <thead>
              <tr className="text-slate-300 text-center">
                <th>Ticker</th>
                <th>Action</th>
                <th>Strike</th>
                <th>Contracts</th>
                <th>Avg Closing Price</th>
                <th>P/L</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {filteredOptions.map((trade) => {
                const closed = trade[1].closedTrades[0];
                if (!closed) return null;

                return (
                  <tr
                    key={trade[0]}
                    className="hover:bg-slate-700 hover:text-slate-200 text-center"
                  >
                    <td>{trade[1].openTrades[0].ticker}</td>
                    <td>
                      {getActionAbbreviation(trade[1].openTrades[0].actions)}
                    </td>
                    <td>{trade[1].openTrades[0].strike}</td>
                    <td>{trade[1].totalClosingQuantity}</td>
                    <td>{trade[1].averageClosingPrice}</td>
                    <td>
                      {trade[1].closedTrades[0].closingprice
                        ? (
                            ((trade[1].averageClosingPrice -
                              trade[1].openTrades[0].optionprice) /
                              trade[1].openTrades[0].optionprice) *
                            100
                          ).toFixed(2) + "%"
                        : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CallsPutsTable;
