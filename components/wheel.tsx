"use client";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, Trade } from "./utils/fetcher";
import { tradeTableFormatter } from "./utils/tradeTableFormatter";
import CreditTable from "./wheelUtils/CreditTable";
import DebitTable from "./wheelUtils/DebitTable";
import CreditModal from "./wheelUtils/CreditModal";
import DebitModal from "./wheelUtils/DebitModal";
import TotalsTable from "./wheelUtils/TotalsTable";

interface WheelProps {
  userEmail: string;
}

const TheWheelChart: React.FC<WheelProps> = ({ userEmail }) => {
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
  const [closedTradeModalToggle, setClosedTradeModalToggle] = useState(false);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [rolloutModalToggle, setRolloutModalToggle] = useState(false);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

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

  const handleOpenTradeClick = (trade: Trade) => {
    setEditingTradeId(trade.tradeid);
    setEditedTrade({ ...trade });
    setOpenTradeModalToggle(true);
  };

  const handleClosedTradeClick = (tradeId: number) => {
    const allClosedTrades = Object.values(aggregatedTrades)
      .flatMap((aggregatedTrade) => aggregatedTrade.closedTrades)
      .filter((closedTrade) => closedTrade.tradeid === tradeId);
    setClosedTrades(allClosedTrades);
    setClosedTradeModalToggle(true);
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

  const handleReopenTrade = async (
    closedTradeId: number,
    tradeId: number,
    closedQuantity: number
  ) => {
    const updatedTrade = {
      tradeid: tradeId,
      closedtradeid: closedTradeId,
      closingprice: null,
      completiondate: null,
      reopenquantity: closedQuantity,
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
      console.error("Error updating closed trade: ", error);
    }

    aggregatedTrades = tradeTableFormatter(data.result.rows);
    setEditingTradeId(null);
    setClosedTradeModalToggle(false);
  };

  const handleOpenRolloutModal = () => {
    setRolloutModalToggle(true);
  };

  const handleRolloutModalCancel = () => {
    setRolloutModalToggle(false);
  };

  const handleCancel = () => {
    setEditingTradeId(null);
    setOpenTradeModalToggle(false);
    setClosedTradeModalToggle(false);
    setRolloutModalToggle(false);
  };

  let aggregatedTrades = tradeTableFormatter(data.result.rows);

  return (
    <>
      <div className="flex justify-center">
        <CreditTable
          aggregatedTrades={aggregatedTrades}
          handleOpenTradeClick={handleOpenTradeClick}
        />

        <DebitTable
          aggregatedTrades={aggregatedTrades}
          handleClosedTradeClick={(trade) =>
            handleClosedTradeClick(trade.tradeid)
          }
        />

        <CreditModal
          editedTrade={editedTrade}
          handleInputChange={handleInputChange}
          handleSaveOpenTrades={handleSaveOpenTrades}
          handleOpenRolloutModal={handleOpenRolloutModal}
          handleRolloutModalCancel={handleRolloutModalCancel}
          handleCancel={handleCancel}
          openTradeModalToggle={openTradeModalToggle}
          rolloutModalToggle={rolloutModalToggle}
        />

        <DebitModal
          closedTrades={closedTrades}
          handleReopenTrade={handleReopenTrade}
          handleCancel={handleCancel}
          closedTradeModalToggle={closedTradeModalToggle}
        />
      </div>
      <TotalsTable aggregatedTrades={aggregatedTrades} userEmail={userEmail} />
    </>
  );
};

export default TheWheelChart;
