"use client";

import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

export default function AppShowcase() {
  const canvasRef = useRef(null);

  // Mobile App Showcase particle physics animation
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

    const colors = ["#09C5D6", "#FF2990", "#A66BEB", "#FFB52E"];
    const count = Math.min(Math.floor(width / 22), 55);
    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        radius: Math.random() * 2.2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.25,
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

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

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

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 90) * 0.16;
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

  const appScreens = [
    {
      img: "/images/app-screen (2).jpeg",
      title: "Seamless Phone Login",
      category: "Authentication",
    },
    {
      img: "/images/app-screen (3).jpeg",
      title: "Instant OTP Verification",
      category: "Security",
    },
    {
      img: "/images/app-screen (4).jpeg",
      title: "Multi-Language Selection",
      category: "Personalization",
    },
    {
      img: "/images/app-screen (5).jpeg",
      title: "Cinematic Home Feed",
      category: "Discovery",
    },
    {
      img: "/images/app-screen (6).jpeg",
      title: "Explore by Mood & Genre",
      category: "Catalog",
    },
    {
      img: "/images/app-screen (7).jpeg",
      title: "Vertical Trailers & Teasers",
      category: "Player",
    },
    {
      img: "/images/app-screen (8).jpeg",
      title: "My List & Saved Watchlist",
      category: "Library",
    },
    {
      img: "/images/app-screen (9).jpeg",
      title: "Profile & History Management",
      category: "Settings",
    },
    {
      img: "/images/app-screen (10).jpeg",
      title: "VIP Subscription Checkout",
      category: "Membership",
    },
    {
      img: "/images/app-screen (1).jpeg",
      title: "Quick Account Actions",
      category: "Preferences",
    },
  ];

  return (
    <section id="app-showcase" className="section-padding position-relative overflow-hidden" style={{ background: "#06060a" }}>
      {/* Background Interactive Particle Animation Canvas */}
      <canvas
        ref={canvasRef}
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ pointerEvents: "none", zIndex: 1 }}
      />

      {/* Background glow circle */}
      <div
        className="position-absolute"
        style={{
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(9, 197, 214, 0.15) 0%, transparent 70%)",
          filter: "blur(100px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        {/* Section Header */}
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="section-tag">
            <i className="bi bi-phone-fill me-1 text-pink"></i> Built For Mobile
          </span>
          <h2 className="section-title">Entertainment Designed for Your Mobile</h2>
          <p className="section-subtitle">
            Take a tour through the TVK OTT mobile app experience. Engineered with ultra-smooth vertical navigation, crystal audio, and lightning-fast loading.
          </p>
        </div>

        {/* Carousel of Real Screenshots */}
        <div data-aos="fade-up" data-aos-delay="200">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={false}
            loop={true}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              420: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              992: { slidesPerView: 4, spaceBetween: 24 },
              1200: { slidesPerView: 5, spaceBetween: 24 },
            }}
            className="pb-5 pt-3"
          >
            {appScreens.map((screen, idx) => (
              <SwiperSlide key={idx}>
                <div className="text-center" data-aos="zoom-in" data-aos-delay={50 + (idx % 4) * 80}>
                  {/* Smartphone Device Frame */}
                  <div
                    className="position-relative mx-auto shadow-lg"
                    style={{
                      width: "100%",
                      maxWidth: "220px",
                      height: "440px",
                      borderRadius: "18px",
                      border: "2px solid rgba(255, 255, 255, 0.14)",
                      overflow: "hidden",
                      background: "#0a0a0f",
                      boxShadow: "0 15px 35px rgba(0,0,0,0.7), 0 0 15px rgba(255, 41, 144, 0.12)",
                      transition: "all 0.35s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.borderColor = "#FF2990";
                      e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.8), 0 0 25px rgba(255, 41, 144, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
                      e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.7), 0 0 15px rgba(255, 41, 144, 0.12)";
                    }}
                  >

                    {/* App Screenshot */}
                    <Image
                      src={screen.img}
                      alt={screen.title}
                      fill
                      sizes="220px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  {/* Caption info */}
                  <div className="mt-3">
                    <span className="text-cyan small fw-semibold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "1px" }}>
                      {screen.category}
                    </span>
                    <h6 className="text-white fw-bold mt-1 mb-0" style={{ fontSize: "0.95rem" }}>
                      {screen.title}
                    </h6>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* CTA Buttons below Showcase */}
        <div className="mt-4 text-center" data-aos="fade-up" data-aos-delay="300">
          <div className="d-inline-flex flex-wrap align-items-center justify-content-center gap-3">
            <a href="#download" className="btn-tvk-primary">
              <i className="bi bi-google-play me-1"></i> Get on Google Play
            </a>
            <a href="#download" className="btn-tvk-outline">
              <i className="bi bi-apple me-1"></i> Download on App Store
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
