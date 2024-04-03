import React from "react";

interface PutReturnsProps {
  closingCosts: string | number;
  openingCosts: string | number;
  totalPL: number;
}

const PutReturns: React.FC<PutReturnsProps> = ({
  closingCosts,
  openingCosts,
  totalPL,
}) => {
  return (
    <>
      <h2 className="text-[#00ee00] my-1">Put P/L</h2>

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

export default PutReturns;
