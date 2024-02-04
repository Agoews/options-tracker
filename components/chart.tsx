"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, Trade } from "./utils/fetcher";
import { getActionAbbreviation } from "./utils/getActionAbbreviation";
import TradeEditModal from "./utils/TradeEditModal";

interface AggregatedTrades {
  [key: number]: {
    openTrades: Trade[];
    closedTrades: Trade[];
    averageClosingPrice?: number;
  };
}

const Chart = () => {
  const initialTradeState: Trade = {
    tradeid: 0,
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
    sumClosingPrices: 0,
    countClosingPrices: 0,
    averageClosingPrice: 0,
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

  const handleSave = async () => {
    const url = `/api/update-trades/`;
    console.log(editedTrade);
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedTrade),
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

  const handleCancel = () => {
    setEditingTradeId(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  //Continue working here. Trying to resolve trades and closed trades
  const formatTable = (trades: Trade[]): AggregatedTrades => {
    const aggregated: AggregatedTrades = {};
    console.log(trades);
    trades.forEach((trade) => {
      if (!aggregated[trade.tradeid]) {
        aggregated[trade.tradeid] = {
          openTrades: [],
          closedTrades: [],
          averageClosingPrice: undefined,
        };
      }

      if (trade.openquantity !== null) {
        aggregated[trade.tradeid].openTrades.push(trade);
      }
      if (trade.closedquantity > 0) {
        aggregated[trade.tradeid].closedTrades.push(trade);
      }
    });

    Object.keys(aggregated).forEach((key) => {
      const tradeId = Number(key); // Convert key to number for TS
      const tradeGroup = aggregated[tradeId];
      if (tradeGroup.closedTrades.length > 0) {
        const totalClosingPrice = tradeGroup.closedTrades.reduce(
          (sum, trade) => sum + Number(trade.closingprice),
          0
        );
        tradeGroup.averageClosingPrice =
          totalClosingPrice / tradeGroup.closedTrades.length;
      }
    });

    return aggregated;
  };

  const aggregatedTrades: AggregatedTrades = formatTable(data.result.rows);
  console.log("aggregatedTrades: ", aggregatedTrades);

  return (
    <>
      <div>
        <table className="table table-xs table-pin-rows table-pin-cols text-xs">
          <thead>
            <tr className="bg-slate-400 text-slate-800 text-center">
              <td>Ticker</td>
              <td>Action</td>
              <td>Strategy</td>
              <td>Strike</td>
              <td>Option Price</td>
              <td>Quantity</td>
              <td>Breakeven</td>
              {/* <td>Average Closing Price</td>
            <td>P/L</td> */}
              <td>Status</td>
              <td>Expiration Date</td>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {Object.entries(aggregatedTrades).map(
              ([tradeId, { openTrades }]) => {
                if (openTrades.length > 0) {
                  return (
                    <tr
                      key={tradeId}
                      className="hover:bg-slate-700 hover:text-slate-200 text-center"
                    >
                      <td>{openTrades[0].ticker}</td>
                      <td>{openTrades[0].actions}</td>
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
                      {/* <td>{closedTrades[0]?.closingprice}</td>
                  <td>
                    {closedTrades[0]?.closingprice
                      ? (
                          ((+closedTrades[0]?.closingprice -
                            +openTrades[0]?.optionprice) /
                            +openTrades[0]?.optionprice) *
                          100
                        ).toFixed(2) + "%"
                      : "N/A"}
                  </td> */}
                      <td>Open</td>
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
        <table className="table table-xs table-pin-rows table-pin-cols text-xs">
          <thead>
            <tr className="bg-slate-400 text-slate-800 text-center">
              <th>Ticker</th>
              <th>Action</th>
              <th>Strategy</th>
              <th>Strike</th>
              <th>Closing Price</th>
              <th>Quantity</th>
              <th>Average Closing Price</th>
              <th>P/L</th>
              <th>Status</th>
              <th>Completion Date</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {Object.entries(aggregatedTrades).map(
              ([tradeId, { closedTrades }]) => {
                return closedTrades.map((trade, index) => (
                  <tr
                    key={`${tradeId}-${index}`} // Unique key for each row
                    className="hover:bg-slate-700 hover:text-slate-200 text-center"
                  >
                    <td>{trade.ticker}</td>
                    <td>{trade.actions}</td>
                    <td>{trade.strategy}</td>
                    <td>{Number(trade.strike).toFixed(2)}</td>
                    <td>{Number(trade.closingprice).toFixed(2)}</td>
                    <td>{trade.closedquantity}</td>
                    {/* Assuming calculation or retrieval of average closing price & P/L */}
                    <td>N/A</td> {/* Placeholder for average closing price */}
                    <td>N/A</td> {/* Placeholder for P/L calculation */}
                    <td>Closed</td>
                    <td>
                      {trade.completiondate
                        ? formatDate(trade.completiondate)
                        : "N/A"}
                    </td>
                  </tr>
                ));
              }
            )}
          </tbody>
        </table>
      </div>
      {/* Modal for editing trade */}
      <TradeEditModal
        editedTrade={editedTrade}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
      />
    </>
  );
};

export default Chart;
