import Link from "next/link";
import Background from "@/public/Background_1.png";
import Chart from "@/components/chart";
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
        <div
          className="hero min-h-screen"
          style={{
            backgroundImage: `url(${Background.src})`,
          }}
        >
          <div className="hero-overlay bg-opacity-60"></div>
          <div className="text-center text-slate-800">
            <div className="rounded border-4 border-slate-800">
              <div className="overflow-x-auto">
                {userEmail ? (
                  <Chart userEmail={userEmail} />
                ) : (
                  <div>Loading...</div>
                )}
              </div>
            </div>
            <Link className="p-1" href="/new-trade">
              <button className="btn bg-slate-800 text-slate-200 mt-2">
                New Trade
              </button>
            </Link>
            <Link className="p-1" href="/the-wheel">
              <button className="btn bg-slate-800 text-slate-200 mt-2">
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
