"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, Trade } from "./utils/fetcher";
import { getActionAbbreviation } from "./utils/getActionAbbreviation";
import TradeEditModal from "./utils/TradeEditModal";

interface AggregatedTrades {
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
}

const Chart = () => {
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
      mutate("/api/get-trades");
    } catch (error) {
      console.error("Error updating trade:", error);
    }

    setEditingTradeId(null);
    setIsModalOpen(false);
  };

  const handleSaveClosedTrades = async () => {
    // Assuming you track closing quantity and maybe a closing price for closed trades
    // Adjust these properties as needed for your application's requirements
    const updatedTrade = {
      ...editedTrade,
      tradeid: editedTrade.tradeid,
      closingprice: null,
      completiondate: null,
      reopenquantity: Number(editedTrade.closedquantity),
      isClosed: false,
    };

    console.log(updatedTrade);
    const url = `/api/update-closed-trades/`; // Your endpoint for updating closed trades
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

  const formatTable = (trades: Trade[]): AggregatedTrades => {
    const aggregated: AggregatedTrades = {};
    trades.forEach((trade) => {
      if (!aggregated[trade.tradeid]) {
        aggregated[trade.tradeid] = {
          openTrades: [],
          closedTrades: [],
          averageClosingPrice: 0,
          totalClosingQuantity: 0,
        };
      }

      if (trade.openquantity !== null) {
        aggregated[trade.tradeid].openTrades.push({
          tradeid: trade.tradeid,
          ticker: trade.ticker,
          actions: trade.actions,
          strategy: trade.strategy,
          strike: trade.strike,
          openquantity: trade.openquantity,
          isclosed: trade.isclosed,
          optionprice: trade.optionprice,
          expirationdate: trade.expirationdate,
        });
      }

      if (trade.closedquantity > 0) {
        aggregated[trade.tradeid].closedTrades.push({
          tradeid: trade.tradeid,
          closedtradeid: trade.closedtradeid,
          closingprice: trade.closingprice,
          completiondate: trade.completiondate,
          closedquantity: trade.closedquantity,
        });
        aggregated[trade.tradeid].totalClosingQuantity += trade.closedquantity;
      }
    });

    Object.keys(aggregated).forEach((key) => {
      const tradeId = Number(key); // Convert key to number for TS
      const tradeGroup = aggregated[tradeId];
      if (tradeGroup.closedTrades.length > 0) {
        const totalClosingPrice = tradeGroup.closedTrades.reduce(
          (sum, trade) =>
            sum + Number(trade.closingprice) * trade.closedquantity,
          0
        );
        tradeGroup.averageClosingPrice =
          totalClosingPrice / (tradeGroup.totalClosingQuantity ?? 1);
      }
    });

    return aggregated;
  };

  const aggregatedTrades: AggregatedTrades = formatTable(data.result.rows);
  console.log("AggregatedTrades: ", aggregatedTrades);
  return (
    <>
      <div>
        {/* OPEN TRADES */}
        <table className="table table-xs table-pin-rows table-pin-cols text-xs">
          <thead>
            <tr className="bg-slate-400 text-slate-800 text-center">
              <td>Ticker</td>
              <td>Action</td>
              <td>Strategy</td>
              <td>Strike</td>
              <td>Entry Price</td>
              <td>Quantity</td>
              <td>Breakeven</td>
              <td>Expiration Date</td>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {Object.entries(aggregatedTrades).map(
              ([tradeId, { openTrades }]) => {
                if (openTrades.length > 0 && openTrades[0].isclosed !== true) {
                  return (
                    <tr
                      key={tradeId}
                      className="hover:bg-slate-700 hover:text-slate-200 text-center"
                      onClick={() => handleRowClick(openTrades[0])}
                    >
                      <td>{openTrades[0].ticker}</td>
                      <td>{getActionAbbreviation(openTrades[0].actions)}</td>
                      <td>{openTrades[0].strategy}</td>
                      <td>{Number(openTrades[0].strike).toFixed(2)}</td>
                      <td>{Number(openTrades[0].optionprice).toFixed(2)}</td>
                      <td>{openTrades[0].openquantity}</td>
                      <td>
                        {openTrades[0].actions === "COVERED CALL" ||
                        openTrades[0].actions === "CALL"
                          ? Number(
                              +openTrades[0].strike + +openTrades[0].optionprice
                            ).toFixed(2)
                          : Number(
                              +openTrades[0].strike - +openTrades[0].optionprice
                            ).toFixed(2)}
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

      <div>
        {/* CLOSED TRADES */}
        <table className="table table-xs table-pin-rows table-pin-cols text-xs">
          <thead>
            <tr className="text-slate-300 text-center">
              <th>Ticker</th>
              <th>Action</th>
              <th>Strategy</th>
              <th>Strike</th>
              <th>Quantity</th>
              <th>Average Closing Price</th>
              <th>P/L</th>
              <th>Completion Date</th>
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
                    className="hover:bg-slate-700 hover:text-slate-200 text-center"
                    onClick={() => handleRowClick(closedTrades[0])}
                  >
                    <td>{openTrades[0].ticker}</td>
                    <td>{getActionAbbreviation(openTrades[0].actions)}</td>
                    <td>{openTrades[0].strategy}</td>
                    <td>{Number(openTrades[0].strike).toFixed(2)}</td>
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
                            ((+closedTrades[0]?.closingprice -
                              +openTrades[0]?.optionprice) /
                              +openTrades[0]?.optionprice) *
                            100
                          ).toFixed(2) + "%"
                        : "N/A"}
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
      {/* Modal for editing trade */}
      <TradeEditModal
        editedTrade={editedTrade}
        handleInputChange={handleInputChange}
        handleSaveOpenTrades={handleSaveOpenTrades}
        handleSaveClosedTrades={handleSaveClosedTrades}
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
      />
    </>
  );
};

export default Chart;
