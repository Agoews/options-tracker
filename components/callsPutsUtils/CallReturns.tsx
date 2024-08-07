import React from "react";

interface CallReturnsProps {
  openingCosts: string | number;
  closingCosts: string | number;
  totalPL: number;
}
const CallReturns: React.FC<CallReturnsProps> = ({
  openingCosts,
  closingCosts,
  totalPL,
}) => {
  return (
    <div className="w-[320px] md:w-full">
      <h2 className="text-[#00ee00] text-2xl mb-1 text-left xl:text-center">
        Call P/L
      </h2>

      <table className="table table-xs text-xs rounded border-2 border-[#00ee00]">
        <thead>
          <tr className="text-[#00ee00] text-center">
            <th>Opening Price</th>
            <th>Closing Price</th>
            <th>P/L</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          <tr>
            <td>${(Number(closingCosts) * 100).toFixed(2)}</td>
            <td>${(Number(openingCosts) * 100).toFixed(2)}</td>
            <td>${totalPL.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CallReturns;
