"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Background from "@/public/Background_1.png";
import Link from "next/link";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useRouter } from "next/navigation";

interface TileDisableProps {
  date: Date;
  view: string;
}

const NewTrade = () => {
  const [ticker, setTicker] = useState("");
  const [strike, setStrike] = useState("");
  const [openquantity, setTotalQuantity] = useState("");
  const [optionprice, setOptionPrice] = useState("");
  const [expiration, setExpiration] = useState("");
  const [strategy, setStrategy] = useState("");
  const [actions, setAction] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/new-trade", {
        method: "POST",

        body: JSON.stringify({
          ticker,
          actions,
          strategy,
          strike,
          openquantity,
          optionprice,
          expiration,
        }),
      });
      if (response.ok) {
        console.log("Trade submitted successfully!");
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
  const handleTotalQualityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalQuantity(e.target.value);
  };

  const handleOptionPrice = (e: ChangeEvent<HTMLInputElement>) => {
    setOptionPrice(e.target.value);
  };

  const handleExpirationChange = (date: Date) => {
    setExpiration(date.toISOString());
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
    <main className="flex min-h-screen min-w-screen flex-col items-center">
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage: `url(${Background.src})`,
        }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text text-slate-200">Stock Ticker</span>
            </div>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              value={ticker}
              onChange={handleTickerChange}
            />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text text-slate-200">Strike</span>
            </div>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              value={strike}
              onChange={handleStrikeChange}
            />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text text-slate-200">Quantity</span>
            </div>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              value={openquantity}
              onChange={handleTotalQualityChange}
            />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text text-slate-200">Option Price</span>
            </div>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              value={optionprice}
              onChange={handleOptionPrice}
            />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text text-slate-200">Expiration Date</span>
            </div>
            <div className="w-full h-full">
              <Calendar
                onClickDay={handleExpirationChange}
                value={expiration}
                tileDisabled={disableDates}
                className="rounded-lg"
              />
            </div>
            {/* <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              value={expiration}
              onChange={handleExpirationChange}
            /> */}
          </label>
          <label>
            <div className="label">
              <span className="label-text text-slate-200">Action</span>
            </div>
            <select
              className="select select-bordered w-full max-w-xs"
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

          <label>
            <div className="label">
              <span className="label-text text-slate-200">Strategy</span>
            </div>
            <select
              className="select select-bordered w-full max-w-xs"
              value={strategy}
              onChange={handleStrategyChange}
            >
              <option disabled value="">
                Please select...
              </option>
              <option>WHEEL</option>
            </select>
          </label>

          <div className="flex justify-center">
            <form onSubmit={handleSubmit} className="p-1">
              <button
                type="submit"
                className="btn bg-slate-800 text-slate-200 mt-2"
              >
                Submit
              </button>
            </form>
            <Link className="p-1" href="/tracker">
              <button className="btn bg-slate-800 text-slate-200 mt-2">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NewTrade;
