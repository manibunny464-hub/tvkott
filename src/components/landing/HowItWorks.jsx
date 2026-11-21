"use client";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Discover Stories",
      desc: "Explore a catalog of exclusive short vertical series and quick episodes across multiple genres.",
      icon: "bi-compass",
      color: "#09C5D6",
    },
    {
      num: "02",
      title: "Choose Your Language",
      desc: "Immerse yourself in authentic regional storytelling in Hindi, Telugu, Tamil, Malayalam & more.",
      icon: "bi-translate",
      color: "#FF2990",
    },
    {
      num: "03",
      title: "Watch Anywhere",
      desc: "Stream on your commute, during lunch breaks, or late at night in high-definition vertical format.",
      icon: "bi-phone",
      color: "#FFB52E",
    },
    {
      num: "04",
      title: "Save Your Favourites",
      desc: "Create your personal watchlist and pick up right where you left off across all your devices.",
      icon: "bi-bookmark-heart",
      color: "#A66BEB",
    },
  ];

  return (
    <section id="about" className="section-padding position-relative" style={{ background: "#0a0a0f" }}>
      <div className="container position-relative">
        {/* Section Header */}
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="section-tag">
            <i className="bi bi-lightning-charge-fill me-1"></i> Simple & Seamless
          </span>
          <h2 className="section-title">Your Next Favourite Story Is Just a Tap Away</h2>
          <p className="section-subtitle">
            Chirpii is engineered for modern vertical streaming — quick episodes, rich emotions, zero hassle.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="row g-4">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-up"
              data-aos-delay={100 + idx * 120}
            >
              <div
                className="h-100 p-4 rounded-4 position-relative"
                style={{
                  background: "#121218",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.35s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.borderColor = step.color;
                  e.currentTarget.style.boxShadow = `0 12px 30px ${step.color}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Step Number Top Pill */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: "52px",
                      height: "52px",
                      background: `rgba(255,255,255,0.04)`,
                      border: `1px solid ${step.color}44`,
                      color: step.color,
                      fontSize: "1.5rem",
                      boxShadow: `0 0 20px ${step.color}22`,
                    }}
                  >
                    <i className={`bi ${step.icon}`}></i>
                  </div>
                  <span
                    className="fw-black text-secondary opacity-50"
                    style={{ fontSize: "1.8rem", fontWeight: 900, fontFamily: "monospace" }}
                  >
                    {step.num}
                  </span>
                </div>

                <h4 className="fw-bold text-white mb-2" style={{ fontSize: "1.2rem" }}>
                  {step.title}
                </h4>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
