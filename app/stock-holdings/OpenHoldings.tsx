"use client";
import { fetcher } from "@/components/utils/fetcher";
import React, { FormEvent, SyntheticEvent, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import CurrentHoldingsModal from "./CurrentHoldingsModal";
import SellSharesModal from "./SellSharesModal";

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
  const [holdingId, setHoldingId] = useState<number | null>(null);
  const [holdingData, setHoldingData] = useState<null>(null);
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

  const handleOpenSellSharesModal = async () => {
    console.log("sell shares clicked");
    setSellSharesModalToggle(true);
    setCurrentHoldingsModalToggle(false);
  };

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  const handleCurrentHoldingClick = (data: any) => {
    // console.log("clicked", data);
    setHoldingId(data.currentholdingsid);
    setHoldingData({ ...data });
    setCurrentHoldingsModalToggle(true);
  };

  const handleSellShares = (closedQuantity: string, exitPrice: string) => {
    console.log("Quantity:", closedQuantity, "Price:", exitPrice);
    // additional logic here to process selling shares
    setSellSharesModalToggle(false);
  };

  const handleCancel = () => {
    setHoldingId(null);
    setCurrentHoldingsModalToggle(false);
    setSellSharesModalToggle(false);
  };

  const handleDelete = async () => {
    const currentstockholdingsid = holdingsArray[0].currentstockholdingsid;
    const url = "/api/delete-current-holding";

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Conetent-Type": "application/json",
        },
        body: JSON.stringify(currentstockholdingsid),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${holdingsArray[0].ticker}`);
      }
      mutate(`/api/get-current-holdings?email=${userEmail}`);
    } catch (error) {
      console.log("Error deleting position:", error);
    }
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
