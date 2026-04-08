"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function CoursePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [user, setUser] = useState(null);

  // ✅ LOGIN CHECK (UNCHANGED)
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔥 DOWNLOAD FUNCTION (UNCHANGED)
  const downloadCourse = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Please login first ❌");
      return;
    }

    const res = await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        course: "HTML",
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error);
    }
  };

  // 🔥 PAYMENT FUNCTION (UNCHANGED)
  const handlePayment = async () => {
    if (!user) {
      alert("Login first ❌");
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
      });

      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: data.amount,
        currency: "INR",
        order_id: data.id,

        handler: async function (response) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            alert("Session expired ❌");
            return;
          }

          const verify = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              ...response,
              course: "HTML",
            }),
          });

          const result = await verify.json();

          if (result.success) {
            alert("Payment Successful ✅");
            downloadCourse();
          } else {
            alert("Payment Failed ❌");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log(err);
      alert("Something went wrong ❌");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        padding: "60px 20px",
        color: "#fff",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h1 style={{ fontSize: "42px", fontWeight: "bold" }}>
          Web Development Courses 🚀
        </h1>
        <p style={{ color: "#94a3b8" }}>
          Start learning and upgrade your skills
        </p>
      </div>

      {/* CARD GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "25px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* HTML CARD (WORKING) */}
        <CourseCard
          title="HTML Course"
          desc="You can pay a small amount to purchase this course and download a ZIP file. Inside, you will get a complete cheat sheet for this course."
          price="₹1"
          active={!!user}
          buttonText={user ? "Buy Now 💰" : "Login Required 🔒"}
          onClick={handlePayment}
        />

        {/* CSS CARD */}
        <CourseCard
          title="CSS Course"
          desc="This course is not available right now. Once it becomes available, the Coming Soon label will be removed and the Buy Now button will be activated"
          price="Coming Soon"
          active={false}
          buttonText="Coming Soon ⏳"
        />

        {/* JS CARD */}
        <CourseCard
          title="JavaScript Course"
          desc="This course is not available right now. Once it becomes available, the 'Coming Soon' label will be removed and the 'Buy Now' button will be activated."
          price="Coming Soon"
          active={false}
          buttonText="Coming Soon ⏳"
        />
      </div>
    </main>
  );
}

// ✅ MODERN CARD COMPONENT
function CourseCard({ title, desc, price, buttonText, active, onClick }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        padding: "25px",
        borderRadius: "16px",
        transition: "0.3s",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      }}
    >
      <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>{title}</h2>

      <p style={{ color: "#cbd5f5", fontSize: "14px" }}>{desc}</p>

      <p
        style={{
          marginTop: "15px",
          fontWeight: "bold",
          fontSize: "18px",
          color: "#38bdf8",
        }}
      >
        {price}
      </p>

      <button
        onClick={active ? onClick : null}
        disabled={!active}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          background: active
            ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
            : "#475569",
          color: "#fff",
          fontWeight: "bold",
          cursor: active ? "pointer" : "not-allowed",
          transition: "0.3s",
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}