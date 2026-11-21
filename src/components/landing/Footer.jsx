"use client";

import { useState } from "react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail("");
      }, 2000);
    }
  };

  const socialLinks = [
    { name: "Instagram", icon: "bi-instagram", href: "https://instagram.com", color: "#FF2990" },
    { name: "YouTube", icon: "bi-youtube", href: "https://youtube.com", color: "#FF0033" },
    { name: "Twitter", icon: "bi-twitter-x", href: "https://twitter.com", color: "#09C5D6" },
    { name: "Facebook", icon: "bi-facebook", href: "https://facebook.com", color: "#1877F2" },
    { name: "LinkedIn", icon: "bi-linkedin", href: "https://linkedin.com", color: "#0A66C2" },
  ];

  return (
    <footer
      id="contact"
      className="position-relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #050508 0%, #08080f 40%, #030305 100%)",
        paddingTop: "40px",
        paddingBottom: "35px",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Ambient background glows */}
      <div
        className="position-absolute"
        style={{
          top: "-150px",
          left: "20%",
          width: "500px",
          height: "350px",
          background: "radial-gradient(circle, rgba(9, 197, 214, 0.12) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        className="position-absolute"
        style={{
          bottom: "10%",
          right: "10%",
          width: "450px",
          height: "350px",
          background: "radial-gradient(circle, rgba(255, 41, 144, 0.1) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        {/* Floating Brand Favicon at the Right Side above the card */}
        <div className="position-relative d-flex justify-content-end mb-1 pe-4" data-aos="fade-left" data-aos-delay="100">
          <div
            className="floating-element"
            style={{
              cursor: "pointer",
              transition: "transform 0.3s ease",
              marginBottom: "-12px",
              zIndex: 3,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.18) rotate(-5deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            }}
          >
            <Image
              src="/images/favicon.png"
              alt="Chirpii Favicon"
              width={86}
              height={86}
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 6px 16px rgba(255, 41, 144, 0.6))",
              }}
              priority
            />
          </div>
        </div>

        {/* Top Interactive VIP / Newsletter Banner Card */}
        <div
          className="p-4 p-lg-5 rounded-4 mb-5 position-relative overflow-hidden"
          data-aos="fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(22, 22, 34, 0.9) 0%, rgba(13, 13, 20, 0.95) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(9, 197, 214, 0.12)",
          }}
        >
          <div className="row align-items-center gy-4">
            <div className="col-lg-7 text-center text-lg-start">
              <span className="badge px-3 py-1 rounded-pill mb-2" style={{ background: "rgba(255, 41, 144, 0.15)", color: "#FF2990", border: "1px solid rgba(255, 41, 144, 0.35)", fontSize: "0.78rem" }}>
                <i className="bi bi-bell-fill me-1"></i> NEVER MISS AN EPISODE
              </span>
              <h3 className="fw-extrabold text-white mb-2" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: 800 }}>
                Get Early Drops & <span className="text-gradient-brand">Exclusive Releases</span>
              </h3>
              <p className="text-secondary small mb-0" style={{ maxWidth: "480px", fontSize: "0.92rem", lineHeight: 1.5 }}>
                Join 250,000+ story lovers. Receive instant notifications about new series releases, cliffhanger drops, and VIP community perks.
              </p>
            </div>

            <div className="col-lg-5">
              <form onSubmit={handleNewsletter} className="position-relative">
                <div
                  className="d-flex align-items-center p-1 rounded-pill"
                  style={{
                    background: "rgba(10, 10, 16, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <i className="bi bi-envelope text-cyan ms-3 fs-6"></i>
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="form-control border-0 bg-transparent text-white shadow-none ps-2"
                    style={{ fontSize: "0.9rem" }}
                  />
                  <button
                    type="submit"
                    className="btn px-4 py-2 rounded-pill fw-bold text-white text-nowrap"
                    style={{
                      background: subscribed
                        ? "#198754"
                        : "linear-gradient(90deg, #09C5D6 0%, #FF2990 100%)",
                      fontSize: "0.85rem",
                      boxShadow: "0 0 15px rgba(255, 41, 144, 0.4)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {subscribed ? (
                      <>
                        <i className="bi bi-check-circle-fill me-1"></i> Subscribed!
                      </>
                    ) : (
                      <>
                        Subscribe <i className="bi bi-arrow-right ms-1"></i>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info Grid */}
        <div className="row g-4 mb-5 pt-2" data-aos="fade-up" data-aos-delay="100">
          {/* Brand Info & Mission */}
          <div className="col-12 col-md-6 col-lg-4 text-center text-md-start">
            <div className="position-relative mb-3 mx-auto mx-md-0" style={{ width: "145px", height: "48px" }}>
              <Image
                src="/images/logo1.png"
                alt="Chirpii"
                fill
                sizes="145px"
                style={{ objectFit: "contain", objectPosition: "left" }}
              />
            </div>
            <p className="text-secondary small mb-4" style={{ maxWidth: "340px", lineHeight: 1.6, fontSize: "0.9rem" }}>
              <strong className="text-white d-block mb-1" style={{ letterSpacing: "1px" }}>
                SHORT STORIES. BIG EMOTIONS.
              </strong>
              India’s next-generation vertical OTT platform delivering cinema-grade episodic stories and thrilling drama designed specifically for your smartphone.
            </p>

            {/* Social handles with hover glow pills */}
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="d-flex align-items-center justify-content-center rounded-circle text-white text-decoration-none"
                  style={{
                    width: 38,
                    height: 38,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    fontSize: "0.95rem",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = s.color;
                    e.currentTarget.style.color = s.color;
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = `0 4px 15px ${s.color}55`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  aria-label={s.name}
                >
                  <i className={`bi ${s.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-white fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
              <span style={{ width: 4, height: 16, background: "#09C5D6", borderRadius: 2 }} />
              Quick Links
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><a href="#home" className="text-secondary text-decoration-none hover-white">Home</a></li>
              <li><a href="#about" className="text-secondary text-decoration-none hover-white">About Us</a></li>
              <li><a href="#stories" className="text-secondary text-decoration-none hover-white">Explore Stories</a></li>
              <li><a href="#genres" className="text-secondary text-decoration-none hover-white">Genres Catalog</a></li>
              <li><a href="#trending" className="text-secondary text-decoration-none hover-white">Trending Top 5</a></li>
              <li><a href="#premium" className="text-secondary text-decoration-none hover-white">VIP Membership</a></li>
              <li><a href="#faq" className="text-secondary text-decoration-none hover-white">Help & FAQs</a></li>
            </ul>
          </div>

          {/* Top Genres */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-white fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
              <span style={{ width: 4, height: 16, background: "#FF2990", borderRadius: 2 }} />
              Top Genres
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><a href="#genres" className="text-secondary text-decoration-none hover-white">Mystery & Suspense</a></li>
              <li><a href="#genres" className="text-secondary text-decoration-none hover-white">Romance & Passion</a></li>
              <li><a href="#genres" className="text-secondary text-decoration-none hover-white">Blockbuster Action</a></li>
              <li><a href="#genres" className="text-secondary text-decoration-none hover-white">Heartfelt Drama</a></li>
              <li><a href="#genres" className="text-secondary text-decoration-none hover-white">Psychological Thriller</a></li>
              <li><a href="#genres" className="text-secondary text-decoration-none hover-white">Dark Fantasy</a></li>
              <li><a href="#genres" className="text-secondary text-decoration-none hover-white">Pure Comedy</a></li>
            </ul>
          </div>

          {/* Contact Details & Official Badges */}
          <div className="col-12 col-md-12 col-lg-4 text-center text-lg-start">
            <h6 className="text-white fw-bold mb-3 d-flex align-items-center justify-content-center justify-content-lg-start gap-2" style={{ fontSize: "0.95rem" }}>
              <span style={{ width: 4, height: 16, background: "#FFB52E", borderRadius: 2 }} />
              Get In Touch
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary">
              <li className="d-flex align-items-start justify-content-center justify-content-lg-start gap-2">
                <i className="bi bi-geo-alt text-pink mt-1"></i>
                <span style={{ maxWidth: "290px" }}>Chirpii Media HQ, Cyber Gateway, HITEC City, Hyderabad, Telangana 500081</span>
              </li>
              <li className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                <i className="bi bi-envelope text-cyan"></i>
                <a href="mailto:support@chirpii.com" className="text-secondary text-decoration-none">
                  support@chirpii.com
                </a>
              </li>
              <li className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                <i className="bi bi-headset text-gold"></i>
                <span>24/7 Dedicated In-App Creator & VIP Support</span>
              </li>
            </ul>

            {/* Download Badges */}
            <div className="mt-4 pt-1 d-flex flex-wrap justify-content-center justify-content-lg-start gap-2">
              <a
                href="#download"
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-white text-decoration-none"
                style={{
                  background: "#0c0c14",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: "10px",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#09C5D6")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)")}
              >
                <i className="bi bi-google-play text-cyan fs-5"></i>
                <div className="text-start" style={{ lineHeight: 1.1 }}>
                  <div className="text-secondary" style={{ fontSize: "0.62rem" }}>GET IT ON</div>
                  <div className="fw-semibold text-white" style={{ fontSize: "0.82rem" }}>Google Play</div>
                </div>
              </a>

              <a
                href="#download"
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-white text-decoration-none"
                style={{
                  background: "#0c0c14",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: "10px",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#FF2990")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)")}
              >
                <i className="bi bi-apple text-white fs-5"></i>
                <div className="text-start" style={{ lineHeight: 1.1 }}>
                  <div className="text-secondary" style={{ fontSize: "0.62rem" }}>DOWNLOAD ON</div>
                  <div className="fw-semibold text-white" style={{ fontSize: "0.82rem" }}>App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Copyright Section with Live Security Badges */}
        <div
          className="pt-4 border-top border-secondary border-opacity-25 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-secondary small"
        >
          <div className="d-flex align-items-center gap-2 text-center text-md-start">
            <span style={{ fontSize: "0.82rem" }}>
              © {currentYear} Chirpii Media Entertainment Pvt. Ltd. All Rights Reserved.
            </span>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-4" style={{ fontSize: "0.82rem" }}>
            <a href="#about" className="text-secondary text-decoration-none hover-white">Privacy Policy</a>
            <a href="#about" className="text-secondary text-decoration-none hover-white">Terms of Service</a>
            <a href="#about" className="text-secondary text-decoration-none hover-white">Content Guidelines</a>
            <a href="#about" className="text-secondary text-decoration-none hover-white d-inline-flex align-items-center gap-1">
              <i className="bi bi-shield-check text-success"></i> 256-Bit SSL Encrypted
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
