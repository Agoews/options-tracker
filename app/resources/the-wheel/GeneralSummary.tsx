import Link from "next/link";
import React from "react";

const GeneralSummary = () => {
  return (
    <div className="collapse collapse-plus bg-slate-600 bg-opacity-70">
      <input type="checkbox" />
      <div className="collapse-title text-lg font-bold">Summary:</div>
      <div className="collapse-content text-sm space-y-2">
        <p>
          The wheel strategy is an income-generating approach involving selling
          put options, potentially owning stock, and selling covered calls.
          It&apos;s aimed at generating income before and possibly during stock
          ownership, without the primary goal of owning the stock.
        </p>
        <div className="text-lg font-medium">Strategy:</div>
        <p>
          This strategy consists of selling cash-secured put options and, if
          assigned stock, selling covered calls. It&apos;s an active approach to
          passive investing, suitable for investors transitioning from stock to
          options trading.
        </p>
        <div className="text-lg font-medium">How to Trade:</div>
        <p>
          Sell put options on stocks you wouldn&apos;t mind owning at a price
          you&apos;re comfortable with. If the put expires worthless, you keep
          the premium. If assigned, sell covered calls until the calls are
          assigned or you decide to sell the stock.
        </p>
        <div className="text-lg font-medium">Key Points:</div>
        <ol className="list-disc list-inside">
          <li>Start by selling a cash-secured put option.</li>
          <li>If assigned stock, sell a covered call.</li>
          <li>Repeat the process to continue generating income.</li>
        </ol>
        <div className="text-lg font-medium">Considerations:</div>
        <p>
          The wheel strategy requires careful selection of stocks and strike
          prices. It&apos;s ideal for stocks you&apos;re bullish on and willing
          to own, ensuring a strategy aligned with your investment goals and
          risk tolerance.
        </p>
        <div className="text-right">
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

export default GeneralSummary;
