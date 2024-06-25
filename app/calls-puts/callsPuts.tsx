"use client";
import React, { SyntheticEvent, useState } from "react";
import { Trade, fetcher } from "../../components/utils/fetcher";
import useSWR, { mutate } from "swr";
import { tradeTableFormatter } from "../../components/utils/tradeTableFormatter";
import { getActionAbbreviation } from "../../components/utils/getActionAbbreviation";
import CloseCallPutModal from "./CloseCallPutModal";

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
  const [closingPrice, setClosingPrice] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState<string | null>(null);
  const [closedQuantity, setClosedQuantity] = useState<string | null>(null);
  const [openTradeModalToggle, setOpenTradeModalToggle] = useState(false);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  const handleRowClick = (trade: Trade) => {
    console.log(trade.tradeid);
    setEditingTradeId(trade.tradeid);
    setEditedTrade({ ...trade });
    setOpenTradeModalToggle(true);
  };

  const handleCloseTrade = async (e: SyntheticEvent) => {
    e.preventDefault();
    setOpenTradeModalToggle(false);

    const tradeData = {
      tradeid: editingTradeId,
      closingprice: closingPrice,
      completiondate: completionDate,
      closedquantity: closedQuantity,
    };

    console.log(tradeData);
    // try {
    //   const response = await fetch("/api/close-call-put-trade", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(tradeData),
    //   });

    //   const result = await response.json();

    //   if (response.ok) {
    //     console.log("Closed trade saved successfully!", result);
    //   } else {
    //     console.error("Error saving closed trade:", result);
    //   }

    //   mutate(`/api/get-trades?email=${userEmail}`);
    // } catch (error) {
    //   console.error("Error making request:", error);
    // }
  };

  const handleCancel = () => {
    setOpenTradeModalToggle(false);
    setClosedQuantity(null);
    setClosingPrice(null);
    setCompletionDate(null);
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

  const filteredOptions = Object.entries(aggregatedTrades).filter(
    (option) =>
      option[1].openTrades[0].actions === "CALL" ||
      option[1].openTrades[0].actions === "PUT"
  );

  return (
    <div className="w-[310px]">
      <div className="space-y-4">
        <div>
          {/* OPEN TRADES */}
          <h2 className="text-[#00ee00] text-2xl mb-1 text-left">
            Open Positions
          </h2>
          <table className="table table-xs table-pin-rows table-pin-cols text-xs rounded border-2 border-[#00ee00]">
            <thead>
              <tr className="text-[#00ee00] text-center">
                <th className="md:hidden">Trade Details</th>
                <th className="hidden md:table-cell">Ticker</th>
                <th className="hidden md:table-cell">Action</th>
                <th className="hidden md:table-cell">Strike</th>
                <th>#</th>
                <th>Entry</th>
                <th>Breakeven</th>
                <th>DTE</th>
                <th className="hidden md:table-cell">Expiration Date</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {filteredOptions.map((option) => {
                const trade = option[1].openTrades[0]; // assuming each option has at least one openTrade
                if (trade.openquantity) {
                  return (
                    <tr
                      key={trade.tradeid}
                      className="hover:bg-slate-700 hover:text-slate-200 hover:cursor-pointer text-center"
                      onClick={() => handleRowClick(trade)}
                    >
                      <td className="md:hidden flex flex-col items-start space-y-1">
                        <span>{trade.ticker}</span>
                        <span>- {getActionAbbreviation(trade.actions)}</span>
                        <span>- ${Number(trade.strike).toFixed(2)}</span>
                        <span>- {formatDate(trade.expirationdate)}</span>
                      </td>
                      <td className="hidden md:table-cell">{trade.ticker}</td>
                      <td className="hidden md:table-cell">
                        {getActionAbbreviation(trade.actions)}
                      </td>
                      <td className="hidden md:table-cell">
                        ${Number(trade.strike).toFixed(2)}
                      </td>
                      <td>{trade.openquantity}</td>
                      <td>{Number(trade.optionprice).toFixed(2)}</td>
                      <td>
                        $
                        {trade.actions === "COVERED CALL" ||
                        trade.actions === "CALL"
                          ? Number(
                              trade.strike +
                                trade.optionprice * trade.openquantity
                            ).toFixed(2)
                          : Number(
                              trade.strike -
                                trade.optionprice * trade.openquantity
                            ).toFixed(2)}
                      </td>
                      <td>{calculateDTE(formatDate(trade.expirationdate))}</td>
                      <td className="hidden md:table-cell">
                        {formatDate(trade.expirationdate)}
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
          <h2 className="text-[#00ee00] text-2xl mb-1 text-left">
            Closed Positions
          </h2>
          <table className="table table-xs table-pin-rows table-pin-cols text-xs rounded border-2 border-[#00ee00]">
            <thead>
              <tr className="text-[#00ee00] text-center">
                <th className="md:hidden">Trade Details</th>
                <th className="hidden md:table-cell">Ticker</th>
                <th className="hidden md:table-cell">Action</th>
                <th className="hidden md:table-cell">Strike</th>
                <th>#</th>
                <th>Avg Closing</th>
                {/* <th>Total</th> */}
                <th>P/L</th>
                <th className="hidden md:table-cell">Closed Date</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {filteredOptions.map((trade) => {
                const closed = trade[1].closedTrades[0];
                if (!closed) return null;

                return (
                  <tr
                    key={trade[0]}
                    className="hover:bg-slate-700 hover:text-slate-200 hover:cursor-pointer text-center"
                  >
                    <td className="md:hidden flex flex-col items-start space-y-1">
                      <span>{trade[1].openTrades[0].ticker}</span>
                      <span>
                        -{" "}
                        {getActionAbbreviation(trade[1].openTrades[0].actions)}
                      </span>
                      <span>
                        - ${Number(trade[1].openTrades[0].strike).toFixed(2)}
                      </span>
                      <span>- {formatDate(closed.completiondate)}</span>
                    </td>
                    <td className="hidden md:table-cell">
                      {trade[1].openTrades[0].ticker}
                    </td>
                    <td className="hidden md:table-cell">
                      {getActionAbbreviation(trade[1].openTrades[0].actions)}
                    </td>
                    <td className="hidden md:table-cell">
                      {trade[1].openTrades[0].strategy}
                    </td>
                    <td className="hidden md:table-cell">
                      ${Number(trade[1].openTrades[0].strike).toFixed(2)}
                    </td>
                    <td>{trade[1].totalClosingQuantity}</td>
                    <td>{trade[1].averageClosingPrice.toFixed(2)}</td>
                    {/* <td>
                      $
                      {(
                        trade[1].totalClosingQuantity *
                        trade[1].averageClosingPrice *
                        100
                      ).toFixed(2)}
                    </td> */}
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
                    <td className="hidden md:table-cell">
                      {formatDate(closed.completiondate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <CloseCallPutModal
        editingTradeId={editingTradeId}
        openTradeModalToggle={openTradeModalToggle}
        setClosingPrice={setClosingPrice}
        setCompletionDate={setCompletionDate}
        setClosedQuantity={setClosedQuantity}
        handleCancel={handleCancel}
        handleCloseTrade={handleCloseTrade}
      />
    </div>
  );
};

export default CallsPutsTable;
