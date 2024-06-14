import Link from "next/link";
import TheWheelChart from "@/components/wheel";
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

const TheWheel = async () => {
  const { providers } = options;
  const session = await getServerSession({ providers });
  const userEmail = session?.user?.email;

  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="hero w-[full] mx-auto">
        <div className="text-center text-[#00ee00]">
          <div>
            {userEmail ? (
              <TheWheelChart userEmail={userEmail} />
            ) : (
              <div>Loading...</div>
            )}
          </div>
          <div className="flex flex-col items-center space-y-2 mt-4">
            <Link href="/new-trade">
              <button className="btn btn-sm lg:btn-md text-[#00ee00] border-[#00ee00] bg-[#002f00] w-full">
                New Trade
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TheWheel;
