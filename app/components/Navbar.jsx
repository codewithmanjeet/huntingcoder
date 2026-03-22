"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={navStyle}>
        <h2 style={logoStyle}>Hunting_Coder73</h2>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={desktopMenu}>
          <Link href="/" style={linkStyle}>Home</Link>
          <Link href="/about" style={linkStyle}>About</Link>
          <Link href="/blog" style={linkStyle}>Blog</Link>
          <Link href="/contact" style={linkStyle}>Contact</Link>
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
      </div>

      <style jsx>{`
        /* Sticky Navbar */
        nav {
          position: fixed;
          top: 0;
          z-index: 1000;
        }

        /* Mobile Menu Animation */
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

        /* Responsive */
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
