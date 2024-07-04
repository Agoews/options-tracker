"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen min-w-screen flex-col items-center">
      <div className="flex flex-col justify-center">
        <div className="text-center text-[#00ee00]">
          <div className="max-w-xl p-10">
            <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
            <p className="mb-5 text-slate-200">
              {session && session.user
                ? `Welcome ${session.user.name?.split(" ", 1)}`
                : "Welcome to your all in one trade tracker. This is a work in progress! A Gmail account is the only way to log in at the moment. This is a proof of concept and not intended for use right now."}
            </p>
            <Link
              href={session && session.user ? "/summary" : "/api/auth/signin"}
            >
              <button className="btn border text-[#00ee00] border-[#00ee00] bg-[#002f00]">
                {session && session.user ? "Get Started" : "Login"}
              </button>
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <div className="collapse collapse-arrow w-full max-w-xl bg-base-300 rounded-lg shadow-md">
            <input type="radio" name="my-accordion-2" defaultChecked />
            <div className="collapse-title text-3xl font-bold mb-5 text-[#00ee00]">
              Roadmap
            </div>
            <div className="collapse-content">
              <ol className="list-decimal list-inside text-left text-slate-200">
                <li>
                  Fix data storage for the Calls & Puts section
                  <ul className="list-disc list-inside ml-5">
                    <li>
                      Saving trades currently overwrite the closed trade data
                      for that trade
                    </li>
                    <li>
                      It should create a new row so that we don&amp;t lost data
                      if a user reopens the trade
                    </li>
                  </ul>
                </li>
                <li>
                  New user experience
                  <ul className="list-disc list-inside ml-5">
                    <li>
                      A brief tutorial or guide should be added for new users to
                      help them get a feel for the platform
                    </li>
                  </ul>
                </li>
                <li>
                  Data validation
                  <ul className="list-disc list-inside ml-5">
                    <li>
                      Data should be validated more in depth before submission
                      to the backend
                    </li>
                  </ul>
                </li>
                <li>
                  Polish existing content
                  <ul className="list-disc list-inside ml-5">
                    <li>
                      The current displays could be improved for ease of viewing
                      important fields
                    </li>
                  </ul>
                </li>
                <li>Allow users to customize the visible columns</li>
              </ol>
            </div>
          </div>
          <div className="collapse collapse-arrow w-full max-w-xl bg-base-300 rounded-lg shadow-md">
            <input type="radio" name="my-accordion-2" />
            <div className="collapse-title text-3xl font-bold mb-5 text-[#00ee00]">
              Milestones{" "}
            </div>
            <div className="collapse-content">
              <ol className="list-decimal list-inside text-left text-slate-200">
                <li>Added OAuth2.0</li>
                <li>Saving user data from OAuth2.0</li>
                <li>Prevent logged out users from viewing pages</li>
                <li>
                  Render different header and welcome page depending on users
                  being logged in or out
                </li>
                <li>Added sign out</li>
                <li>Added navigation skeleton for several pages</li>
                <li>Users can save and close trades</li>
                <li>Added hamburger dropdown for mobile</li>
                <li>
                  Added some brief resources (will be expanded upon later)
                </li>
                <li>Added Current Stock Holdings</li>
                <li>Added Trade Summary page for total returns</li>
                <li>
                  Added the Wheel Strategy{" "}
                  <ul className="list-disc list-inside ml-5">
                    <li>Editing open options</li>
                    <li>Closing options</li>
                    <li>Rolling options to future dates</li>
                    <li>Reopening options that were closed</li>
                    <li>
                      Assigning sold calls to become current stock holdings
                    </li>
                  </ul>
                </li>
                <li>
                  Added a page to show All Trades that are open or have been
                  closed
                </li>
                <li>
                  Added a page for Calls & Puts{" "}
                  <ul className="list-disc list-inside ml-5">
                    <li>Close open options</li>
                    <li>Reopening options that were closed</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
