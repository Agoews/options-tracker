import React from "react";
import Background from "@/public/Background_1.png";
import LongCalls from "./LongCall";
import LongPut from "./LongPut";
import ShortCall from "./ShortCall";
import ShortPut from "./ShortPut";

export const CallsPuts = () => {
  return (
    <>
      <main className="flex min-h-screen min-w-screen flex-col items-center">
        <div
          className="hero min-h-screen"
          style={{
            backgroundImage: `url(${Background.src})`,
          }}
        >
          <div className="hero-overlay bg-opacity-60"></div>
          <div className="grid grid-cols-2 text-slate-200 space-x-4 mx-4 max-w-6xl">
            <div className="text-left col-span-1 space-y-1">
              <div className="text-3xl font-bold">Calls</div>
              <LongCalls />
              <ShortCall />
            </div>
            <div className="text-left col-span-1 space-y-1">
              <div className="text-3xl font-bold">Puts</div>
              <LongPut />
              <ShortPut />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CallsPuts;
