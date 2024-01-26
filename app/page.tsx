// import Image from "next/image";
import Background from "@/public/Background_1.png";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen min-w-screen flex-col items-center">
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage: `url(${Background.src})`,
        }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-slate-800">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
            <p className="mb-5 text-slate-200">
              This is a work in progress! This will be the login page soon
              enough but that is for future development.
            </p>
            <Link href="/tracker">
              <button className="btn bg-slate-800 text-slate-200">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
