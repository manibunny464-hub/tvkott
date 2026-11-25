"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header({ onOpenMenu }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [selectedLang, setSelectedLang] = useState("EN");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const sections = ["home", "about", "stories", "genres", "premium", "contact"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveNav(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const languages = ["EN", "HI", "TE", "TA", "ML", "KN"];

  return (
    <header
      className={`fixed-top transition-all duration-300 ${scrolled ? "glass-nav py-2" : "bg-transparent py-3"
        }`}
      style={{
        zIndex: 1040,
        transition: "all 0.3s ease-in-out",
        boxShadow: scrolled ? "0 8px 30px rgba(0,0,0,0.7)" : "none",
      }}
    >
      <div className="container-fluid px-lg-5 px-3">
        <div className="d-flex align-items-center justify-content-between">
          {/* Brand Logo with vertical divider */}
          <div className="d-flex align-items-center gap-3">
            <Link href="#home" className="d-flex align-items-center text-decoration-none">
              <div className="position-relative" style={{ width: "130px", height: "44px" }}>
                <Image
                  src="/tvk-admin-logo.webp"
                  alt="TVK OTT Logo"
                  fill
                  sizes="130px"
                  style={{ objectFit: "contain", objectPosition: "left" }}
                  priority
                />
              </div>
            </Link>
            <span
              className="d-none d-xl-block"
              style={{
                width: "1px",
                height: "22px",
                background: "rgba(255, 255, 255, 0.2)",
              }}
            />
          </div>

          {/* Center Navigation Links - Matching exact reference pills and labels */}
          <nav className="d-none d-lg-flex align-items-center gap-3">
            {/* Home Pill */}
            <a
              href="#home"
              onClick={() => setActiveNav("home")}
              className="text-decoration-none px-3 py-1 fw-medium"
              style={{
                borderRadius: "999px",
                fontSize: "0.9rem",
                color: "#ffffff",
                border: activeNav === "home" ? "1px solid #FF2990" : "1px solid transparent",
                background: activeNav === "home" ? "rgba(255, 41, 144, 0.15)" : "transparent",
                boxShadow: activeNav === "home" ? "0 0 12px rgba(255, 41, 144, 0.35)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Home
            </a>

            <a
              href="#about"
              onClick={() => setActiveNav("about")}
              className="text-decoration-none px-2 py-1 fw-normal text-white-50 hover-white"
              style={{ fontSize: "0.9rem", color: activeNav === "about" ? "#ffffff" : "#c0c0c8" }}
            >
              About Us
            </a>

            <a
              href="#stories"
              onClick={() => setActiveNav("stories")}
              className="text-decoration-none px-2 py-1 fw-normal hover-white"
              style={{ fontSize: "0.9rem", color: activeNav === "stories" ? "#ffffff" : "#c0c0c8" }}
            >
              Explore Stories
            </a>

            {/* Genres with Chevron dropdown */}
            <a
              href="#genres"
              onClick={() => setActiveNav("genres")}
              className="text-decoration-none px-2 py-1 fw-normal hover-white d-inline-flex align-items-center gap-1"
              style={{ fontSize: "0.9rem", color: activeNav === "genres" ? "#ffffff" : "#c0c0c8" }}
            >
              <span>Genres</span>
            </a>

            {/* Premium with Gold Crown Icon */}
            <a
              href="#premium"
              onClick={() => setActiveNav("premium")}
              className="text-decoration-none px-2 py-1 fw-normal hover-white d-inline-flex align-items-center gap-1 text-nowrap"
              style={{ fontSize: "0.9rem", color: activeNav === "premium" ? "#ffffff" : "#c0c0c8" }}
            >
              <i className="bi bi-crown-fill text-gold" style={{ fontSize: "0.85rem" }}></i>
              <span>Premium</span>
            </a>

            <a
              href="#contact"
              onClick={() => setActiveNav("contact")}
              className="text-decoration-none px-2 py-1 fw-normal hover-white"
              style={{ fontSize: "0.9rem", color: activeNav === "contact" ? "#ffffff" : "#c0c0c8" }}
            >
              Contact Us
            </a>
          </nav>

          {/* Right Controls */}
          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Download App Cyan-to-Pink Gradient Button */}
            <a
              href="#download"
              className="text-nowrap d-none d-sm-inline-flex align-items-center gap-2 text-white text-decoration-none fw-semibold px-3 py-1"
              style={{
                fontSize: "0.88rem",
                borderRadius: "999px",
                background: "linear-gradient(90deg, #09C5D6 0%, #FF2990 100%)",
                boxShadow: "0 0 16px rgba(9, 197, 214, 0.4)",
                paddingTop: "7px",
                paddingBottom: "7px",
              }}
            >
              <i className="bi bi-download" style={{ fontSize: "0.85rem" }}></i>
              <span>Download App</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={onOpenMenu}
              className="d-lg-none btn text-white p-2 d-flex align-items-center justify-content-center"
              style={{
                width: 38,
                height: 38,
                borderRadius: "8px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
              aria-label="Toggle navigation"
            >
              <i className="bi bi-list" style={{ fontSize: "1.4rem" }}></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
