import Link from "next/link";
import Background from "@/public/Background_1.png";
import Chart from "@/components/chart";

const Tracker = () => {
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
              <Chart />
            </div>
          </div>
          <Link className="p-1" href="/">
            <button className="btn bg-slate-800 text-slate-200 mt-2">
              Home
            </button>
          </Link>
          <Link className="p-1" href="/new-trade">
            <button className="btn bg-slate-800 text-slate-200 mt-2">
              Enter New Trade
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Tracker;
