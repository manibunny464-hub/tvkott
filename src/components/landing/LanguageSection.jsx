"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function LanguageSection() {
  const canvasRef = useRef(null);

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
    const count = Math.min(Math.floor(width / 24), 50);
    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let mouse = { x: null, y: null, maxDist: 110 };

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
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 85) * 0.16;
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
  const languages = [
    {
      name: "Hindi",
      nativeName: "हिन्दी",
      region: "North & Pan India",
      image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80", // Taj Mahal
      accent: "#FF2990",
    },
    {
      name: "Telugu",
      nativeName: "తెలుగు",
      region: "Andhra & Telangana",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80", // South Temple
      accent: "#09C5D6",
    },
    {
      name: "Tamil",
      nativeName: "தமிழ்",
      region: "Tamil Nadu",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80", // Gopuram
      accent: "#FFB52E",
    },
    {
      name: "Malayalam",
      nativeName: "മലയാളം",
      region: "Kerala Backwaters",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80", // Houseboat
      accent: "#09C5D6",
    },
    {
      name: "English",
      nativeName: "English",
      region: "Global & Urban India",
      image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80", // NYC Skyline
      accent: "#09C5D6",
      isSelected: true,
    },
    {
      name: "Kannada",
      nativeName: "ಕನ್ನಡ",
      region: "Karnataka",
      image: "/images/lang_kannada.jpg", // Karnataka Heritage
      accent: "#FF2990",
    },
    {
      name: "Bengali",
      nativeName: "বাংলা",
      region: "West Bengal",
      image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80", // Howrah Bridge
      accent: "#A66BEB",
    },
    {
      name: "Marathi",
      nativeName: "मराठी",
      region: "Maharashtra",
      image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80", // Gateway of India
      accent: "#FFB52E",
    },
  ];

  return (
    <section id="languages" className="section-padding position-relative overflow-hidden" style={{ background: "#050508" }}>
      {/* Background Interactive Particle Animation Canvas */}
      <canvas
        ref={canvasRef}
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ pointerEvents: "none", zIndex: 1 }}
      />

      {/* Decorative ambient neon glows */}
      <div
        className="position-absolute top-0 start-0"
        style={{
          width: "480px",
          height: "480px",
          background: "radial-gradient(circle, rgba(255, 41, 144, 0.08) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="position-absolute bottom-0 end-0"
        style={{
          width: "480px",
          height: "480px",
          background: "radial-gradient(circle, rgba(9, 197, 214, 0.08) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        {/* Section Header */}
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="section-tag">
            <i className="bi bi-globe2 me-1"></i> Regional Vibrance
          </span>
          <h2 className="section-title">Entertainment in Your Language</h2>
          <p className="section-subtitle">
            Stories hit differently when they speak your mother tongue. Switch freely between 8+ Indian regional languages anytime.
          </p>
        </div>

        {/* Language Grid matching App Screen 4 design */}
        <div className="row g-4">
          {languages.map((lang, idx) => (
            <div
              key={lang.name}
              className="col-6 col-md-4 col-lg-3"
              data-aos="zoom-in"
              data-aos-delay={100 + (idx % 4) * 100}
            >
              <div
                className="position-relative rounded-4 overflow-hidden shadow-sm"
                style={{
                  height: "175px",
                  border: lang.isSelected ? "2px solid #09C5D6" : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: lang.isSelected ? "0 0 20px rgba(9, 197, 214, 0.4)" : "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.borderColor = "#FF2990";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = lang.isSelected ? "#09C5D6" : "rgba(255, 255, 255, 0.1)";
                }}
              >
                {/* Background Regional Image */}
                <Image
                  src={lang.image}
                  alt={lang.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
                />

                {/* Dark Gradient Overlay */}
                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(10,10,15,0.92) 100%)",
                  }}
                />

                {/* Selected Check Badge if true */}
                {lang.isSelected && (
                  <div
                    className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "24px",
                      height: "24px",
                      background: "#09C5D6",
                      color: "#000",
                      fontSize: "0.8rem",
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </div>
                )}

                {/* Text Content */}
                <div className="position-absolute bottom-0 start-0 w-100 p-3">
                  <div className="fw-bold text-white mb-0" style={{ fontSize: "1.15rem", lineHeight: 1.2 }}>
                    {lang.nativeName}
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text-secondary small fw-medium">{lang.name}</span>
                    <span className="text-secondary small opacity-75" style={{ fontSize: "0.72rem" }}>
                      {lang.region}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Language Switch Helper */}
        <div className="mt-4 text-center" data-aos="fade-up" data-aos-delay="200">
          <p className="text-secondary small mb-0 d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-dark border border-secondary border-opacity-25">
            <i className="bi bi-shield-check text-cyan"></i>
            <span>Your language preference can be switched at any time within your profile.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
