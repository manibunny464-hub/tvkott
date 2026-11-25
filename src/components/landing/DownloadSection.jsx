"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function DownloadSection({ playStoreUrl }) {
  const canvasRef = useRef(null);

  // Background floating star dust particles
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
    const count = Math.min(Math.floor(width / 24), 45);
    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.45 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
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

  return (
    <section id="download" className="section-padding position-relative overflow-hidden" style={{ background: "#06060c" }}>
      {/* Background Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ pointerEvents: "none", zIndex: 1 }}
      />

      {/* Ambient Radial Lights */}
      <div
        className="position-absolute top-50 start-50 translate-middle"
        style={{
          width: "950px",
          height: "650px",
          background: "radial-gradient(ellipse at center, rgba(255, 41, 144, 0.16) 0%, rgba(9, 197, 214, 0.14) 45%, transparent 75%)",
          filter: "blur(110px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div
          className="p-4 p-md-5 rounded-4 overflow-hidden position-relative"
          style={{
            background: "linear-gradient(135deg, rgba(20, 20, 28, 0.9) 0%, rgba(10, 10, 16, 0.96) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            boxShadow: "0 25px 65px rgba(0,0,0,0.85), 0 0 50px rgba(9, 197, 214, 0.18)",
            borderRadius: "24px",
          }}
        >
          <div className="row align-items-center gy-5" data-aos="fade-up">
            {/* Left Content */}
            <div className="col-lg-7 text-center text-lg-start" data-aos="fade-right" data-aos-delay="200">
              <span className="section-tag mb-3 d-inline-flex">
                <i className="bi bi-cloud-arrow-down-fill text-cyan me-1"></i> Instant Experience
              </span>

              <h2 className="display-5 fw-extrabold text-white mb-3" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
                Your Entertainment. <br />
                Your Language. <span className="text-gradient-brand">Your TVK OTT.</span>
              </h2>

              <p className="text-secondary lead mb-4" style={{ maxWidth: "540px", fontSize: "1.05rem", lineHeight: 1.6 }}>
                Download TVK OTT today and step into a world of vertical short-story cinema. Binge thrilling dramas, romantic cliffhangers, and mysteries in 8+ languages.
              </p>

              {/* Stats highlights */}
              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-4 mb-4 pb-2">
                <div>
                  <div className="fw-bold text-white fs-4" style={{ color: "#09C5D6" }}>500K+</div>
                  <div className="text-secondary small" style={{ fontSize: "0.75rem" }}>Active Streamers</div>
                </div>
                <div style={{ width: "1px", height: "35px", background: "rgba(255,255,255,0.12)" }}></div>
                <div>
                  <div className="fw-bold text-white fs-4" style={{ color: "#FF2990" }}>4.8 ★</div>
                  <div className="text-secondary small" style={{ fontSize: "0.75rem" }}>App Store Rating</div>
                </div>
                <div style={{ width: "1px", height: "35px", background: "rgba(255,255,255,0.12)" }}></div>
                <div>
                  <div className="fw-bold text-white fs-4" style={{ color: "#FFB52E" }}>8+</div>
                  <div className="text-secondary small" style={{ fontSize: "0.75rem" }}>Regional Languages</div>
                </div>
              </div>

              {/* App Download Buttons */}
              <div
                className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-3 mb-4"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                {/* Google Play */}
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn text-white text-decoration-none py-3 px-4 d-inline-flex align-items-center gap-3 transition-all"
                  style={{
                    background: "var(--gradient-brand)",
                    borderRadius: "14px",
                    boxShadow: "0 8px 25px rgba(9, 197, 214, 0.4)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(9, 197, 214, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(9, 197, 214, 0.4)";
                  }}
                >
                  <i className="bi bi-google-play fs-3"></i>
                  <div className="text-start" style={{ lineHeight: 1.15 }}>
                    <div style={{ fontSize: "0.72rem", opacity: 0.9 }}>GET IT ON</div>
                    <div className="fw-bold" style={{ fontSize: "1.05rem" }}>Google Play</div>
                  </div>
                </a>

                {/* Apple App Store */}
                <a
                  href="https://apple.com/app-store"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-light text-decoration-none py-3 px-4 d-inline-flex align-items-center gap-3 transition-all"
                  style={{
                    borderRadius: "14px",
                    borderColor: "rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(8px)",
                    transition: "transform 0.3s ease, background 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                >
                  <i className="bi bi-apple fs-3 text-white"></i>
                  <div className="text-start" style={{ lineHeight: 1.15 }}>
                    <div style={{ fontSize: "0.72rem", opacity: 0.8 }}>DOWNLOAD ON THE</div>
                    <div className="fw-bold text-white" style={{ fontSize: "1.05rem" }}>App Store</div>
                  </div>
                </a>
              </div>

              {/* QR Code and Quick Scan */}
              <div
                className="d-flex align-items-center justify-content-center justify-content-lg-start gap-3 pt-2"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <div
                  className="p-2 rounded-3 d-flex align-items-center justify-content-center shadow"
                  style={{
                    width: "68px",
                    height: "68px",
                    background: "#ffffff",
                    border: "2px solid #09C5D6",
                    borderRadius: "12px",
                  }}
                >
                  <i className="bi bi-qr-code text-dark fs-2"></i>
                </div>
                <div className="text-start">
                  <div className="fw-bold text-white small">Scan to Install Directly</div>
                  <div className="text-secondary small" style={{ fontSize: "0.78rem" }}>
                    Compatible with iOS 14.0+ and Android 8.0+ smartphones.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Mockup with sleek phone frame */}
            <div className="col-lg-5 text-center" data-aos="zoom-in" data-aos-delay="300">
              <div
                className="position-relative mx-auto shadow-lg"
                style={{
                  width: "240px",
                  height: "490px",
                  borderRadius: "20px",
                  border: "2.5px solid rgba(255, 255, 255, 0.22)",
                  outline: "1px solid rgba(0, 0, 0, 0.9)",
                  overflow: "hidden",
                  background: "#08080c",
                  boxShadow: "0 30px 70px rgba(0,0,0,0.95), 0 0 40px rgba(255, 41, 144, 0.35)",
                  transition: "transform 0.4s ease",
                }}
              >
                {/* Thin Speaker Grill Line */}
                <div
                  className="position-absolute top-0 start-50 translate-middle-x"
                  style={{
                    top: "4px",
                    width: "36px",
                    height: "3px",
                    background: "#22222a",
                    borderRadius: "2px",
                    zIndex: 10,
                  }}
                />

                {/* Screen Image with contain fit for full logo visibility */}
                <div className="position-relative w-100 h-100">
                  <Image
                    src="/images/app-screen (2).jpeg"
                    alt="TVK OTT Welcome Screen"
                    fill
                    sizes="240px"
                    style={{ objectFit: "contain", objectPosition: "top center" }}
                    priority
                  />
                </div>

                {/* Subtle Glass Glare Reflection */}
                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 40%)",
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


