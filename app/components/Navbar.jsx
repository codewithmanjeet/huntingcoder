"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ Get user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ✅ Login
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <nav style={navStyle}>
        <h2 style={logoStyle}>manjeet_coder</h2>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={desktopMenu}>
          <Link href="/" style={linkStyle}>Home</Link>
          <Link href="/about" style={linkStyle}>About</Link>
          <Link href="/course" style={linkStyle}>Course</Link>
          <Link href="/contact" style={linkStyle}>Contact</Link>

          {/* ✅ LOGIN / USER */}
          {!user ? (
            <button onClick={handleLogin} style={loginBtn}>
              Login
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={user.user_metadata?.avatar_url}
                alt="profile"
                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
              />
              <span style={{ color: "#ffffff", fontSize: "14px" }}>
                {user.user_metadata?.full_name}
              </span>
              <button onClick={handleLogout} style={loginBtn}>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Hamburger Icon */}
        <div
          className="hamburger"
          style={hamburgerStyle}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-wrapper ${menuOpen ? "open" : ""}`}>
        <Link href="/" style={mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="/about" style={mobileLink} onClick={() => setMenuOpen(false)}>About</Link>
        <Link href="/blog" style={mobileLink} onClick={() => setMenuOpen(false)}>Blog</Link>
        <Link href="/contact" style={mobileLink} onClick={() => setMenuOpen(false)}>Contact</Link>

        {/* ✅ MOBILE LOGIN */}
        {!user ? (
          <button onClick={handleLogin} style={mobileLoginBtn}>
            Login
          </button>
        ) : (
          <>
            <img
              src={user.user_metadata?.avatar_url}
              style={{ width: "40px", borderRadius: "50%" }}
            />
            <p style={{ color: "#ffffff" }}>
              {user.user_metadata?.full_name}
            </p>
            <button onClick={handleLogout} style={mobileLoginBtn}>
              Logout
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        nav {
          position: fixed;
          top: 0;
          z-index: 1000;
        }

        .mobile-wrapper {
          background-color: #111827;
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding: 0 20px;
          max-height: 0;
          overflow: hidden;
          transition: all 0.4s ease;
        }

        .mobile-wrapper.open {
          padding: 20px;
          max-height: 300px;
        }

        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .hamburger {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .hamburger {
            display: none !important;
          }
          .mobile-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

/* ✅ SAME STYLES (UNCHANGED) */

const navStyle = {
  width: "100%",
  padding: "16px 40px",
  backgroundColor: "#111827",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};

const logoStyle = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "600",
};

const desktopMenu = {
  display: "flex",
  gap: "20px",
  alignItems: "center",
};

const hamburgerStyle = {
  fontSize: "26px",
  color: "#ffffff",
  cursor: "pointer",
  display: "none",
  transition: "0.3s",
};

const linkStyle = {
  color: "#d1d5db",
  textDecoration: "none",
  fontSize: "16px",
  transition: "0.3s",
};

const mobileLink = {
  color: "#ffffff",
  textDecoration: "none",
  fontSize: "18px",
  padding: "5px 0",
};

const loginBtn = {
  backgroundColor: "#6366f1",
  color: "#ffffff",
  padding: "8px 16px",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "14px",
  border: "none",
  cursor: "pointer",
};

const mobileLoginBtn = {
  backgroundColor: "#6366f1",
  color: "#ffffff",
  padding: "10px",
  borderRadius: "6px",
  textAlign: "center",
  border: "none",
  cursor: "pointer",
};