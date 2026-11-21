"use client";

import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";

export default function FeaturedStories() {
  const starsCanvasRef = useRef(null);

  // Slow falling twinkling stars animation
  useEffect(() => {
    const canvas = starsCanvasRef.current;
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

    // Glowing falling stars
    const starCount = Math.min(Math.floor(width / 20), 65);
    const stars = [];
    const starColors = ["#ffffff", "#09C5D6", "#FFB52E", "#FF2990", "#A66BEB", "#e0f2fe"];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 1,
        baseAlpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        speedY: Math.random() * 0.55 + 0.25, // slow falling effect
        driftX: (Math.random() - 0.5) * 0.2, // gentle horizontal drift
        color: starColors[Math.floor(Math.random() * starColors.length)],
        isCross: Math.random() > 0.45, // 4-point star sparkle shape
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.01,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Twinkle calculation
        s.twinklePhase += s.twinkleSpeed;
        const currentAlpha = s.baseAlpha + Math.sin(s.twinklePhase) * 0.25;
        const alpha = Math.max(0.1, Math.min(1, currentAlpha));

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        s.rotation += s.rotSpeed;

        ctx.fillStyle = s.color;
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = s.radius * 4;
        ctx.shadowColor = s.color;

        if (s.isCross) {
          // Draw 4-point star sparkle
          const size = s.radius * 2.2;
          ctx.beginPath();
          ctx.moveTo(-size, 0);
          ctx.lineTo(size, 0);
          ctx.moveTo(0, -size);
          ctx.lineTo(0, size);
          ctx.lineWidth = 1;
          ctx.stroke();

          // Core dot
          ctx.beginPath();
          ctx.arc(0, 0, s.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Soft circular glowing star
          ctx.beginPath();
          ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Slow falling movement
        s.y += s.speedY;
        s.x += s.driftX + Math.sin(s.twinklePhase * 0.5) * 0.15;

        // Reset star to top when it drifts off bottom
        if (s.y > height + 10) {
          s.y = -10;
          s.x = Math.random() * width;
        }
        if (s.x < -10) s.x = width + 10;
        if (s.x > width + 10) s.x = -10;
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

  const stories = [
    {
      id: 1,
      title: "Off Campus",
      genre: "Romance / Youth",
      episodes: "18 Episodes • Complete",
      duration: "4 mins/ep",
      badge: "Trending #1",
      badgeColor: "#FF2990",
      image: "/images/trend_off_campus_1793613800914.jpg",
    },
    {
      id: 2,
      title: "The Ninth Minute",
      genre: "Sci-Fi / Mystery",
      episodes: "12 Episodes",
      duration: "3 mins/ep",
      badge: "Chirpii Original",
      badgeColor: "#09C5D6",
      image: "/images/trend_ninth_minute_1793613766157.jpg",
    },
    {
      id: 3,
      title: "Locke & Key Origins",
      genre: "Thriller / Fantasy",
      episodes: "16 Episodes",
      duration: "5 mins/ep",
      badge: "Must Watch",
      badgeColor: "#FFB52E",
      image: "/images/trend_locke_key_1793613833596.jpg",
    },
    {
      id: 4,
      title: "Tokyo Neon Noir",
      genre: "Action / Cyberpunk",
      episodes: "14 Episodes",
      duration: "4 mins/ep",
      badge: "Top Rated",
      badgeColor: "#A66BEB",
      image: "/images/trend_tokyo_noir_1793613867887.jpg",
    },
    {
      id: 5,
      title: "Letters from Varanasi",
      genre: "Emotional Drama",
      episodes: "10 Episodes",
      duration: "3.5 mins/ep",
      badge: "Staff Pick",
      badgeColor: "#FF2990",
      image: "/images/trend_varanasi_1793613913151.jpg",
    },
    {
      id: 6,
      title: "Shadows in the Mist",
      genre: "Crime / Noir",
      episodes: "20 Episodes",
      duration: "4 mins/ep",
      badge: "New Release",
      badgeColor: "#09C5D6",
      image: "/images/genre_thriller_1793613360216.jpg",
    },
  ];

  return (
    <section id="stories" className="section-padding position-relative overflow-hidden" style={{ background: "#050508" }}>
      {/* Falling Stars Particle Animation Canvas */}
      <canvas
        ref={starsCanvasRef}
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ pointerEvents: "none", zIndex: 1 }}
      />

      {/* Ambient Neon Atmosphere */}
      <div
        className="position-absolute top-50 start-50 translate-middle"
        style={{
          width: "700px",
          height: "450px",
          background: "radial-gradient(circle, rgba(9, 197, 214, 0.05) 0%, rgba(255, 41, 144, 0.03) 50%, transparent 75%)",
          filter: "blur(100px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        {/* Header Section with Sleek Nav Arrows */}
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-5 gap-3">
          <div data-aos="fade-right">
            <span className="section-tag">
              <i className="bi bi-stars me-1 text-pink"></i> Binge-Worthy Selections
            </span>
            <h2 className="section-title mb-2">Stories That Keep You Watching</h2>
            <p className="text-secondary mb-0" style={{ maxWidth: "560px" }}>
              Discover exciting short stories, unforgettable characters, and captivating visual storytelling in compact, high-impact episodes.
            </p>
          </div>
          <div className="d-flex align-items-center gap-3" data-aos="fade-left">
            <a
              href="#app-showcase"
              className="btn btn-outline-light rounded-pill px-3 py-2 d-none d-sm-inline-flex align-items-center gap-2"
              style={{
                fontSize: "0.85rem",
                borderColor: "rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <span>View All</span>
              <i className="bi bi-arrow-right text-cyan"></i>
            </a>

            {/* Custom Sleek Nav Arrows */}
            <div className="d-flex align-items-center gap-2">
              <button
                id="featuredPrevBtn"
                className="trending-nav-btn"
                aria-label="Previous story"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                id="featuredNextBtn"
                className="trending-nav-btn"
                aria-label="Next story"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Swiper Slider */}
        <div data-aos="fade-up" data-aos-delay="200">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: "#featuredPrevBtn",
              nextEl: "#featuredNextBtn",
            }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            breakpoints={{
              576: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1200: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="pb-3 featured-stories-swiper"
          >
            {stories.map((story, index) => (
              <SwiperSlide key={story.id}>
                <div
                  className="chirpii-card h-100 position-relative group"
                  data-aos="zoom-in"
                  data-aos-delay={100 + (index % 4) * 100}
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#13131a",
                  }}
                >
                {/* Image Container with 16:9 or Vertical 4:5 Aspect */}
                <div className="position-relative w-100" style={{ paddingTop: "135%" }}>
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                    className="card-poster"
                  />

                  {/* Gradient Overlay */}
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                      background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 50%, rgba(10,10,14,0.95) 100%)",
                    }}
                  />

                  {/* Play Button Overlay (Centered) */}
                  <div
                    className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "rgba(255, 41, 144, 0.9)",
                      boxShadow: "0 0 25px rgba(255, 41, 144, 0.6)",
                      transition: "transform 0.3s ease, background 0.3s ease",
                    }}
                  >
                    <i className="bi bi-play-fill text-white fs-3 ms-1"></i>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="text-cyan small fw-semibold" style={{ fontSize: "0.78rem" }}>
                      {story.genre}
                    </span>
                    <span className="text-secondary small" style={{ fontSize: "0.75rem" }}>
                      {story.duration}
                    </span>
                  </div>
                  <h5 className="text-white fw-bold mb-1" style={{ fontSize: "1.1rem" }}>
                    {story.title}
                  </h5>
                  <p className="text-secondary small mb-0" style={{ fontSize: "0.82rem" }}>
                    {story.episodes}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
