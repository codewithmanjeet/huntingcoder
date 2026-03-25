"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "mdbhai01@gmail.com"; // 👈 apna admin email daalo

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Agar admin already login hai → direct dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user?.email === ADMIN_EMAIL) {
        window.location.href = "/dashboard";
      }
    };

    checkUser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // ❌ Admin email check (FIRST SECURITY)
    if (email !== ADMIN_EMAIL) {
      setErrorMsg("❌ Only Admin can login");
      setLoading(false);
      return;
    }

    // ✅ Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message || "Wrong email or password");
      setLoading(false);
      return;
    }

    // ❌ Double check (SECOND SECURITY)
    if (data.user?.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setErrorMsg("❌ Access Denied");
      setLoading(false);
      return;
    }

    // ✅ SUCCESS
    window.location.href = "/dashboard";
  };

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>HuntingCoder Admin Login</h1>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Logging in..." : "Login →"}
          </button>

          {errorMsg && <p style={errorStyle}>{errorMsg}</p>}
        </form>
      </div>
    </main>
  );
}

const mainStyle = {
  minHeight: "100vh",
  backgroundColor: "#f9fafb",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "#ffffff",
  padding: "40px 32px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const headingStyle = {
  fontSize: "28px",
  fontWeight: 700,
  textAlign: "center" as const,
  marginBottom: "32px",
  color: "#111827",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: 500,
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  outline: "none",
};

const buttonStyle = {
  padding: "13px",
  backgroundColor: "#6366f1",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: "12px",
};

const errorStyle = {
  color: "#dc2626",
  textAlign: "center" as const,
  marginTop: "12px",
  fontSize: "14px",
};