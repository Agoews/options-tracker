import Image from "next/image";
import Link from "next/link";
import React from "react";
import WheelGuidePicture from "@/public/WheelGidePicture.png";

// import WheelGuidePicture from "@/public/WheelGuidePicture.png";

const WheelGuide = () => {
  return (
    <div className="collapse collapse-plus bg-[#002f00] bg-opacity-70 border-2 border-[#00ee00]">
      <input type="checkbox" />
      <div className="collapse-title text-lg font-bold text-[#00ee00]">
        Steps:
      </div>
      <div className="collapse-content text-sm space-y-2 text-slate-200">
        <ol className="list-disc list-inside">
          <li>
            <strong>Sell Put Options:</strong> Choose a stock, sell put options
            at or below the current market price, and collect the premium.
          </li>
          <li>
            <strong>If Put Options Are Exercised (Stock Assigned):</strong>
            Acquire stock at the strike price and benefit from owning it.
          </li>
          <li>
            <strong>Sell Call Options:</strong> Sell call options on the owned
            stock to generate additional premium income or sell the stock at a
            profit.
          </li>
        </ol>
        <div className="flex items-center justify-center">
          <Image
            src={WheelGuidePicture}
            width={400}
            height={400}
            alt="Wheel Guide Image"
          />
        </div>
        <div className="text-right text-[#00ee00]">
          <Link
            className="link"
            href="https://optionalpha.com/blog/wheel-strategy"
          >
            Learn more about the wheel strategy.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WheelGuide;
