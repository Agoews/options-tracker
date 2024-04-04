import Link from "next/link";
import TheWheelChart from "@/components/wheel";
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

const TheWheel = async () => {
  const { providers } = options;
  const session = await getServerSession({ providers });
  const userEmail = session?.user?.email;

  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen min-w-screen items-center">
      <div className="hero min-h-screen">
        <div className="text-center text-[#00ee00]">
          <div className="overflow-x-auto">
            {userEmail ? (
              <TheWheelChart userEmail={userEmail} />
            ) : (
              <div>Loading...</div>
            )}
          </div>
          <Link className="p-1" href="/new-trade">
            <button className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2">
              New Trade
            </button>
          </Link>
          <Link className="p-1" href="/tracker">
            <button className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2">
              All Trades
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default TheWheel;
