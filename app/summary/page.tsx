import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";
import { options } from "../api/auth/[...nextauth]/options";
import { Trade, fetcher } from "@/components/utils/fetcher";
import Link from "next/link";
import TotalReturnsTable from "./TotalReturns";

const SummaryPage = async () => {
  const initialTradeState: Trade = {
    tradeid: 0,
    closedtradeid: 0,
    ticker: "",
    actions: "",
    strategy: "",
    optionprice: 0,
    strike: 0,
    currentprice: 0,
    closingprice: 0,
    expirationdate: "",
    completiondate: "",
    openquantity: 0,
    closedquantity: 0,
    isclosed: false,
    averageClosingPrice: 0,
    totalClosingQuantity: 0,
    openTrades: [],
    closedTrades: [],
  };

  const { providers } = options;
  const session = await getServerSession({ providers });
  const userEmail = session?.user?.email;

  if (!session) {
    redirect("/");
  }

  return (
    <>
      <main className="flex min-h-screen min-w-screen flex-col items-center">
        <div className="hero min-h-screen">
          <div className="text-center">
            <div>
              <div>
                {userEmail ? (
                  <TotalReturnsTable userEmail={userEmail} />
                ) : (
                  <div>Loading...</div>
                )}
              </div>
            </div>
            <Link className="p-1" href="/new-trade">
              <button className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2">
                New Trade
              </button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default SummaryPage;
