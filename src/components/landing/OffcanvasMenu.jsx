"use client";

import Image from "next/image";

export default function OffcanvasMenu({ isOpen, onClose }) {
  if (!isOpen) return null;

  const menuItems = [
    { label: "Home", href: "#home", icon: "bi-house-door" },
    { label: "About Us", href: "#about", icon: "bi-info-circle" },
    { label: "Explore Stories", href: "#stories", icon: "bi-play-btn" },
    { label: "Genres", href: "#genres", icon: "bi-grid-3x3-gap" },
    { label: "Trending", href: "#trending", icon: "bi-fire" },
    { label: "Languages", href: "#languages", icon: "bi-translate" },
    { label: "Premium Plans", href: "#premium", icon: "bi-award" },
    { label: "FAQ", href: "#faq", icon: "bi-question-circle" },
    { label: "Contact Us", href: "#contact", icon: "bi-envelope" },
  ];

  const handleLinkClick = (href) => {
    onClose();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ zIndex: 1060 }}
    >
      {/* Backdrop */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          transition: "opacity 0.3s ease",
        }}
        onClick={onClose}
      />

      {/* Offcanvas Drawer Content */}
      <div
        className="position-absolute top-0 end-0 h-100 d-flex flex-column"
        style={{
          width: "min(340px, 85vw)",
          background: "#0c0c11",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.8)",
          zIndex: 1061,
          animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-4 border-bottom border-secondary border-opacity-25">
          <div className="position-relative" style={{ width: "120px", height: "42px" }}>
            <Image
              src="/images/logo1.png"
              alt="Chirpii"
              fill
              sizes="120px"
              style={{ objectFit: "contain" }}
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm text-white-50 p-2 d-flex align-items-center justify-content-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}
            aria-label="Close menu"
          >
            <i className="bi bi-x-lg text-white"></i>
          </button>
        </div>

        {/* Premium Banner in Offcanvas */}
        <div className="p-3 mx-3 my-3 rounded-4" style={{
          background: "linear-gradient(135deg, rgba(255,41,144,0.15) 0%, rgba(9,197,214,0.15) 100%)",
          border: "1px solid rgba(255,41,144,0.3)"
        }}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning text-dark fw-bold">PRO</span>
            <span className="fw-bold text-white small">Chirpii Premium</span>
          </div>
          <p className="text-secondary small mb-2" style={{ fontSize: "0.8rem" }}>
            Unlimited short series & episodes ad-free.
          </p>
          <a
            href="#premium"
            onClick={() => handleLinkClick("#premium")}
            className="btn btn-chirpii-primary btn-sm w-100 py-1"
            style={{ fontSize: "0.82rem" }}
          >
            Upgrade Now ₹499/yr
          </a>
        </div>

        {/* Navigation list */}
        <div className="flex-grow-1 px-3 py-2">
          <ul className="list-unstyled d-flex flex-column gap-1 mb-0">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.href);
                  }}
                  className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none text-light"
                  style={{
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <i className={`bi ${item.icon} text-cyan`} style={{ fontSize: "1.1rem" }}></i>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Offcanvas Footer Actions */}
        <div className="p-4 border-top border-secondary border-opacity-25 mt-auto">
          <a
            href="#download"
            onClick={() => handleLinkClick("#download")}
            className="btn btn-chirpii-primary w-100 mb-3"
            style={{ fontSize: "0.9rem" }}
          >
            <i className="bi bi-download me-1"></i> Download App
          </a>

          {/* Social Icons */}
          <div className="d-flex justify-content-center gap-3 mb-3 text-secondary">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-secondary fs-5"><i className="bi bi-instagram"></i></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-secondary fs-5"><i className="bi bi-facebook"></i></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-secondary fs-5"><i className="bi bi-youtube"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-secondary fs-5"><i className="bi bi-twitter-x"></i></a>
          </div>

          <p className="text-center text-muted small mb-0" style={{ fontSize: "0.75rem" }}>
            © 2026 Chirpii Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
