"use client";
import { fetcher } from "@/components/utils/fetcher";
import React, { SyntheticEvent, useState } from "react";
import useSWR, { mutate } from "swr";
import CurrentHoldingsModal from "./CurrentHoldingsModal";
import SellSharesModal from "./SellSharesModal";
import AddHoldingModal from "./AddHoldingModal";

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
  const [coveredCallStockPrice, setCoveredCallStockPrice] = useState<
    string | null
  >(null);
  const [exitPrice, setExitPrice] = useState<string | null>(null);
  const [closedQuantity, setClosedQuantity] = useState<string | null>(null);
  const [ticker, setTicker] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string | null>(null);
  const [entryPrice, setEntryPrice] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [quantityTouched, setQuantityTouched] = useState<boolean>(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceTouched, setPriceTouched] = useState<boolean>(false);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  const holdingsArray = data.result.rows;

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const ticker = holdingData?.ticker;
    console.log(
      userEmail,
      ticker,
      coveredCallStockPrice,
      coveredCallStrike,
      coveredCallPremium,
      coveredCallQuantity,
      coveredCallExpiration
    );

    try {
      const response = await fetch("/api/write-call", {
        method: "POST",
        body: JSON.stringify({
          userEmail,
          ticker,
          coveredCallStockPrice,
          coveredCallStrike,
          coveredCallPremium,
          coveredCallQuantity,
          coveredCallExpiration,
        }),
      });
      if (response.ok) {
        setCurrentHoldingsModalToggle(false);
        setCurrentHoldingsModalToggle(false);
        mutate(`/api/get-current-holdings?email=${userEmail}`);
      } else {
        console.log("Error selling shares");
      }
    } catch (error) {
      console.log(error);
    }
    setCurrentHoldingsModalToggle(false);
    setCurrentHoldingsModalToggle(false);
    mutate(`/api/get-current-holdings?email=${userEmail}`);

    setCoveredCallStrike(null);
    setCoveredCallPremium(null);
    setCoveredCallQuantity(null);
    setCoveredCallExpiration(null);
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
    let valid = true;

    if (!closedQuantity) {
      setQuantityError("Please enter the quantity.");
      setQuantityTouched(true);
      valid = false;
    } else {
      setQuantityError("");
    }

    if (!exitPrice) {
      setPriceError("Please enter the price.");
      setPriceTouched(true);
      valid = false;
    } else {
      setPriceError("");
    }

    if (!valid) return;

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
      if (response.ok) {
        setSellSharesModalToggle(false);
        mutate(`/api/get-current-holdings?email=${userEmail}`);
      } else {
        console.log("Error selling shares");
      }
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
    } catch (error) {
      console.log("Error deleting position:", error);
    }

    setCurrentHoldingsModalToggle(false);
    setHoldingId(null);
  };

  return (
    <div className="overflow-y-auto overflow-x-auto w-[320px] md:w-full lg:w-3/4">
      <h2 className="text-[#00ee00] text-xl md:text-2xl mb-1">
        Current Stock Holdings
      </h2>
      <table className="table table-xs w-full text-xs rounded border-2 border-[#00ee00]">
        <thead>
          <tr className="text-slate-200 text-center">
            <th className="md:hidden">Trade Details</th>
            <th className="hidden md:table-cell">Ticker</th>
            <th>#</th>
            <th className="hidden md:table-cell">Entry Price</th>
            <th>Total</th>
            <th className="hidden md:table-cell">Cost Basis</th>
            <th className="hidden md:table-cell">Options Profit</th>
            <th>Options</th>
            <th className="hidden md:table-cell">Date Purchased</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          {holdingsArray.map((obj: any) => (
            <tr
              key={obj.currentstockholdingsid}
              className="hover:bg-slate-700 hover:text-slate-200 hover: cursor-pointer text-center"
              onClick={() => handleCurrentHoldingClick(obj)}
            >
              <td className="md:hidden flex flex-col items-start space-y-1">
                <span>{obj.ticker}</span>
                <span>Entry: {"$" + Number(obj.entryprice).toFixed(2)}</span>
                <span>Basis: {"$" + Number(obj.costbasis).toFixed(2)}</span>
                <span>
                  Profit: {"$" + (obj.optionsprofit * 100).toFixed(2)}
                </span>
              </td>
              <td className="hidden md:table-cell">{obj.ticker}</td>
              <td>{obj.quantity}</td>
              <td className="hidden md:table-cell">
                {"$" + Number(obj.entryprice).toFixed(2)}
              </td>
              <td>{"$" + Number(obj.quantity * obj.entryprice).toFixed(2)}</td>
              <td className="hidden md:table-cell">
                {"$" + Number(obj.costbasis).toFixed(2)}
              </td>
              <td className="hidden md:table-cell">
                {"$" + (obj.optionsprofit * 100).toFixed(2)}
              </td>
              <td>{obj.openoptions}</td>
              <td className="hidden md:table-cell">
                {formatDate(obj.datepurchased)}
              </td>
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
        setCoveredCallStockPrice={setCoveredCallStockPrice}
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
        quantityError={quantityError}
        quantityTouched={quantityTouched}
        priceError={priceError}
        priceTouched={priceTouched}
      />
    </div>
  );
};

export default OpenHoldings;
