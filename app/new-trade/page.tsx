"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Background from "@/public/Background_1.png";
import Link from "next/link";

const NewTrade = () => {
  const [ticker, setTicker] = useState("");
  const [strike, setStrike] = useState("");
  const [expiration, setExpiration] = useState("");
  const [strategy, setStrategy] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log("try block:  ", ticker, strike, expiration, strategy);
      const response = await fetch("/api/new-trade", {
        method: "POST",

        body: JSON.stringify({ ticker, strike, expiration, strategy }),
      });
      if (response.ok) {
        console.log("Trade submitted successfully!");
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

  const handleExpirationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExpiration(e.target.value);
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStrategy(e.target.value);
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
              <span className="label-text text-slate-200">Expiration Date</span>
            </div>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              value={expiration}
              onChange={handleExpirationChange}
            />
          </label>
          <label>
            <div className="label">
              <span className="label-text text-slate-200">Strategy</span>
            </div>
            <select
              className="select select-bordered w-full max-w-xs"
              value={strategy}
              onChange={handleSelectChange}
            >
              <option disabled value="">
                Please select...
              </option>
              <option>Call</option>
              <option>Put</option>
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
