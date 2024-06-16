import React from "react";
import { options } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import CallsPutsTable from "@/app/calls-puts/callsPuts";

const CallsPuts = async () => {
  const { providers } = options;
  const session = await getServerSession({ providers });
  const userEmail = session?.user?.email;

  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen min-w-screen items-center">
      <div className="hero min-h-screen">
        <div className="text-center text-slate-800">
          <div>
            <div className="overflow-x-auto">
              {userEmail ? (
                <CallsPutsTable userEmail={userEmail} />
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
  );
};

export default CallsPuts;
