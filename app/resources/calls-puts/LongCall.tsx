import Link from "next/link";
import React from "react";

const LongCalls = () => {
  return (
    <div className="collapse collapse-plus bg-[#002f00] bg-opacity-70 border-2 border-[#00ee00]">
      <input type="checkbox" />

      <div className="collapse-title text-lg font-bold text-[#00ee00]">
        Long Call
      </div>
      <div className="collapse-content text-sm space-y-2  text-slate-200">
        <p>
          The long call strategy involves buying a call option, also known as
          &quot;going long.&quot; It&apos;s a straightforward approach betting
          that the underlying stock will rise above the strike price by the
          expiration date.
        </p>
        <div className="text-lg font-medium text-[#00ee00]">Example:</div>
        <p>
          Consider XYZ stock trading at $50 per share. A call option with a $50
          strike price and a six-month expiration is priced at $5. Since each
          contract represents 100 shares, buying this call costs $500 ($5
          premium x 100 shares).
        </p>
        <div className="text-lg font-medium text-[#00ee00]">
          Payoff Profile:
        </div>
        <table className="table table-xs">
          <thead className="text-[#00ee00]">
            <tr>
              <th>Stock Price at Expiration</th>
              <th>Long Call&apos;s Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover">
              <td>$80</td>
              <td>$2,500</td>
            </tr>
            <tr className="hover">
              <td>$70</td>
              <td>$1,500</td>
            </tr>
            <tr className="hover">
              <td>$60</td>
              <td>$500</td>
            </tr>
            <tr className="hover">
              <td>$55</td>
              <td>$0 (Break-even)</td>
            </tr>
            <tr className="hover">
              <td>Below $55 down to $20</td>
              <td>-$500 (Loss limited to the premium paid)</td>
            </tr>
          </tbody>
        </table>

        <div className="text-lg font-medium text-[#00ee00]">
          Potential Upside/Downside:
        </div>
        <p>
          The upside of a long call is potentially infinite until expiration, as
          the profit grows with the stock&apos;s price increase. The downside is
          the total loss of the premium, $500 in this case, if the stock does
          not perform as expected.
        </p>
        <div className="text-lg font-medium text-[#00ee00]">Why Use It:</div>
        <p>
          A long call is suitable for those looking to wager on a stock&apos;s
          increase with limited risk. It offers a way to gain exposure to stock
          price increases without the full cost of owning the stock directly,
          limiting downside risk to the cost of the call option.
        </p>
        <div className="text-right text-[#00ee00]">
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

export default LongCalls;
