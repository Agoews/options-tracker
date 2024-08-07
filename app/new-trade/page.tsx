"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Background from "@/public/Background_1.png";
import Link from "next/link";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface TileDisableProps {
  date: Date;
  view: string;
}

const NewTrade = () => {
  const [ticker, setTicker] = useState("");
  const [strike, setStrike] = useState("");
  const [currentprice, setCurrentPrice] = useState("");
  const [openquantity, setTotalQuantity] = useState("");
  const [optionprice, setOptionPrice] = useState("");
  const [expiration, setExpiration] = useState("");
  const [strategy, setStrategy] = useState("");
  const [actions, setAction] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session) {
      console.error("No session found, please login first.");
      return;
    }

    const userEmail = session.user?.email;
    try {
      const response = await fetch("/api/new-trade", {
        method: "POST",

        body: JSON.stringify({
          userEmail,
          ticker,
          strike,
          currentprice,
          openquantity,
          optionprice,
          expiration,
          strategy,
          actions,
        }),
      });
      if (response.ok) {
        router.push("/tracker");
      } else {
        console.error("Failed to submit trade");
      }
    } catch (error) {
      console.error("Error submitting trade:", error);
    }
  };

  const handleTickerChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTicker(e.target.value);
  };

  const handleStrikeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStrike(e.target.value);
  };

  const handleCurrentPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentPrice(e.target.value);
  };

  const handleTotalQualityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalQuantity(e.target.value);
  };

  const handleOptionPrice = (e: ChangeEvent<HTMLInputElement>) => {
    setOptionPrice(e.target.value);
  };

  const handleExpirationChange = (date: Date) => {
    const day = new Date(date);
    day.setDate(date.getDate());
    setSelectedDate(day); // highlighted date
    setExpiration(date.toISOString().split("T")[0]); //takes YYYY-MM-DD
  };

  const handleActionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setAction(e.target.value);
  };

  const handleStrategyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStrategy(e.target.value);
  };

  const disableDates = ({ date, view }: TileDisableProps) => {
    if (view === "month") {
      // Disable past dates
      if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
        return true;
      }
      // Disable weekends (Saturday and Sunday)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return true;
      }
    }
    return false;
  };

  return (
    <main className="flex min-h-screen min-w-screen items-center">
      <div className="hero min-h-screen">
        <div className="flex justify-center w-full p-4">
          <div className="grid grid-cols-1 max-w-[320px] md:grid-cols-2 md:max-w-2xl gap-4 w-full">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#00ee00]">Stock Ticker</span>
              </div>
              <input
                type="text"
                placeholder="Stock Abbreviation"
                className="input input-bordered w-full text-slate-200"
                value={ticker}
                onChange={handleTickerChange}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#00ee00]">Strike</span>
              </div>
              <input
                type="text"
                placeholder="Strike Price"
                className="input input-bordered w-full text-slate-200"
                value={strike}
                onChange={handleStrikeChange}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#00ee00]">Entry Price</span>
              </div>
              <input
                type="text"
                placeholder="Current Stock Price"
                className="input input-bordered w-full text-slate-200"
                value={currentprice}
                onChange={handleCurrentPriceChange}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#00ee00]">Quantity</span>
              </div>
              <input
                type="text"
                placeholder="# of Options"
                className="input input-bordered w-full text-slate-200"
                value={openquantity}
                onChange={handleTotalQualityChange}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#00ee00]">Option Price</span>
              </div>
              <input
                type="text"
                placeholder="Option Value"
                className="input input-bordered w-full text-slate-200"
                value={optionprice}
                onChange={handleOptionPrice}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#00ee00]">Action</span>
              </div>
              <select
                className="select select-bordered w-full text-slate-200"
                value={actions}
                onChange={handleActionChange}
              >
                <option disabled value="">
                  Please select...
                </option>
                <option>CALL</option>
                <option>PUT</option>
                <option>COVERED CALL</option>
                <option>CASH SECURED PUT</option>
              </select>
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#00ee00]">
                  Expiration Date
                </span>
              </div>
              <div className="w-full h-full">
                <Calendar
                  onClickDay={handleExpirationChange}
                  value={selectedDate}
                  tileDisabled={disableDates}
                  className="rounded-lg"
                />
              </div>
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#00ee00]">Strategy</span>
              </div>
              <select
                className="select select-bordered w-full text-slate-200"
                value={strategy}
                onChange={handleStrategyChange}
              >
                <option disabled value="">
                  Please select...
                </option>
                <option>WHEEL</option>
              </select>
              <div className="flex flex-col md:flex-row justify-center form-control space-y-2 md:space-y-0 md:space-x-2 mt-4">
                <form onSubmit={handleSubmit}>
                  <button
                    type="submit"
                    className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2"
                  >
                    Submit
                  </button>
                </form>
                <Link href="/tracker">
                  <button className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2">
                    Cancel
                  </button>
                </Link>
              </div>
            </label>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NewTrade;
