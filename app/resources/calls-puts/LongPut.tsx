import Link from "next/link";
import React from "react";

const LongPut = () => {
  return (
    <div className="collapse collapse-plus bg-[#002f00] bg-opacity-70">
      <input type="checkbox" />
      <div className="collapse-title text-lg font-bold text-slate-200">
        Long Put
      </div>
      <div className="collapse-content text-sm space-y-2">
        <p>
          The long put strategy is an investment approach where you purchase a
          put option, betting on the decline of the stock&apos;s price below the
          strike price by the expiration date. Unlike the long call, this
          strategy capitalizes on a stock&apos;s potential decrease.
        </p>
        <div className="text-lg font-medium text-slate-200">Example:</div>
        <p>
          For XYZ stock at $50 per share, a put option with a $50 strike price
          and six months to expiration can be bought for a $5 premium per share,
          totaling a $500 investment for a contract covering 100 shares.
        </p>
        <div className="text-lg font-medium text-slate-200">
          Payoff Profile:
        </div>
        <table className="table table-xs">
          <thead className="text-[#00ee00]">
            <tr>
              <th>Stock Price at Expiration</th>
              <th>Long Put&apos;s Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover">
              <td>$60</td>
              <td>-$500</td>
            </tr>
            <tr className="hover">
              <td>$50</td>
              <td>-$500</td>
            </tr>
            <tr className="hover">
              <td>$45</td>
              <td>$0 (Break-even)</td>
            </tr>
            <tr className="hover">
              <td>$40</td>
              <td>$500</td>
            </tr>
            <tr className="hover">
              <td>$30</td>
              <td>$1,500</td>
            </tr>
          </tbody>
        </table>
        <div className="text-lg font-medium text-slate-200">
          Potential Upside/Downside:
        </div>
        <p>
          The maximum gain for a long put is theoretically the strike price
          times 100 per contract if the stock falls to $0, offering significant
          profit potential. However, the risk is limited to the loss of the
          entire premium, $500 in this scenario, if the prediction is incorrect.
        </p>
        <div className="text-lg font-medium text-slate-200">Why Use It:</div>
        <p>
          A long put is suitable for those willing to risk the premium to profit
          from a stock&apos;s decline. It offers more substantial earnings
          potential than short-selling, with a clearly defined risk. This
          strategy can be particularly appealing for limiting losses compared to
          the unlimited risk of short-selling.
        </p>
        <div className="text-right text-slate-200">
          <Link
            className="link"
            href="https://www.nerdwallet.com/article/investing/options-trading-strategies"
          >
            nerdwallet.com
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LongPut;
