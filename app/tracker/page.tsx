import Link from "next/link";
import Background from "@/public/Background_1.png";

const Tracker = () => {
  return (
    <main className="flex min-h-screen min-w-screen flex-col items-center">
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage: `url(${Background.src})`,
        }}
      >
        <div className="hero-overlay bg-opacity-70"></div>
        <div className="hero-content text-center text-slate-800">
          <div className="max-w-2xl">
            <div className="overflow-x-auto">
              <table className="table table-xs table-pin-rows table-pin-cols">
                <thead>
                  <tr className="bg-slate-800 text-slate-400">
                    <td>Company</td>
                    <td>Current Price</td>
                    <td>Entry Price</td>
                    <td>Breakeven</td>
                    <td>Expiration Date</td>
                    <td>Days to Expiration</td>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr>
                    <td>MARA</td>
                    <td>19.89</td>
                    <td>1.12</td>
                    <td>21.00</td>
                    <td>02/16/2024</td>
                    <td>34 Days</td>
                  </tr>
                  <tr>
                    <td>RIOT</td>
                    <td>13.89</td>
                    <td>2.12</td>
                    <td>16.22</td>
                    <td>02/16/2024</td>
                    <td>34 Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Link href="/">
              <button className="btn bg-slate-800 text-slate-400">Home </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Tracker;
