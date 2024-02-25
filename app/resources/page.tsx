import React from "react";
import Background from "@/public/Background_1.png";
const Resources = () => {
  return (
    <>
      <main className="flex min-h-screen min-w-screen flex-col items-center">
        <div
          className="hero min-h-screen"
          style={{
            backgroundImage: `url(${Background.src})`,
          }}
        >
          <div className="hero-overlay bg-opacity-60"></div>
          <div className="text-center text-slate-800">
            <div
              tabIndex={0}
              className="collapse collapse-plus border border-base-300 bg-slate-400"
            >
              <div className="collapse-title text-xl font-medium">
                Focus me to see content
              </div>
              <div className="collapse-content">
                <p>
                  tabIndex={0} attribute is necessary to make the div focusable
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Resources;
