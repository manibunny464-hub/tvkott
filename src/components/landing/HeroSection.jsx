"use client";

import Image from "next/image";

export default function HeroSection() {
  const bottomFeatures = [
    {
      icon: "bi-tv",
      title: "Ad-Free",
      subtitle: "Entertainment",
    },
    {
      icon: "bi-infinity",
      title: "Unlimited",
      subtitle: "Short Stories",
    },
    {
      icon: "bi-translate",
      title: "Multiple",
      subtitle: "Languages",
    },
    {
      icon: "bi-download",
      title: "Watch",
      subtitle: "Offline",
    },
  ];

  return (
    <section
      id="home"
      className="position-relative d-flex flex-column justify-content-between min-vh-100 overflow-hidden"
      style={{
        paddingTop: "105px",
        paddingBottom: "40px",
        background: "#030306",
      }}
    >
      {/* Background Poster Image (bg1.png) */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          zIndex: 1,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      >
        <Image
          src="/images/bg1.png"
          alt="Hero Background"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>

      {/* Dark gradient overlay for extreme readability and seamless color blending */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          zIndex: 2,
          background: "radial-gradient(ellipse 90% 70% at 20% 40%, rgba(3, 3, 6, 0.95) 0%, rgba(3, 3, 6, 0.75) 60%, rgba(3, 3, 6, 0.98) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Vibrant Neon Light Waves behind the Phones (Cyan & Pink Curved Glows matching reference) */}
      <div
        className="position-absolute"
        style={{
          bottom: "-50px",
          right: "-50px",
          width: "900px",
          height: "600px",
          background: "radial-gradient(ellipse at 70% 60%, rgba(255, 41, 144, 0.28) 0%, rgba(9, 197, 214, 0.22) 40%, transparent 70%)",
          filter: "blur(80px)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Curved Neon Accent Stroke (Cyan to Pink wave line at bottom right) */}
      <svg
        className="position-absolute"
        style={{
          bottom: 0,
          right: 0,
          width: "100%",
          maxWidth: "1000px",
          height: "350px",
          zIndex: 2,
          pointerEvents: "none",
          opacity: 0.85,
        }}
        viewBox="0 0 1000 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="neonWave" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#09C5D6" stopOpacity="0" />
            <stop offset="35%" stopColor="#09C5D6" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#FF2990" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#A66BEB" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 50 340 C 350 310, 450 180, 750 140 C 880 120, 960 80, 1000 50"
          stroke="url(#neonWave)"
          strokeWidth="6"
          fill="none"
          filter="url(#glow)"
        />
        <path
          d="M 200 350 C 450 330, 550 240, 850 170 C 950 145, 990 120, 1000 110"
          stroke="url(#neonWave)"
          strokeWidth="3"
          fill="none"
          opacity="0.6"
        />
      </svg>

      {/* Main Content Area */}
      <div className="container position-relative my-auto" style={{ zIndex: 5 }}>
        <div className="row align-items-center gy-5">
          {/* Left Column Content */}
          <div className="col-lg-6 col-xl-7 text-center text-lg-start">
            {/* Pill Badge matching reference exactly */}
            <div
              className="d-inline-flex align-items-center gap-2 mb-3 px-3 py-1"
              data-aos="fade-down"
              data-aos-delay="100"
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(255, 41, 144, 0.6)",
                background: "rgba(255, 41, 144, 0.08)",
                boxShadow: "0 0 15px rgba(255, 41, 144, 0.25)",
              }}
            >
              <i className="bi bi-play-fill text-pink" style={{ fontSize: "0.95rem" }}></i>
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "0.78rem",
                  letterSpacing: "1.8px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                ORIGINAL SHORT STORIES
              </span>
            </div>

            {/* Headline matching image reference */}
            <h1
              className="display-4 text-white mb-3"
              data-aos="fade-up"
              data-aos-delay="200"
              style={{
                lineHeight: 1.12,
                fontWeight: 800,
                fontSize: "clamp(2.3rem, 4.4vw, 3.8rem)",
                letterSpacing: "-0.5px",
              }}
            >
              Every <span style={{ color: "#09C5D6" }}>Story</span> Has a World. <br />
              Every Moment Has an <span style={{ color: "#FF2990" }}>Emotion.</span>
            </h1>

            {/* Description matching exact text */}
            <p
              className="text-secondary mb-4 mx-auto mx-lg-0"
              data-aos="fade-up"
              data-aos-delay="300"
              style={{
                maxWidth: "520px",
                fontSize: "1.05rem",
                lineHeight: 1.6,
                color: "#b0b0b8",
              }}
            >
              Chirpii brings you a world of exciting short stories, gripping characters and powerful emotions — all in your language.
            </p>

            {/* Buttons Row matching exact colors, pills and icons */}
            <div
              className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-3 mb-4"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              {/* Primary: Explore Stories (Cyan to Pink Gradient) */}
              <a
                href="#stories"
                className="text-decoration-none d-inline-flex align-items-center gap-2 text-white fw-bold px-4 py-3"
                style={{
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #09C5D6 0%, #FF2990 100%)",
                  boxShadow: "0 4px 20px rgba(9, 197, 214, 0.45)",
                  fontSize: "0.98rem",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 25px rgba(255, 41, 144, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(9, 197, 214, 0.45)";
                }}
              >
                <i className="bi bi-play-fill fs-5"></i>
                <span>Explore Stories</span>
                <i className="bi bi-arrow-right fs-6"></i>
              </a>

              {/* Secondary: Download App (Dark Pill with White Border) */}
              <a
                href="#download"
                className="text-decoration-none d-inline-flex align-items-center gap-2 text-white fw-semibold px-4 py-3"
                style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(255, 255, 255, 0.35)",
                  background: "rgba(10, 10, 16, 0.6)",
                  backdropFilter: "blur(8px)",
                  fontSize: "0.98rem",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#09C5D6";
                  e.currentTarget.style.color = "#09C5D6";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <i className="bi bi-download"></i>
                <span>Download App</span>
              </a>
            </div>

            {/* Store Download Badges with precise black pill borders */}
            <div
              className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-3 mb-4"
              data-aos="fade-up"
              data-aos-delay="450"
            >
              {/* Google Play */}
              <a
                href="#download"
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-white text-decoration-none"
                style={{
                  background: "#050508",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                }}
              >
                <i className="bi bi-google-play text-cyan fs-5"></i>
                <div className="text-start" style={{ lineHeight: 1.1 }}>
                  <div className="text-secondary" style={{ fontSize: "0.65rem" }}>GET IT ON</div>
                  <div className="fw-semibold text-white" style={{ fontSize: "0.85rem" }}>Google Play</div>
                </div>
              </a>

              {/* App Store */}
              <a
                href="#download"
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-white text-decoration-none"
                style={{
                  background: "#050508",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                }}
              >
                <i className="bi bi-apple text-white fs-5"></i>
                <div className="text-start" style={{ lineHeight: 1.1 }}>
                  <div className="text-secondary" style={{ fontSize: "0.65rem" }}>Download on the</div>
                  <div className="fw-semibold text-white" style={{ fontSize: "0.85rem" }}>App Store</div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Exact Dual Phone Mockups from Reference */}
          <div className="col-lg-6 col-xl-5 position-relative">
            <div
              className="position-relative mx-auto"
              style={{
                width: "100%",
                maxWidth: "470px",
                height: "530px",
              }}
            >
              {/* Left Smartphone Mockup (Chirpii Home Screen with sleek titanium frame) */}
              <div
                className="position-absolute shadow-lg"
                data-aos="fade-up"
                data-aos-delay="250"
                style={{
                  top: "10px",
                  left: "10px",
                  width: "240px",
                  height: "505px",
                  borderRadius: "20px",
                  border: "2.5px solid rgba(255, 255, 255, 0.22)",
                  outline: "1px solid rgba(0, 0, 0, 0.9)",
                  overflow: "hidden",
                  background: "#000000",
                  zIndex: 2,
                  boxShadow: "0 25px 60px rgba(0,0,0,0.95), 0 0 30px rgba(255, 41, 144, 0.35)",
                  transition: "transform 0.4s ease, box-shadow 0.4s ease",
                }}
              >
                {/* Thin Speaker Grill Line */}
                <div
                  className="position-absolute top-0 start-50 translate-middle-x"
                  style={{
                    top: "3px",
                    width: "38px",
                    height: "3px",
                    background: "#22222a",
                    borderRadius: "2px",
                    zIndex: 10,
                  }}
                />

                {/* Screen Image with proper top margin & fit to avoid cutting logo */}
                <div className="position-relative w-100 h-100" style={{ paddingTop: "2px" }}>
                  <Image
                    src="/images/app-screen (6).jpeg"
                    alt="Chirpii Screen"
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
                    background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 40%)",
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                />
              </div>

              {/* Right Angled Smartphone Mockup (Tilted Right with Trending / Off Campus) */}
              <div
                className="position-absolute shadow-lg"
                data-aos="fade-up"
                data-aos-delay="400"
                style={{
                  top: "40px",
                  right: "40px",
                  width: "238px",
                  height: "500px",
                  borderRadius: "20px",
                  border: "2.5px solid rgba(255, 255, 255, 0.25)",
                  outline: "1px solid rgba(0, 0, 0, 0.9)",
                  overflow: "hidden",
                  background: "#000000",
                  transform: "rotate(15.5deg)",
                  zIndex: 3,
                  boxShadow: "0 30px 70px rgba(0,0,0,0.95), 0 0 35px rgba(9, 197, 214, 0.35)",
                  transition: "transform 0.4s ease, box-shadow 0.4s ease",
                }}
              >
                {/* Thin Speaker Grill Line */}
                <div
                  className="position-absolute top-0 start-50 translate-middle-x"
                  style={{
                    top: "3px",
                    width: "38px",
                    height: "3px",
                    background: "#22222a",
                    borderRadius: "2px",
                    zIndex: 10,
                  }}
                />

                {/* Screen Image with proper top margin & fit to avoid cutting logo */}
                <div className="position-relative w-100 h-100" style={{ paddingTop: "2px" }}>
                  <Image
                    src="/images/app-screen (5).jpeg"
                    alt="Chirpii Trending Screen"
                    fill
                    sizes="238px"
                    style={{ objectFit: "contain", objectPosition: "top center" }}
                    priority
                  />
                </div>

                {/* Subtle Glass Glare Reflection */}
                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 45%)",
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features Strip with exact 4 icons & pink line matching reference */}
      <div
        className="container position-relative pt-4 mt-3"
        style={{
          zIndex: 5,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        data-aos="fade-up"
        data-aos-delay="500"
      >
        <div className="row g-3 text-start align-items-center justify-content-between">
          {bottomFeatures.map((feat, idx) => (
            <div key={idx} className="col-6 col-md-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center text-pink fs-3 flex-shrink-0"
                  style={{
                    width: "44px",
                    height: "44px",
                  }}
                >
                  <i className={`bi ${feat.icon}`}></i>
                </div>
                <div style={{ lineHeight: 1.25 }}>
                  <div className="text-white fw-bold" style={{ fontSize: "0.95rem" }}>
                    {feat.title}
                  </div>
                  <div className="text-secondary small" style={{ fontSize: "0.8rem", color: "#9595a0" }}>
                    {feat.subtitle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
