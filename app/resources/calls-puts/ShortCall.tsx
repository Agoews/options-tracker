import Link from "next/link";
import React from "react";

const ShortCall = () => {
  return (
    <div className="collapse collapse-plus bg-[#002f00] bg-opacity-70">
      <input type="checkbox" />

      <div className="collapse-title text-lg font-bold text-slate-200">
        Short Call / Covered Call
      </div>
      <div className="collapse-content text-sm space-y-2">
        <p>
          The covered call is a two-part strategy where an investor owns the
          underlying stock and sells a call option on that stock. This approach
          aims for income generation by collecting the premium while betting the
          stock price will stay flat or decrease slightly until the option
          expires. The investor risks losing potential stock appreciation above
          the strike price but limits the downside risk.
        </p>
        <div className="text-lg font-medium text-slate-200">Example:</div>
        <p>
          With XYZ stock at $50 per share, an investor can sell a call with a
          $50 strike price for a $5 premium, receiving $500 for 100 shares. The
          investor must own at least 100 shares of XYZ to cover this call.
        </p>
        <div className="text-lg font-medium text-slate-200">
          Payoff Profile:
        </div>
        <table className="table table-xs">
          <thead className="text-[#00ee00]">
            <tr>
              <th>Stock Price at Expiration</th>
              <th>Call&apos;s Profit</th>
              <th>Stock&apos;s Profit</th>
              <th>Total Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover">
              <td>$80</td>
              <td>-$2,500</td>
              <td>$3,000</td>
              <td>$500</td>
            </tr>
            <tr className="hover">
              <td>$70</td>
              <td>-$1,500</td>
              <td>$2,000</td>
              <td>$500</td>
            </tr>
            <tr className="hover">
              <td>$60</td>
              <td>-$500</td>
              <td>$1,000</td>
              <td>$500</td>
            </tr>
            <tr className="hover">
              <td>$55</td>
              <td>$0</td>
              <td>$500</td>
              <td>$500</td>
            </tr>
            <tr className="hover">
              <td>$50</td>
              <td>$500</td>
              <td>$0</td>
              <td>$500</td>
            </tr>
            <tr className="hover">
              <td>$45</td>
              <td>$500</td>
              <td>-$500</td>
              <td>$0</td>
            </tr>
            <tr className="hover">
              <td>$40</td>
              <td>$500</td>
              <td>-$1,000</td>
              <td>-$500</td>
            </tr>
          </tbody>
        </table>
        <div className="text-lg font-medium text-slate-200">
          Potential Upside/Downside:
        </div>
        <p>
          The maximum profit of a covered call is limited to the premium
          received. While the strategy caps upside potential, it provides a
          buffer against stock depreciation, with the downside risk being the
          total loss of the stock&apos;s value, mitigated by the premium earned.
        </p>
        <div className="text-lg font-medium text-slate-200">Why Use It:</div>
        <p>
          Covered calls are popular for generating income on stock holdings with
          limited downside risk. It&apos;s suitable for investors who expect the
          stock to remain flat or decrease slightly, allowing for income
          generation or setting a desirable sell price for the stock.
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

export default ShortCall;
