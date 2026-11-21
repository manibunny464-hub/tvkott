"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function ExploreGenres() {
  const canvasRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const genres = [
    {
      id: "mystery",
      title: "Mystery",
      category: "thrills",
      subtitle: "Whodunits & Suspense",
      stories: "48+ Series",
      tag: "Intriguing",
      color: "#09C5D6",
      icon: "bi-search",
      image: "/images/genre_mystery_1793613210620.jpg",
    },
    {
      id: "comedy",
      title: "Comedy",
      category: "light",
      subtitle: "Fun, Quirks & Laughs",
      stories: "36+ Series",
      tag: "Binge Worthy",
      color: "#FFB52E",
      icon: "bi-emoji-laughing-fill",
      image: "/images/genre_comedy_1793613234560.jpg",
    },
    {
      id: "action",
      title: "Action",
      category: "thrills",
      subtitle: "High-Octane Adrenaline",
      stories: "54+ Series",
      tag: "Top Trending",
      color: "#FF2990",
      icon: "bi-lightning-charge-fill",
      image: "/images/genre_action_1793613258780.jpg",
    },
    {
      id: "drama",
      title: "Drama",
      category: "emotional",
      subtitle: "Heartfelt Life Narratives",
      stories: "62+ Series",
      tag: "Award Winners",
      color: "#A66BEB",
      icon: "bi-heart-half",
      image: "/images/genre_drama_1793613283181.jpg",
    },
    {
      id: "romance",
      title: "Romance",
      category: "emotional",
      subtitle: "Love, Passion & Sparks",
      stories: "70+ Series",
      tag: "Most Loved",
      color: "#FF2990",
      icon: "bi-heart-fill",
      image: "/images/genre_romance_1793613308775.jpg",
    },
    {
      id: "horror",
      title: "Horror",
      category: "thrills",
      subtitle: "Spines, Chills & Fear",
      stories: "29+ Series",
      tag: "Dark Nights",
      color: "#FF3366",
      icon: "bi-moon-stars-fill",
      image: "/images/genre_horror_1793613334842.jpg",
    },
    {
      id: "thriller",
      title: "Thriller",
      category: "thrills",
      subtitle: "Edge-of-the-Seat Twists",
      stories: "58+ Series",
      tag: "Viral",
      color: "#09C5D6",
      icon: "bi-alarm-fill",
      image: "/images/genre_thriller_1793613360216.jpg",
    },
    {
      id: "fantasy",
      title: "Fantasy",
      category: "light",
      subtitle: "Mythology & Wonders",
      stories: "33+ Series",
      tag: "Cinematic",
      color: "#A66BEB",
      icon: "bi-stars",
      image: "/images/genre_fantasy_1793613386897.jpg",
    },
  ];

  // Canvas particle physics animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes configuration
    const colors = ["#09C5D6", "#FF2990", "#A66BEB", "#FFB52E"];
    const particleCount = Math.min(Math.floor(width / 22), 55);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.55 + 0.25,
      });
    }

    let mouse = { x: null, y: null, maxDist: 120 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.parentElement.addEventListener("mousemove", handleMouseMove);
    canvas.parentElement.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interactive mouse connection repulsion/gentle attraction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.maxDist) {
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / mouse.maxDist) * 0.35;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 90) * 0.18;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const filteredGenres =
    activeFilter === "all"
      ? genres
      : genres.filter((g) => g.category === activeFilter);

  return (
    <section
      id="genres"
      className="section-padding position-relative overflow-hidden"
      style={{ background: "#06060a" }}
    >
      {/* Background Interactive Particle Animation Canvas */}
      <canvas
        ref={canvasRef}
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ pointerEvents: "none", zIndex: 1 }}
      />

      {/* Ambient Neon Backlights */}
      <div
        className="position-absolute top-0 end-0"
        style={{
          width: "550px",
          height: "550px",
          background: "radial-gradient(circle, rgba(9, 197, 214, 0.08) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="position-absolute bottom-0 start-0"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(255, 41, 144, 0.08) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        {/* Section Header */}
        <div className="text-center mb-4" data-aos="fade-up">
          <span className="section-tag">
            <i className="bi bi-grid-fill me-1"></i> Endless Categories
          </span>
          <h2 className="section-title">Explore Your Favourite Genres</h2>
          <p className="section-subtitle">
            From pulse-pounding thrillers to heartwarming romances, dive straight into stories that match your mood.
          </p>

          {/* Interactive Genre Filter Pills */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4" data-aos="fade-up" data-aos-delay="100">
            {[
              { id: "all", label: "All Genres", icon: "bi-grid" },
              { id: "thrills", label: "High Thrills & Suspense", icon: "bi-lightning-charge-fill" },
              { id: "emotional", label: "Romance & Drama", icon: "bi-heart-fill" },
              { id: "light", label: "Comedy & Fantasy", icon: "bi-stars" },
            ].map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className="btn btn-sm px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-2 transition-all"
                  style={{
                    background: active
                      ? "var(--gradient-brand)"
                      : "rgba(255, 255, 255, 0.04)",
                    color: active ? "#ffffff" : "#a6a6a6",
                    border: active
                      ? "1px solid transparent"
                      : "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: active ? "0 0 20px rgba(9, 197, 214, 0.45)" : "none",
                    backdropFilter: "blur(10px)",
                    fontSize: "0.84rem",
                  }}
                >
                  <i className={`bi ${tab.icon}`}></i>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Genre Grid */}
        <div className="row g-4 mt-2">
          {filteredGenres.map((genre, idx) => (
            <div
              key={genre.title}
              className="col-6 col-md-4 col-lg-3"
              data-aos="fade-up"
              data-aos-delay={80 + (idx % 4) * 80}
            >
              <div
                className="position-relative h-100 rounded-4 overflow-hidden group-genre-card"
                style={{
                  minHeight: "220px",
                  background: "#12121a",
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  boxShadow: "0 12px 28px rgba(0,0,0,0.6)",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                  e.currentTarget.style.borderColor = genre.color;
                  e.currentTarget.style.boxShadow = `0 18px 40px ${genre.color}35`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.6)";
                }}
              >
                {/* Background Poster Image */}
                <Image
                  src={genre.image}
                  alt={genre.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{
                    objectFit: "cover",
                    opacity: 0.62,
                    transition: "transform 0.6s ease, opacity 0.4s ease",
                  }}
                />

                {/* Dark Cinematic Gradient Overlay */}
                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(8,8,14,0.2) 0%, rgba(8,8,14,0.65) 50%, rgba(6,6,10,0.98) 100%)",
                  }}
                />

                {/* Card Top Pill Badge & Icon Button */}
                <div className="position-absolute top-0 start-0 w-100 p-3 d-flex align-items-center justify-content-between">
                  <span
                    className="px-2 py-1 rounded-pill fw-bold text-uppercase d-inline-flex align-items-center gap-1"
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.5px",
                      background: "rgba(0,0,0,0.65)",
                      backdropFilter: "blur(8px)",
                      color: genre.color,
                      border: `1px solid ${genre.color}55`,
                    }}
                  >
                    <i className={`bi ${genre.icon}`}></i> {genre.tag}
                  </span>

                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "34px",
                      height: "34px",
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <i className="bi bi-arrow-up-right text-white small"></i>
                  </div>
                </div>

                {/* Card Bottom Meta Content */}
                <div className="position-absolute bottom-0 start-0 w-100 p-3 p-md-3">
                  <span
                    className="badge mb-1 px-2 py-0.5 rounded text-secondary"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                    }}
                  >
                    {genre.stories}
                  </span>
                  <h4 className="fw-bold text-white mb-1" style={{ fontSize: "1.2rem", letterSpacing: "-0.2px" }}>
                    {genre.title}
                  </h4>
                  <p className="text-secondary small mb-0 text-truncate" style={{ fontSize: "0.8rem" }}>
                    {genre.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

