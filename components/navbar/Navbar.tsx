"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const signOutClickHandler = () => {
    router.push("/");
    signOut();
  };

  return (
    <div className="navbar text-[#00ee00]">
      <div className="navbar-start">
        {/* Mobile Navbar */}
        <div className="dropdown lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle m-1">
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
          </label>
          <ul
            tabIndex={0}
            className="menu bg-base-300 w-56 rounded-box dropdown-content z-[10] mt-3 p-2 shadow"
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
            {session && session.user && (
              <li>
                <details>
                  <summary>Strategies</summary>
                  <ul>
                    <li>
                      <Link href="/stock-holdings">Holdings</Link>
                    </li>
                    <li>
                      <Link href="/tracker">All Trades</Link>
                    </li>
                    <li>
                      <Link href="/summary">Summary</Link>
                    </li>
                    <li>
                      <Link href="/calls-puts">Calls & Puts</Link>
                    </li>
                    <li>
                      <Link href="/the-wheel">The Wheel</Link>
                    </li>
                  </ul>
                </details>
              </li>
            )}
            <li>
              <details>
                <summary>Resources</summary>
                <ul>
                  <li>
                    <Link href="/resources/calls-puts">Calls & Puts</Link>
                  </li>
                  <li>
                    <Link href="/resources/the-wheel">The Wheel</Link>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-lg md:text-3xl">
          TradeTracker
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal">
          {session && session.user ? (
            <div className="flex">
              <Link href="/stock-holdings">
                <div className="btn btn-ghost">Holdings</div>
              </Link>
              <li>
                <div className="dropdown dropdown-hover dropdown-bottom p-0">
                  <div tabIndex={3} role="button" className="btn btn-ghost">
                    Strategies
                  </div>
                  <ul
                    tabIndex={3}
                    className="dropdown-content p-1 bg-base-300 min-w-36 rounded-lg z-10"
                  >
                    <li>
                      <Link href="/tracker">All Trades</Link>
                    </li>
                    <li>
                      <Link href="/summary">Summary</Link>
                    </li>
                    <li>
                      <Link href="/calls-puts">Calls & Puts</Link>
                    </li>
                    <li>
                      <Link href="/the-wheel">The Wheel</Link>
                    </li>
                  </ul>
                </div>
              </li>
            </div>
          ) : null}
          <li>
            <div className="dropdown dropdown-hover dropdown-bottom p-0">
              <div tabIndex={4} role="button" className="btn btn-ghost">
                Resources (WIP)
              </div>
              <ul
                tabIndex={4}
                className="dropdown-content p-1 bg-base-300 min-w-36 rounded-lg z-10"
              >
                <li>
                  <Link href="/resources/calls-puts">Calls & Puts</Link>
                </li>
                <li>
                  <Link href="/resources/the-wheel">The Wheel</Link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <div className="navbar-end">
        {session && session.user ? (
          <div className="flex gap-4 ml-auto">
            <div className="dropdown dropdown-bottom dropdown-end">
              <div tabIndex={5} role="button" className="btn btn-ghost avatar">
                <div className="w-8 rounded-full">
                  <Image
                    src={session.user.image || "/default-profile.png"}
                    alt="User Profile Picture"
                    width={32}
                    height={32}
                  />
                </div>
              </div>
              <ul
                tabIndex={5}
                className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-300 rounded-box w-32 z-50"
              >
                <li>
                  <a onClick={signOutClickHandler}>Sign Out</a>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Navbar;
