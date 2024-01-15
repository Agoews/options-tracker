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
        <div className="hero-overlay bg-opacity-70"></div>
        <div className="hero-content text-center text-slate-800">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
            <p className="mb-5 text-slate-400">
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
              excepturi exercitationem quasi. In deleniti eaque aut repudiandae
              et a id nisi.
            </p>
            <Link href="/tracker">
              <button className="btn bg-slate-800 text-slate-400">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
