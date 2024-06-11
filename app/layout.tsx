import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/auth/Providers";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

const inter = Inter({ subsets: ["latin"] });
const space_mono = Space_Mono({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeTracker",
  description:
    "Somewhere to track your option trades that isn't a mess of spreadsheets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${space_mono.className} max-w-full overflow-x-hidden`}>
        <Providers>
          <Navbar />
          <div className="container mx-auto lg:px-4">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
