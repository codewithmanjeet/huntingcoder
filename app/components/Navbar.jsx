"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ Google Login
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ✅ Get User
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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

          {/* ✅ Desktop User */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={user.user_metadata?.avatar_url || "/default-user.png"}
                alt="profile"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                }}
              />
              <span style={{ color: "#fff", fontSize: "14px" }}>
                {user.user_metadata?.full_name}
              </span>

              <button style={logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button style={loginBtn} onClick={handleGoogleLogin}>
              Login
            </button>
          )}
        </div>

        {/* Hamburger */}
        <div
          className="hamburger"
          style={hamburgerStyle}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </div>
      </nav>

      {/* ✅ Mobile Menu */}
      <div className={`mobile-wrapper ${menuOpen ? "open" : ""}`}>
        <Link href="/" style={mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="/about" style={mobileLink} onClick={() => setMenuOpen(false)}>About</Link>
        <Link href="/course" style={mobileLink} onClick={() => setMenuOpen(false)}>Course</Link>
        <Link href="/contact" style={mobileLink} onClick={() => setMenuOpen(false)}>Contact</Link>

        {/* ✅ Mobile User (FIXED IMAGE ISSUE) */}
        {user ? (
          <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={user.user_metadata?.avatar_url || "/default-user.png"}
                alt="profile"
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                }}
              />
              <span style={{ color: "#fff" }}>
                {user.user_metadata?.full_name}
              </span>
            </div>

            <button style={mobileLogoutBtn} onClick={handleLogout}>
              Logout
            </button>

          </div>
        ) : (
          <button style={mobileLoginBtn} onClick={handleGoogleLogin}>
            Login
          </button>
        )}
      </div>

      {/* ✅ Styles */}
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

// ✅ Styles
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
};

const linkStyle = {
  color: "#d1d5db",
  textDecoration: "none",
  fontSize: "16px",
};

const mobileLink = {
  color: "#ffffff",
  textDecoration: "none",
  fontSize: "18px",
};

const loginBtn = {
  backgroundColor: "#6366f1",
  color: "#fff",
  padding: "8px 16px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};

const logoutBtn = {
  backgroundColor: "#ef4444",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};

const mobileLoginBtn = {
  backgroundColor: "#6366f1",
  color: "#fff",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};

const mobileLogoutBtn = {
  backgroundColor: "#ef4444",
  color: "#fff",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};