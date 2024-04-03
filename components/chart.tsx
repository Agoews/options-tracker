"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, Trade } from "./utils/fetcher";
import { getActionAbbreviation } from "./utils/getActionAbbreviation";
import OpenTradeEditModal from "./utils/OpenTradeEditModal";
import { tradeTableFormatter } from "./utils/tradeTableFormatter";

interface ChartProps {
  userEmail: string;
}

const Chart: React.FC<ChartProps> = ({ userEmail }) => {
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLElement>,
    field: keyof Trade
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    let value: string | number | null = target.value;

    if (
      field === "closingprice" ||
      field === "optionprice" ||
      field === "closedquantity" ||
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
      mutate(`/api/get-trades?email=${userEmail}`);
    } catch (error) {
      console.error("Error updating trade:", error);
    }

    setEditingTradeId(null);
    setOpenTradeModalToggle(false);
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
      mutate(`/api/get-trades?email=${userEmail}`);
    } catch (error) {
      console.error("Error updating closed trade:", error);
    }

    setEditingTradeId(null);
    setOpenTradeModalToggle(false);
  };

  const handleCancel = () => {
    setEditingTradeId(null);
    setOpenTradeModalToggle(false);
  };

  const handleDelete = async () => {
    const updatedTrade = {
      ...editedTrade,
      tradeid: editedTrade.tradeid,
    };

    const url = "/api/delete-trade";
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Conetent-Type": "application/json",
        },
        body: JSON.stringify(updatedTrade),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${editedTrade.ticker}`);
      }
      mutate(`/api/get-trades?email=${userEmail}`);
    } catch (error) {
      console.log("Error updating closed trade:", error);
    }

    setEditingTradeId(null);
    setOpenTradeModalToggle(false);
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

  return (
    <>
      <div className="flex flex-colw-full overflow-x-auto space-y-4  xl:flex-row xl:space-x-4 xl:space-y-0">
        <div className="flex flex-col w-full xl:w-1/2 p-4 ounded border-4 border-[#00ee00]">
          {/* OPEN TRADES */}
          <div className="text-3xl text-[#00ee00] text-left font-bold my-2">
            Open Positions
          </div>
          <div className="overflow-auto max-w-[800px] max-h-[200px]">
            <table className="table table-xs table-pin-rows text-xs">
              <thead>
                <tr className="text-slate-200 text-center">
                  <td>Ticker</td>
                  <td>Action</td>
                  <td>Strategy</td>
                  <td>Strike</td>
                  <td>Positions</td>
                  <td>Entry Price</td>
                  <td>Breakeven</td>
                  <td>DTE</td>
                  <td>Expiration Date</td>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {Object.entries(aggregatedTrades).map(
                  ([tradeId, { openTrades }]) => {
                    if (
                      openTrades.length > 0 &&
                      openTrades[0].isclosed !== true
                    ) {
                      return (
                        <tr
                          key={tradeId}
                          className="hover:bg-slate-700 hover:text-slate-200 hover:cursor-pointer text-center"
                          onClick={() => handleRowClick(openTrades[0])}
                        >
                          <td>{openTrades[0].ticker}</td>
                          <td>
                            {getActionAbbreviation(openTrades[0].actions)}
                          </td>
                          <td>{openTrades[0].strategy}</td>
                          <td>${Number(openTrades[0].strike).toFixed(2)}</td>
                          <td>{openTrades[0].openquantity}</td>
                          <td>
                            {Number(openTrades[0].optionprice).toFixed(2)}
                          </td>
                          <td>
                            $
                            {openTrades[0].actions === "COVERED CALL" ||
                            openTrades[0].actions === "CALL"
                              ? Number(
                                  +openTrades[0].strike +
                                    +openTrades[0].optionprice
                                ).toFixed(2)
                              : Number(
                                  +openTrades[0].strike -
                                    +openTrades[0].optionprice
                                ).toFixed(2)}
                          </td>
                          <td>
                            {calculateDTE(
                              formatDate(openTrades[0].expirationdate)
                            )}
                          </td>
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
        </div>

        <div className="flex flex-col w-full xl:w-1/2 p-4 ounded border-4 border-[#00ee00]">
          {/* CLOSED TRADES */}
          <div className="text-3xl text-[#00ee00] text-left font-bold my-2">
            Closed Positions
          </div>
          <div className="overflow-auto max-w-[800px] max-h-[200px]">
            <table className="table table-xs table-pin-rows text-xs">
              <thead>
                <tr className="text-slate-300 text-center">
                  <th>Ticker</th>
                  <th>Action</th>
                  <th>Strategy</th>
                  <th>Strike</th>
                  <th>Contracts</th>
                  <th>Avg Closing</th>
                  <th>Total</th>
                  <th>P/L</th>
                  <th>Closed Date</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {Object.entries(aggregatedTrades).map(
                  ([tradeId, { openTrades, closedTrades }]) => {
                    // Display only the first closed trade per tradeId
                    const trade = closedTrades[closedTrades.length - 1];
                    if (!trade) return null;

                    return (
                      <tr
                        key={`${tradeId}-0`}
                        className="hover:bg-slate-700 hover:text-slate-200 hover:cursor-pointer text-center"
                        onClick={() => handleRowClick(closedTrades[0])}
                      >
                        <td>{openTrades[0].ticker}</td>
                        <td>{getActionAbbreviation(openTrades[0].actions)}</td>
                        <td>{openTrades[0].strategy}</td>
                        <td>${Number(openTrades[0].strike).toFixed(2)}</td>
                        <td>
                          {
                            aggregatedTrades[Number(tradeId)]
                              .totalClosingQuantity
                          }
                        </td>
                        <td>
                          {aggregatedTrades[
                            Number(tradeId)
                          ].averageClosingPrice?.toFixed(2)}
                        </td>
                        <td>
                          $
                          {(
                            Number(
                              aggregatedTrades[Number(tradeId)]
                                .averageClosingPrice
                            ) *
                            Number(
                              aggregatedTrades[Number(tradeId)]
                                .totalClosingQuantity
                            ) *
                            100
                          ).toFixed(2)}
                        </td>
                        <td>
                          {/* If the option is a Covered Call or CSP the calculation returns positive returns for lower closing prices */}
                          {(closedTrades[0]?.closingprice &&
                            openTrades[0].actions === "COVERED CALL") ||
                          openTrades[0].actions === "CASH SECURED PUT"
                            ? (
                                ((Number(openTrades[0]?.optionprice) -
                                  Number(
                                    aggregatedTrades[Number(tradeId)]
                                      .averageClosingPrice
                                  )) /
                                  Number(openTrades[0]?.optionprice)) *
                                100
                              ).toFixed(2) + "%"
                            : (
                                ((Number(
                                  aggregatedTrades[Number(tradeId)]
                                    .averageClosingPrice
                                ) -
                                  Number(openTrades[0]?.optionprice)) /
                                  Number(openTrades[0]?.optionprice)) *
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
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for editing trade */}
      <OpenTradeEditModal
        editedTrade={editedTrade}
        handleInputChange={handleInputChange}
        handleSaveOpenTrades={handleSaveOpenTrades}
        handleSaveClosedTrades={handleSaveClosedTrades}
        handleCancel={handleCancel}
        handleDelete={handleDelete}
        openTradeModalToggle={openTradeModalToggle}
      />
    </>
  );
};

export default Chart;
