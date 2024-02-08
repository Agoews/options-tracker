"use client";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, Trade } from "./utils/fetcher";
import { getActionAbbreviation } from "./utils/getActionAbbreviation";
import TradeEditModal from "./utils/TradeEditModal";
import { tradeTableFormatter } from "./utils/tradeTableFormatter";

const TheWheelChart = () => {
  const initialTradeState: Trade = {
    tradeid: 0,
    closedtradeid: 0,
    ticker: "",
    actions: "",
    strategy: "",
    optionprice: 0,
    strike: 0,
    closingprice: 0,
    expirationdate: "",
    completiondate: "",
    openquantity: 0,
    closedquantity: 0,
    isclosed: false,
    sumClosingPrices: 0,
    averageClosingPrice: 0,
    totalClosingQuantity: 0,
    openTrades: [],
    closedTrades: [],
  };

  // fetch all data from /api/get-trades
  const { data, error, isLoading } = useSWR("/api/get-trades", fetcher);

  const [editingTradeId, setEditingTradeId] = useState<number | null>(null);
  const [editedTrade, setEditedTrade] = useState<Trade>(initialTradeState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;
  const trades: Trade[] = data.result.rows;

  const handleRowClick = (trade: Trade) => {
    setEditingTradeId(trade.tradeid);
    setEditedTrade({ ...trade });
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLElement>,
    field: keyof Trade
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    let value: string | number | null = target.value;

    if (
      field === "closingprice" ||
      field === "optionprice" ||
      field === "strike"
    ) {
      const parsedValue = parseFloat(value);

      if (isNaN(parsedValue)) {
        value = null;
      }
    }
    setEditedTrade({ ...editedTrade, [field]: value });
  };

  const handleSaveOpenTrades = async () => {
    let newOpenQuantity =
      editedTrade.openquantity - (editedTrade.closedquantity || 0);

    if (newOpenQuantity < 0) {
      newOpenQuantity = 0;
    }
    const updatedTrade = {
      ...editedTrade,
      openquantity: newOpenQuantity,
    };

    const url = `/api/update-open-trades/`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTrade),
      });

      if (!response.ok) {
        throw new Error("Failed to update the trade.");
      }
      mutate("/api/get-trades");
    } catch (error) {
      console.error("Error updating trade:", error);
    }

    setEditingTradeId(null);
    setIsModalOpen(false);
  };

  const handleSaveClosedTrades = async () => {
    const updatedTrade = {
      ...editedTrade,
      tradeid: editedTrade.tradeid,
      closingprice: null,
      completiondate: null,
      reopenquantity: Number(editedTrade.closedquantity),
      isClosed: false,
    };

    const url = `/api/update-closed-trades/`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTrade),
      });

      if (!response.ok) {
        throw new Error("Failed to update the closed trade.");
      }
      mutate("/api/get-trades");
    } catch (error) {
      console.error("Error updating closed trade:", error);
    }

    setEditingTradeId(null);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setEditingTradeId(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  const aggregatedTrades = tradeTableFormatter(data.result.rows);
  console.log("trades in wheel: ", aggregatedTrades);

  return (
    <div className="flex justify-center space-x-10">
      {/* Credits Table */}
      <div className="w-1/2">
        <h2 className="text-slate-200 mb-1">Credits</h2>
        <table className="table table-xs w-full text-xs">
          <thead>
            <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
              <th>Ticker</th>
              <th>Action</th>
              <th># of Options</th>
              <th>Credit</th>
              <th>Total</th>
              <th>Status</th>
              <th>Expiration Date</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 text-center">
            {Object.entries(aggregatedTrades).map(
              ([tradeId, { openTrades }]) => {
                if (
                  openTrades.length > 0 &&
                  openTrades[0].isclosed !== true &&
                  openTrades[0].strategy === "WHEEL"
                ) {
                  return (
                    <tr
                      key={tradeId}
                      className="hover:bg-slate-700 hover:text-slate-200 text-center"
                      onClick={() => handleRowClick(openTrades[0])}
                    >
                      <td>{openTrades[0].ticker}</td>
                      <td>{getActionAbbreviation(openTrades[0].actions)}</td>
                      <td>{Number(openTrades[0].openquantity)}</td>
                      <td>{Number(openTrades[0].optionprice).toFixed(2)}</td>
                      <td>
                        $
                        {+openTrades[0].openquantity *
                          +openTrades[0].optionprice *
                          100}
                      </td>
                      <td>{openTrades[0].closingprice ? "Closed" : "Open"}</td>
                      <td>{formatDate(openTrades[0].expirationdate)}</td>
                    </tr>
                  );
                }
                return null; // Skip rendering if there are no open trades
              }
            )}
          </tbody>
        </table>
      </div>

      {/* Debits Table */}
      <div className="w-1/2">
        <h2 className="text-slate-200 mb-1">Debits</h2>
        <table className="table table-xs w-full text-xs">
          <thead>
            <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
              <th>Ticker</th>
              <th>Action</th>
              <th># of Options</th>
              <th>Debit</th>
              <th>P/L</th>
              <th>Date Closed</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 text-center">
            {Object.entries(aggregatedTrades).map(
              ([tradeId, { openTrades, closedTrades }]) => {
                // Display only the first closed trade per tradeId
                if (!closedTrades[closedTrades.length - 1]) return null;

                if (openTrades[0].strategy === "WHEEL") {
                  return (
                    <tr
                      key={`${tradeId}-0`}
                      className="hover:bg-slate-700 hover:text-slate-200 text-center"
                      onClick={() => handleRowClick(closedTrades[0])}
                    >
                      <td>{openTrades[0].ticker}</td>
                      <td>{getActionAbbreviation(openTrades[0].actions)}</td>
                      <td>
                        {aggregatedTrades[Number(tradeId)].totalClosingQuantity}
                      </td>
                      <td>
                        {aggregatedTrades[
                          Number(tradeId)
                        ].averageClosingPrice?.toFixed(2)}
                      </td>
                      <td>
                        {closedTrades[0]?.closingprice
                          ? (
                              ((aggregatedTrades[Number(tradeId)]
                                .averageClosingPrice -
                                +openTrades[0]?.optionprice) /
                                +openTrades[0]?.optionprice) *
                              100
                            ).toFixed(2) + "%"
                          : "N/A"}
                      </td>
                      <td>
                        {closedTrades[0].completiondate
                          ? formatDate(closedTrades[0].completiondate)
                          : "N/A"}
                      </td>
                    </tr>
                  );
                }
                return null; // Skip rendering if there are no open trades
              }
            )}
            {/* {trades.map((trade) => {
              if (trade.strategy === "WHEEL" && trade.closingprice) {
                return (
                  <tr
                    key={trade.tradeid}
                    className="hover:bg-slate-700 hover:text-slate-200 text-center"
                    onClick={() => handleRowClick(trade)}
                  >
                    <td>{trade.ticker}</td>
                    <td>{getActionAbbreviation(trade.actions)}</td>
                    <td>{trade.strike}</td>
                    <td>{trade.closingprice}</td>
                    <td>
                      {(
                        ((+trade.closingprice - +trade.optionprice) /
                          +trade.optionprice) *
                        100
                      ).toFixed(2) + "%"}
                    </td>
                    <td>
                      {trade.completiondate
                        ? formatDate(trade.completiondate)
                        : "N/A"}
                    </td>
                  </tr>
                );
              }
            })} */}
          </tbody>
        </table>
      </div>
      <TradeEditModal
        editedTrade={editedTrade}
        handleInputChange={handleInputChange}
        handleSaveOpenTrades={handleSaveOpenTrades}
        handleSaveClosedTrades={handleSaveClosedTrades}
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
      />
    </div>
  );
};

export default TheWheelChart;
