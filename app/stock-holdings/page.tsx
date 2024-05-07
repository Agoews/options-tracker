import React from "react";
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
      <div className="hero min-h-screen">
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

// Add a button on the wheel page to assign calls and puts
