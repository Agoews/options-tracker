"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <>
      <div className="navbar bg-base-100">
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
                  <a onClick={() => signOut()}>Sign Out</a>
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
                <a>Resources (WIP)</a>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="navbar-center">
          <a className="btn btn-ghost text-3xl">TradeTracker</a>
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
