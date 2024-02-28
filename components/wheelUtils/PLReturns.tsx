import React from "react";

interface PLReturnsProps {
  totalInvested: string | number;
  totalReturns: string | number;
  totalPL: number;
}

const PLReturns: React.FC<PLReturnsProps> = ({
  totalInvested,
  totalReturns,
  totalPL,
}) => {
  return (
    <>
      <h2 className="text-slate-200 my-1">Wheel P/L</h2>

      <table className="table table-xs text-xs">
        <thead>
          <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
            <th>Total Credits</th>
            <th>Total Debits</th>
            <th>Running P/L (%)</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          <tr>
            <td>${(Number(totalInvested) * 100).toFixed(2)}</td>
            <td>${(Number(totalReturns) * 100).toFixed(2)}</td>
            <td>{totalPL.toFixed(2)}%</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default PLReturns;
