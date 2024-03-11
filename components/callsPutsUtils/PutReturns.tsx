import React from "react";

interface PutReturnsProps {
  totalCredits: string | number;
  totalDebits: string | number;
  totalPL: number;
}

const PutReturns: React.FC<PutReturnsProps> = ({
  totalCredits,
  totalDebits,
  totalPL,
}) => {
  return (
    <>
      <h2 className="text-slate-200 my-1">Put P/L</h2>

      <table className="table table-xs text-xs">
        <thead>
          <tr className="bg-slate-400 text-slate-800 border-2 border-slate-800 text-center">
            <th>Total Credits</th>
            <th>Total Debits</th>
            <th>Running P/L</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-center">
          <tr>
            <td>${(Number(totalCredits) * 100).toFixed(2)}</td>
            <td>${(Number(totalDebits) * 100).toFixed(2)}</td>
            <td>${totalPL.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default PutReturns;
