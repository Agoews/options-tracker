import Link from "next/link";
import React from "react";

const ShortPut = () => {
  return (
    <div className="collapse collapse-plus bg-[#002f00] bg-opacity-70">
      <input type="checkbox" />

      <div className="collapse-title text-lg font-bold text-slate-200">
        Short Put / Cash Secured Put
      </div>
      <div className="collapse-content text-sm space-y-2">
        <p>
          The short put strategy involves selling a put option, or &quot;going
          short,&quot; betting that the stock will not decline significantly
          before expiration. This strategy benefits the seller if the stock
          price stays the same or rises, allowing the put to expire worthless
          and the seller to keep the premium.
        </p>
        <div className="text-lg font-medium text-slate-200">Example:</div>
        <p>
          If XYZ stock is trading at $50 per share, a put with a $50 strike
          price can be sold for a $5 premium, netting the seller $500 for a
          contract covering 100 shares. The profit or loss for the short put is
          the inverse of a long put.
        </p>
        <div className="text-lg font-medium text-slate-200">
          Payoff Profile:
        </div>
        <table className="table table-xs">
          <thead>
            <tr className="text-[#00ee00]">
              <th>Stock Price at Expiration</th>
              <th>Short Put&apos;s Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover">
              <td>$70</td>
              <td>$500</td>
            </tr>
            <tr className="hover">
              <td>$60</td>
              <td>$500</td>
            </tr>
            <tr className="hover">
              <td>$50</td>
              <td>$500</td>
            </tr>
            <tr className="hover">
              <td>$45</td>
              <td>$0 (Break-even)</td>
            </tr>
            <tr className="hover">
              <td>$40</td>
              <td>-$500</td>
            </tr>
            <tr className="hover">
              <td>$30</td>
              <td>-$1,500</td>
            </tr>
          </tbody>
        </table>
        <div className="text-lg font-medium text-slate-200">
          Potential Upside/Downside:
        </div>
        <p>
          The maximum profit for a short put is limited to the premium received,
          $500 in this case. If the stock price remains above the strike price,
          the seller keeps the premium. However, if the stock falls below the
          strike price, the seller incurs a loss, with the maximum downside
          being significant if the stock goes to $0.
        </p>
        <div className="text-lg font-medium text-slate-200">Why Use It:</div>
        <p>
          Investors might use short puts to generate income or to enter a stock
          position at a desired lower price. While the strategy provides an
          opportunity to earn premium income or buy a stock at a discount, it
          carries the risk of substantial loss if the stock price declines.
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

export default ShortPut;
