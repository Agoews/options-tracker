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
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-slate-800 rounded-box w-52"
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
                <Link href="/">Home</Link>
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
          <ul className="menu menu-horizontal space-x-10">
            {session && session.user ? (
              <>
                <li>
                  <div className="dropdown dropdown-hover dropdown-bottom p-0">
                    <div tabIndex={0} role="button" className="btn btn-ghost">
                      Strategies
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content p-1 bg-slate-800 min-w-36 rounded-lg z-10"
                    >
                      <li>
                        <Link href="/summary">Summary</Link>
                      </li>
                      <li>
                        <Link href="/tracker">All Trades</Link>
                      </li>
                      <li>
                        <Link href="/calls-puts">Calls & Puts</Link>
                      </li>
                      <li>
                        <Link href="/the-wheel">The Wheel</Link>
                      </li>
                      {/* <li>
                      <Link href="/iron-condor">Iron Condor (WIP)</Link>
                    </li>
                    <li>
                      <Link href="/iron-butterfly">Iron Butterfly (WIP)</Link>
                    </li> */}
                    </ul>
                  </div>
                </li>
              </>
            ) : null}
            <li>
              <div className="dropdown dropdown-hover dropdown-bottom p-0">
                <div tabIndex={0} role="button" className="btn btn-ghost">
                  Resources (WIP)
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content p-1 bg-slate-800 min-w-36 rounded-lg z-10"
                >
                  <li>
                    <Link href="/resources/calls-puts">Calls & Puts</Link>
                  </li>
                  <li>
                    <Link href="/resources/the-wheel">The Wheel</Link>
                  </li>
                  {/* <li>
                    <Link href="/resources/iron-condor">Iron Condor (WIP)</Link>
                  </li>
                  <li>
                    <Link href="/resources/iron-butterfly">
                      Iron Butterfly (WIP)
                    </Link>
                  </li> */}
                </ul>
              </div>
            </li>
          </ul>
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
