import React from "react";
import LongCalls from "./LongCall";
import LongPut from "./LongPut";
import ShortCall from "./ShortCall";
import ShortPut from "./ShortPut";

const CallsPuts = () => {
  return (
    <>
      <main className="flex min-h-screen min-w-screen flex-col items-center">
        <div className="hero min-h-screen">
          <div className="grid grid-cols-2 text-[#00ee00] space-x-4 mx-4 max-w-6xl">
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
