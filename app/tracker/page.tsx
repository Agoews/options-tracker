import Link from "next/link";
import Chart from "@/app/tracker/chart";
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

const Tracker = async () => {
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
          <div className="text-center text-[#00ee00]">
            <div className="overflow-x-auto">
              {userEmail ? (
                <Chart userEmail={userEmail} />
              ) : (
                <div>Loading...</div>
              )}
            </div>
            <Link className="p-1" href="/new-trade">
              <button className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2">
                New Trade
              </button>
            </Link>
            <Link className="p-1" href="/calls-puts">
              <button className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2">
                Calls & Puts
              </button>
            </Link>
            <Link className="p-1" href="/the-wheel">
              <button className="btn text-[#00ee00] border-[#00ee00] bg-[#002f00] mt-2">
                The Wheel
              </button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Tracker;
