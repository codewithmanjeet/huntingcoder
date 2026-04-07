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

    console.log("DOWNLOAD TOKEN:", session?.access_token); // ✅ DEBUG

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

    console.log("DOWNLOAD RESPONSE:", data); // ✅ DEBUG

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

          // ✅ 🔥 TOKEN LOG
          console.log("VERIFY TOKEN:", session?.access_token);

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

          console.log("VERIFY RESPONSE:", result); // ✅ DEBUG

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
        backgroundColor: "#f9fafb",
        padding: "60px 40px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>
          Web Development Courses 🚀
        </h1>
        <p>Start learning and upgrade your skills</p>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <BlogCard
          title="HTML Course"
          desc="Complete HTML basic notes"
          buttonText={user ? "Buy Now ₹1 💰" : "Login Required 🔒"}
          available={!!user}
          onClick={handlePayment}
        />
      </div>
    </main>
  );
}

// ✅ CARD COMPONENT
function BlogCard({ title, desc, buttonText, available, onClick }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      }}
    >
      <h2>{title}</h2>
      <p>{desc}</p>

      <button
        onClick={available ? onClick : null}
        disabled={!available}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: available ? "blue" : "gray",
          color: "#fff",
          border: "none",
          cursor: available ? "pointer" : "not-allowed",
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}