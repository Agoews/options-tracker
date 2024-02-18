import React from "react";
import SignInButton from "../auth/SignInButton";

const Navbar = () => {
  return (
    <header className="flex gap-4 bg-gradient-to-b from-white to gray-200 shadow">
      <SignInButton />
    </header>
  );
};

export default Navbar;
