"use client";
import React, { useState, useEffect } from "react";
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
  const { data: tradesData, error: tradesError } = useSWR(
    `/api/get-trades?email=${userEmail}`,
    fetcher
  );

  // fetch funds data
  const { data: fundsData, error: fundsError } = useSWR(
    `/api/get-funds?email=${userEmail}`,
    fetcher
  );

  const [editingTradeId, setEditingTradeId] = useState<number | null>(null);
  const [editedTrade, setEditedTrade] = useState<Trade>(initialTradeState);
  const [openTradeModalToggle, setOpenTradeModalToggle] = useState(false);
  const [closedTradeModalToggle, setClosedTradeModalToggle] = useState(false);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [rolloutModalToggle, setRolloutModalToggle] = useState(false);
  const [assignmentModalToggle, setAssignmentModalToggle] = useState(false);

  const [startingFunds, setStartingFunds] = useState(0);
  const [editedStartingFunds, setEditedStartingFunds] = useState(0);
  const [startingFundsModalToggle, setStartingFundsModalToggle] =
    useState(false);

  useEffect(() => {
    if (fundsData) {
      setStartingFunds(
        Number(fundsData.result.rows[0].funds)
          ? Number(fundsData.result.rows[0].funds)
          : 0
      );
    }
  }, [fundsData]);

  if (tradesError || fundsError) return <div>Failed to load</div>;
  if (!tradesData || !fundsData) return <div>Loading...</div>;

  const handleUpdateFundsModal = () => {
    setStartingFundsModalToggle(!startingFundsModalToggle);
  };

  const handleSaveUpdateFunds = async () => {
    const updatedStartingFunds = Number(startingFunds) + editedStartingFunds;
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

  const handleStartingFundsInputChange = (
    e: React.ChangeEvent<HTMLElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    let funds: number = Number(target.value);
    setEditedStartingFunds(funds);
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

    aggregatedTrades = tradeTableFormatter(tradesData.result.rows);
    setEditingTradeId(null);
    setClosedTradeModalToggle(false);
  };

  const handleAssignment = async () => {
    const url = `/api/assign-current-holdings/`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ editedTrade, userEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign the trade.");
      }
      mutate(`/api/get-trades?email=${userEmail}`);
    } catch (error) {
      console.error("Error assigning trade: ", error);
    }
    setAssignmentModalToggle(false);
    setOpenTradeModalToggle(false);
  };

  const handleOpenRolloutModal = () => {
    setRolloutModalToggle(true);
  };

  const handleRolloutModalCancel = () => {
    setRolloutModalToggle(false);
  };

  const handleOpenAssignmentRolloutModal = () => {
    setAssignmentModalToggle(true);
  };

  const handleCancel = () => {
    setEditingTradeId(null);
    setOpenTradeModalToggle(false);
    setClosedTradeModalToggle(false);
    setRolloutModalToggle(false);
    setStartingFundsModalToggle(false);
    setAssignmentModalToggle(false);
  };

  let aggregatedTrades = tradeTableFormatter(tradesData.result.rows);

  return (
    <div className="space-y-4 md:space-y-0">
      <div className="flex flex-col justify-center items-center space-y-4 md:flex-row md:space-x-2 md:space-y-0">
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
          handleAssignment={handleAssignment}
          handleOpenAssignmentModal={handleOpenAssignmentRolloutModal}
          handleCancel={handleCancel}
          openTradeModalToggle={openTradeModalToggle}
          rolloutModalToggle={rolloutModalToggle}
          assignmentModalToggle={assignmentModalToggle}
        />

        <DebitModal
          closedTrades={closedTrades}
          handleReopenTrade={handleReopenTrade}
          handleCancel={handleCancel}
          closedTradeModalToggle={closedTradeModalToggle}
        />
      </div>
      <TotalsTable
        aggregatedTrades={aggregatedTrades}
        userEmail={userEmail}
        startingFunds={startingFunds}
        startingFundsModalToggle={startingFundsModalToggle}
        handleCancel={handleCancel}
        handleStartingFundsInputChange={handleStartingFundsInputChange}
        handleUpdateFundsModal={handleUpdateFundsModal}
        handleSaveUpdateFunds={handleSaveUpdateFunds}
      />
    </div>
  );
};

export default TheWheelChart;
