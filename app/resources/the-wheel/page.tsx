import React from "react";
import GeneralSummary from "./GeneralSummary";
import WheelGuide from "./WheelGuide";

const TheWheel = () => {
  return (
    <>
      <main className="flex min-h-screen min-w-screen flex-col items-center">
        <div className="hero min-h-screen">
          <div className="grid grid-cols-2 text-[#00ee00] max-w-6xl space-y-1">
            <div className="text-3xl font-bold col-span-2">
              The Wheel Strategy
            </div>
            <div className="text-left col-span-1 mr-4">
              <GeneralSummary />
            </div>
            <div className="text-left col-span-1">
              <WheelGuide />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TheWheel;
