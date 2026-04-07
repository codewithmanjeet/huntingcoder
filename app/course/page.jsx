"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function CoursePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [user, setUser] = useState(null);

  // ✅ LOGIN CHECK
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

  // 🔥 DOWNLOAD FUNCTION
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

  // 🔥 PAYMENT FUNCTION
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
  };

  return (
    <main style={{ padding: "60px 20px", background: "#f3f4f6" }}>
      <h1 style={{ textAlign: "center", fontSize: "40px" }}>
        Web Development Courses 🚀
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginTop: "50px",
          maxWidth: "1000px",
          marginInline: "auto",
        }}
      >
        {/* ✅ HTML COURSE */}
        <CourseCard
          title="HTML Course"
          desc="Learn HTML from basic to advanced"
          price="₹1"
          active={true}
          user={user}
          onClick={handlePayment}
        />

        {/* 🚧 CSS COURSE */}
        <CourseCard
          title="CSS Course"
          desc="Master CSS layouts, flexbox & grid"
          price="Coming Soon 🚧"
          active={false}
        />

        {/* 🚧 JS COURSE */}
        <CourseCard
          title="JavaScript Course"
          desc="Learn JS, DOM, and real projects"
          price="Coming Soon 🚧"
          active={false}
        />
      </div>
    </main>
  );
}

// 🔥 CARD COMPONENT
function CourseCard({ title, desc, price, active, user, onClick }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "15px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        transition: "0.3s",
      }}
    >
      <h2>{title}</h2>
      <p style={{ margin: "10px 0" }}>{desc}</p>

      <h3 style={{ marginTop: "10px" }}>{price}</h3>

      <button
        onClick={active && user ? onClick : null}
        disabled={!active || !user}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: active
            ? user
              ? "#2563eb"
              : "#9ca3af"
            : "#e5e7eb",
          color: active ? "#fff" : "#000",
          cursor: active && user ? "pointer" : "not-allowed",
        }}
      >
        {!active
          ? "Coming Soon 🚧"
          : user
          ? `Buy Now ${price} 💰`
          : "Login Required 🔒"}
      </button>
    </div>
  );
}