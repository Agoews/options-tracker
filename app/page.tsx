"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main
      className="flex min-h-screen min-w-screen flex-col items-center"
      // style={{ backgroundColor: "#002f00" }}
    >
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center text-[#00ee00]">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
            <p className="mb-5">
              {session && session.user
                ? `Welcome ${session.user.name?.split(" ", 1)}`
                : "Welcome to your all in one trade tracker. This is a work in progress! A Gmail account is the only way to log in at the moment."}
            </p>
            <Link
              href={session && session.user ? "/tracker" : "/api/auth/signin"}
            >
              <button className="btn border text-[#00ee00] border-[#00ee00] bg-[#002f00]">
                {session && session.user ? "Get Started" : "Login"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
