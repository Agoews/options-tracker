"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const signOutClickHandler = () => {
    router.push("/");
    signOut();
  };

  return (
    <>
      <div className="navbar bg-slate-800 test-slate-200">
        <div className="navbar-start">
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              {session && session.user ? (
                <li>
                  <a onClick={signOutClickHandler}>Sign Out</a>
                </li>
              ) : (
                <li>
                  <a onClick={() => signIn()}>Sign In</a>
                </li>
              )}
              <li>
                <Link href="/">Homepage</Link>
              </li>
              <li>
                <Link href="/resources">Resources (WIP)</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
            </ul>
          </div>
          <Link href="/" className="btn btn-ghost text-3xl">
            TradeTracker
          </Link>
        </div>

        <div className="navbar-center space-x-4 text-lg">
          <ul className="menu menu-horizontal">
            <li>
              <Link href="/tracker">Home</Link>
            </li>
            <li>
              <details>
                <summary>Strategies</summary>
                <ul className="p-1 bg-slate-800 min-w-36 rounded-t-none z-10">
                  <li>
                    <Link href="/tracker">All</Link>
                  </li>
                  <li>
                    <Link href="/the-wheel">Calls & Puts</Link>
                  </li>
                  <li>
                    <Link href="/the-wheel">The Wheel</Link>
                  </li>
                  <li>
                    <Link href="/the-wheel">Iron Condor (WIP)</Link>
                  </li>
                  <li>
                    <Link href="/the-wheel">Iron Butterfly (WIP)</Link>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>Resources (WIP)</summary>
                <ul className="p-1 bg-slate-800 min-w-36 rounded-t-none z-10">
                  <li>
                    <Link href="/resources/calls-puts">Calls & Puts</Link>
                  </li>
                  <li>
                    <Link href="/resources/the-wheel">The Wheel</Link>
                  </li>
                  <li>
                    <Link href="/resources/iron-condor">Iron Condor</Link>
                  </li>
                  <li>
                    <Link href="/resources/iron-butterfly">Iron Butterfly</Link>
                  </li>
                </ul>
              </details>{" "}
            </li>
          </ul>
          {/* <div className="dropdown">
            <div tabIndex={0} role="button" className="">
              <summary>Strategies</summary>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link href="/tracker">All</Link>
              </li>
              <li>
                <Link href="/the-wheel">The Wheel</Link>
              </li>
              <li>
                <Link href="/the-wheel">Iron Condor (WIP)</Link>
              </li>
            </ul>
          </div> */}
          {/* <Link href="/">Resources</Link> */}
        </div>

        <div className="navbar-end">
          {session && session.user ? (
            <div className="flex gap-4 ml-auto">
              <p>{session.user.name}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
