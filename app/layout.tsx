import "./globals.css";

import { ReactNode } from "react";
import Script from "next/script";

import Navbar from "./components/Navbar";
import TopLoader from "./components/TopLoader";
import SmoothScroll from "./components/SmoothScroll";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";

// ✅ Metadata with favicon
export const metadata = {
  title: "Hunting_Coder73 Blog",
  description: "Personal Blog Website",

  icons: {
    // 🔹 Default (Desktop / Windows)
    icon: [
      {
        url: "/windowfav.svg",
        type: "image/svg+xml",
      },
    ],

    // 🔹 Apple Devices
    apple: [
      {
        url: "/applefav.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],

    // 🔹 Android Devices
    other: [
      {
        rel: "icon",
        url: "/androidfav.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        rel: "icon",
        url: "/androidfav.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 🔥 Fallback for extra browser support */}
        <link rel="icon" href="/windowfav.svg" />
        <link rel="apple-touch-icon" href="/applefav.svg" />
      </head>

      <body style={{ margin: 0 }}>
        <CustomCursor />
        <SmoothScroll />
        <TopLoader />
        <Navbar />

        {children}

        <Footer />

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}