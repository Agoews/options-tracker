import React from "react";
import Background from "@/public/Background_1.png";

const StockHoldings = () => {
  return (
    <main className="flex min-h-screen min-w-screen items-center">
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage: `url(${Background.src})`,
        }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="text-center text-slate-800"></div>
      </div>
    </main>
  );
};

export default StockHoldings;
