import React from "react";

interface PLReturnsProps {
  totalCredits: string | number;
  totalDebits: string | number;
  totalPL: number;
}

const PLReturns: React.FC<PLReturnsProps> = ({
  totalCredits,
  totalDebits,
  totalPL,
}) => {
  return (
    <>
      <h2 className="text-[#00ee00] text-2xl text-left xl:text-center xl:mt-2">
        Wheel P/L
      </h2>
      <table className="table table-xs text-xs rounded border-2 border-[#00ee00]">
        <thead>
          <tr className="text-[#00ee00] text-center">
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

export default PLReturns;
