import React from "react";
import Background from "@/public/Background_1.png";
import GeneralSummary from "./GeneralSummary";
import WheelGuide from "./WheelGuide";

const TheWheel = () => {
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
            <div className="text-3xl font-bold col-span-2">
              The Wheel Strategy
            </div>
            <div className="text-left col-span-1 space-y-1">
              <GeneralSummary />
            </div>
            <div className="text-left col-span-1 space-y-1">
              <WheelGuide />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TheWheel;
