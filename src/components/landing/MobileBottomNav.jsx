"use client";

import { useEffect, useState } from "react";

export default function MobileBottomNav() {
  const [activeItem, setActiveItem] = useState("home");

  const navItems = [
    { id: "home", label: "Home", href: "#home", icon: "bi-house-door-fill" },
    { id: "explore", label: "Explore", href: "#genres", icon: "bi-compass-fill" },
    { id: "stories", label: "Trailers", href: "#stories", icon: "bi-film" },
    { id: "mylist", label: "My List", href: "#app-showcase", icon: "bi-bookmark-heart-fill" },
    { id: "profile", label: "Profile", href: "#premium", icon: "bi-person-circle" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const homeEl = document.getElementById("home");
      const genresEl = document.getElementById("genres");
      const storiesEl = document.getElementById("stories");
      const showcaseEl = document.getElementById("app-showcase");
      const premiumEl = document.getElementById("premium");

      if (premiumEl && scrollPos >= premiumEl.offsetTop) {
        setActiveItem("profile");
      } else if (showcaseEl && scrollPos >= showcaseEl.offsetTop) {
        setActiveItem("mylist");
      } else if (genresEl && scrollPos >= genresEl.offsetTop) {
        setActiveItem("explore");
      } else if (storiesEl && scrollPos >= storiesEl.offsetTop) {
        setActiveItem("stories");
      } else {
        setActiveItem("home");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e, item) => {
    e.preventDefault();
    setActiveItem(item.id);
    const target = document.querySelector(item.href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="d-lg-none position-fixed bottom-0 start-0 w-100 px-3 pb-3"
      style={{
        zIndex: 1050,
        pointerEvents: "none",
      }}
    >
      <nav
        className="creative-mobile-dock mx-auto shadow-lg"
        style={{
          maxWidth: "460px",
          pointerEvents: "auto",
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          {navItems.map((item, idx) => {
            const isActive = activeItem === item.id;
            const isCenter = idx === 2; // Center "Trailers / Watch" button

            if (isCenter) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleClick(e, item)}
                  className="creative-dock-item text-decoration-none"
                  aria-label={item.label}
                >
                  <div className="center-action-orb">
                    <i className="bi bi-play-fill text-white fs-3 ms-1"></i>
                  </div>
                  <span
                    className="dock-label fw-bold mt-1"
                    style={{
                      color: isActive ? "#FF2990" : "#ffffff",
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              );
            }

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleClick(e, item)}
                className={`creative-dock-item ${isActive ? "active" : ""}`}
                aria-label={item.label}
              >
                <div className="dock-icon-wrapper">
                  <i
                    className={`bi ${item.icon}`}
                    style={{
                      fontSize: "1.2rem",
                      color: isActive ? "#FF2990" : "rgba(255, 255, 255, 0.65)",
                      transform: isActive ? "scale(1.15)" : "scale(1)",
                      transition: "all 0.25s ease",
                    }}
                  />
                  {isActive && (
                    <span
                      className="position-absolute bottom-0 start-50 translate-middle-x rounded-pill"
                      style={{
                        width: "16px",
                        height: "2.5px",
                        background: "#FF2990",
                        boxShadow: "0 0 8px #FF2990",
                      }}
                    />
                  )}
                </div>
                <span
                  className="dock-label fw-semibold"
                  style={{
                    color: isActive ? "#FF2990" : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
