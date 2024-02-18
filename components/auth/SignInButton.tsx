"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

const SignInButton = () => {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <div className="flex gap-4 ml-auto">
        <p className="text-sky-600">{session.user.name}</p>
        <button className="text-red-600" onClick={() => signOut()}>
          Sign Out
        </button>
      </div>
    );
  }
  return (
    <div>
      <button className="text-green-600 ml-auto" onClick={() => signIn()}>
        Sign In
      </button>
    </div>
  );
};

export default SignInButton;
