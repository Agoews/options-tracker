import Link from "next/link";
import Background from "@/public/Background_1.png";
import TheWheelChart from "@/components/wheel";

const TheWheel = () => {
  return (
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
              <TheWheelChart />
            </div>
          </div>
          <Link className="p-1" href="/">
            <button className="btn bg-slate-800 text-slate-200 mt-2">
              Home
            </button>
          </Link>
          <Link className="p-1" href="/tracker">
            <button className="btn bg-slate-800 text-slate-200 mt-2">
              All Trades
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default TheWheel;
