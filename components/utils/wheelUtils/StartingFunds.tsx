import React from "react";

interface StartingFundsProps {
  totalInvested: string | number;
  totalReturns: string | number;
  totalPL: number;
}

const StartingFunds: React.FC<StartingFundsProps> = ({
  totalInvested,
  totalReturns,
  totalPL,
}) => {
  return (
    <>
      <h2 className="text-slate-200 my-1">Initial Investment P/L</h2>

      <table className="table table-xs text-xs">
        <thead>
          <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
            <th>Starting Funds</th>
            <th>Returns</th>
            <th>Total P/L (%)</th>
            <th>Add/Remove Funds</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          <tr>
            <td>${(Number(totalInvested) * 100).toFixed(2)}</td>
            <td>${(Number(totalReturns) * 100).toFixed(2)}</td>
            <td>{totalPL.toFixed(2)}%</td>
            <button className="btn btn-xs bg-slate-800 text-slate-200">
              Update Funds
            </button>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default StartingFunds;
