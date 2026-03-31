import "./globals.css";
import { ReactNode } from "react";
import Script from "next/script";

import Navbar from "./components/Navbar";
import TopLoader from "./components/TopLoader";
import SmoothScroll from "./components/SmoothScroll";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";

export const metadata = {
  title: "Hunting_Coder73 Blog",
  description: "Personal Blog Website",
};

// ✅ Type define karo
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <CustomCursor />
        <SmoothScroll />
        <TopLoader />
        <Navbar />

        {children}

        <Footer />

        {/* ✅ Razorpay Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}