import React from "react";
import Background from "@/public/Background_1.png";
import OpenHoldings from "./OpenHoldings";
import { options } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const StockHoldings = async () => {
  const { providers } = options;
  const session = await getServerSession({ providers });
  const userEmail = session?.user?.email;

  if (!session) {
    redirect("/");
  }
  return (
    <main className="flex min-h-screen min-w-screen items-center">
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage: `url(${Background.src})`,
        }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="text-center text-slate-800"></div>
        {userEmail ? (
          <OpenHoldings userEmail={userEmail} />
        ) : (
          <div>OnLoadingComplete...</div>
        )}
      </div>
    </main>
  );
};

export default StockHoldings;

// Create a table for stock holdings
// Add a button on the wheel page to assign calls and puts

// Cost basis needs to be assigned the total value - put cost at closing if it is assigned
// Create a route to query everything from the CurrentHoldings table
