"use client";
import { fetcher } from "@/components/utils/fetcher";
import React, { FormEvent, SyntheticEvent, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import CurrentHoldingsModal from "./CurrentHoldingsModal";
import SellSharesModal from "./SellSharesModal";
import AddHoldingModal from "./AddHoldingModal";
import { useSession } from "next-auth/react";

interface HoldingData {
  currentstockholdingsid: number;
  ticker: string;
  quantity: number;
  entryprice: number;
  costbasis: number;
  optionsprofit: number;
  openoptions: string;
  datepurchased: string;
}
interface OpenHoldingsProps {
  userEmail: string;
}
const OpenHoldings: React.FC<OpenHoldingsProps> = ({ userEmail }) => {
  const { data, error, isLoading } = useSWR(
    `/api/get-current-holdings?email=${userEmail}`,
    fetcher
  );

  const initialCallState = {};

  const [currentHoldingsModalToggle, setCurrentHoldingsModalToggle] =
    useState(false);
  const [sellSharesModalToggle, setSellSharesModalToggle] = useState(false);
  const [addPositionToggle, setAddPositionToggle] = useState(false);
  const [holdingId, setHoldingId] = useState<number | null>(null);
  const [holdingData, setHoldingData] = useState<HoldingData | null>(null);
  const [coveredCallStrike, setCoveredCallStrike] = useState<string | null>(
    null
  );
  const [coveredCallPremium, setCoveredCallPremium] = useState<string | null>(
    null
  );
  const [coveredCallQuantity, setCoveredCallQuantity] = useState<string | null>(
    null
  );
  const [coveredCallExpiration, setCoveredCallExpiration] = useState<
    string | null
  >(null);
  const [exitPrice, setExitPrice] = useState<string | null>(null);
  const [closedQuantity, setClosedQuantity] = useState<string | null>(null);
  const [ticker, setTicker] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string | null>(null);
  const [entryPrice, setEntryPrice] = useState<string | null>(null);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  const holdingsArray = data.result.rows;

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    console.log(
      coveredCallStrike,
      coveredCallPremium,
      coveredCallQuantity,
      coveredCallExpiration
    );

    setCoveredCallStrike(null);
    setCoveredCallPremium(null);
    setCoveredCallQuantity(null);
    setCoveredCallExpiration(null);
    setCurrentHoldingsModalToggle(false);
    setCurrentHoldingsModalToggle(false);
  };

  const handleOpenAddPositionModal = () => {
    console.log("Add position clicked");
    setAddPositionToggle(true);
  };

  const handleOpenSellSharesModal = () => {
    console.log("sell shares clicked");
    setSellSharesModalToggle(true);
    setCurrentHoldingsModalToggle(false);
    if (holdingData?.ticker) {
      setTicker(holdingData?.ticker);
    }
  };

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  const handleCurrentHoldingClick = (data: any) => {
    setHoldingId(data.currentstockholdingsid);
    setHoldingData({ ...data });
    setCurrentHoldingsModalToggle(true);
  };

  const handleSellShares = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/sell-current-holdings", {
        method: "POST",
        body: JSON.stringify({
          userEmail,
          ticker,
          closedQuantity,
          exitPrice,
          holdingId,
        }),
      });
    } catch (error) {
      console.log(error);
    }
    setSellSharesModalToggle(false);
    mutate(`/api/get-current-holdings?email=${userEmail}`);
  };

  const handleAddHolding = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/add-current-holding", {
        method: "POST",
        body: JSON.stringify({
          userEmail,
          ticker,
          quantity,
          entryPrice,
        }),
      });

      if (!response.ok) {
        throw Error("Failed to save new stock holding");
      }
      mutate(`/api/get-current-holdings?email=${userEmail}`);
    } catch (error) {
      console.log(error);
    }

    setAddPositionToggle(false);
  };

  const handleCancel = () => {
    setHoldingId(null);
    setCurrentHoldingsModalToggle(false);
    setSellSharesModalToggle(false);
    setAddPositionToggle(false);
  };

  const handleDelete = async () => {
    if (!holdingId) {
      console.log("No holding selected.");
      return;
    }

    const url = "/api/delete-current-holding";
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(holdingId),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete holding with ID: ${holdingId}`);
      }
      mutate(`/api/get-current-holdings?email=${userEmail}`);
      console.log(`Deleted holding with ID: ${holdingId}`);
    } catch (error) {
      console.log("Error deleting position:", error);
    }

    setCurrentHoldingsModalToggle(false);
    setHoldingId(null);
  };

  return (
    <div className="">
      <h2 className="text-[#00ee00] text-2xl mb-1">Current Stock Positions</h2>
      <table className="table table-xs w-full text-xs rounded border-2 border-[#00ee00]">
        <thead>
          <tr className="text-slate-200 text-center">
            <th>Ticker</th>
            <th>Quantity</th>
            <th>Entry Price</th>
            <th>Total Value</th>
            <th>Cost Basis</th>
            <th>Options Profit</th>
            <th>Open Options</th>
            <th>Date Purchased</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          {holdingsArray.map((obj: any) => (
            <tr
              key={obj.currentstockholdingsid}
              className="hover:bg-slate-700 hover:text-slate-200 hover: cursor-pointer text-center"
              onClick={() => handleCurrentHoldingClick(obj)}
            >
              <td>{obj.ticker}</td>
              <td>{obj.quantity}</td>
              <td>{"$" + Number(obj.entryprice).toFixed(2)}</td>
              <td>{"$" + Number(obj.quantity * obj.entryprice).toFixed(2)}</td>
              <td>{"$" + Number(obj.costbasis).toFixed(2)}</td>
              <td>{"$" + (obj.optionsprofit * 100).toFixed(2)}</td>
              <td>{obj.openoptions}</td>
              <td>{formatDate(obj.datepurchased)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-center text-[#00ee00] space-x-4">
        <button
          className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2"
          onClick={handleOpenAddPositionModal}
        >
          Add Position
        </button>
        <button
          className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2"
          // onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
      <AddHoldingModal
        addPositionToggle={addPositionToggle}
        setTicker={setTicker}
        setQuantity={setQuantity}
        setEntryPrice={setEntryPrice}
        handleAddHolding={handleAddHolding}
        handleCancel={handleCancel}
      />
      <CurrentHoldingsModal
        currentHoldingsModalToggle={currentHoldingsModalToggle}
        holdingData={holdingData}
        setCoveredCallStrike={setCoveredCallStrike}
        setCoveredCallPremium={setCoveredCallPremium}
        setCoveredCallQuantity={setCoveredCallQuantity}
        setCoveredCallExpiration={setCoveredCallExpiration}
        handleSubmit={handleSubmit}
        handleOpenSellSharesModal={handleOpenSellSharesModal}
        handleDelete={handleDelete}
        handleCancel={handleCancel}
      />
      <SellSharesModal
        holdingData={holdingData}
        sellSharesModalToggle={sellSharesModalToggle}
        closedQuantity={closedQuantity}
        exitPrice={exitPrice}
        setClosedQuantity={setClosedQuantity}
        setExitPrice={setExitPrice}
        handleSellShares={handleSellShares}
        handleCancel={handleCancel}
      />
    </div>
  );
};

export default OpenHoldings;

// make the assignments work for covered calls as well as CSP
// modal for current holdings
// sell calls on current holdings
// sell holdings
