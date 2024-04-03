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
    <>
      <h2 className="text-[#00ee00] my-1">Call P/L</h2>

      <table className="table table-xs text-xs">
        <thead>
          <tr className="text-slate-200 text-center">
            <th>Opening Price</th>
            <th>Closing Price</th>
            <th>Running P/L</th>
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
    </>
  );
};

export default CallReturns;
