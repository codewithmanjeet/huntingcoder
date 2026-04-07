"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function CoursePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [user, setUser] = useState(null);

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

  const handlePayment = async () => {
    if (!user) {
      alert("Login first ❌");
      return;
    }

    const res = await fetch("/api/create-order", {
      method: "POST",
    });

    const data = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: data.amount,
      currency: "INR",
      order_id: data.id,
      handler: function () {
        alert("Payment Success ✅");
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a, #1e293b, #020617)",
        color: "#fff",
        padding: "60px 20px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "42px",
          marginBottom: "40px",
        }}
      >
        🚀 Web Development Courses
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "25px",
          maxWidth: "1000px",
          margin: "auto",
        }}
      >
        <CourseCard
          title="HTML Course"
          desc="Learn HTML from scratch with real projects"
          price="₹1"
          active={true}
          user={user}
          onClick={handlePayment}
        />

        <CourseCard
          title="CSS Course"
          desc="Master Flexbox, Grid & animations"
          price="Coming Soon"
          active={false}
        />

        <CourseCard
          title="JavaScript Course"
          desc="DOM, ES6, Projects & more"
          price="Coming Soon"
          active={false}
        />
      </div>
    </main>
  );
}

function CourseCard({ title, desc, price, active, user, onClick }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        padding: "25px",
        borderRadius: "15px",
        transition: "0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <h2 style={{ fontSize: "22px" }}>{title}</h2>
      <p style={{ opacity: 0.7, margin: "10px 0" }}>{desc}</p>

      <h3 style={{ marginTop: "10px", color: "#38bdf8" }}>{price}</h3>

      <button
        onClick={active && user ? onClick : null}
        disabled={!active || !user}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          background: active
            ? user
              ? "linear-gradient(90deg, #3b82f6, #06b6d4)"
              : "#475569"
            : "#1e293b",
          color: "#fff",
          cursor: active && user ? "pointer" : "not-allowed",
          fontWeight: "bold",
        }}
      >
        {!active
          ? "Coming Soon 🚧"
          : user
          ? `Buy Now ${price}`
          : "Login Required 🔒"}
      </button>
    </div>
  );
}