import React from "react";

const About = () => {
  return (
    <main className="flex min-h-screen min-w-screen flex-col items-center">
      <div className="hero min-h-screen">
        <div className="hero-content text-center text-[#00ee00]">
          <div className="max-w-md">
            <h1 className="mb-5 text-4xl font-bold">
              My Personal Tracking Project
            </h1>
            <p className="mb-5 text-slate-200">
              Welcome to my personal project! As an individual investor striving
              to navigate the complexities of the financial markets, I found
              myself in need of a tool that doesn&apos;t seem to exist. This
              project is my solution: an investment tracking tool that helps
              monitor investments as I make them.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default About;
