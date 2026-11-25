"use client";

import { useState } from "react";

export default function PremiumSection() {
  const [selectedPlan, setSelectedPlan] = useState("12months");
  const [autoRenew, setAutoRenew] = useState(true);

  const plans = [
    {
      id: "1month",
      name: "1 Month",
      originalPrice: "₹99",
      price: "₹79",
      monthlyRate: "₹79 / Month",
      savings: "Save ₹20",
      isBestValue: false,
      color: "#ffffff",
    },
    {
      id: "3months",
      name: "3 Months",
      originalPrice: "₹299",
      price: "₹199",
      monthlyRate: "Just ₹67 / Month",
      savings: "Save ₹100",
      isBestValue: false,
      color: "#09C5D6",
    },
    {
      id: "12months",
      name: "12 Months",
      originalPrice: "₹999",
      price: "₹499",
      monthlyRate: "Just ₹42 / Month",
      savings: "Save ₹500",
      isBestValue: true,
      color: "#FFB52E",
    },
  ];

  const features = [
    { text: "100% Ad-Free Entertainment", icon: "bi-shield-slash" },
    { text: "Unlimited Short Series & Episodes", icon: "bi-infinity" },
    { text: "Exclusive TVK OTT Premium Originals", icon: "bi-star" },
    { text: "Download & Watch Offline", icon: "bi-download" },
    { text: "Ultra HD Vertical Streaming & Spatial Audio", icon: "bi-badge-4k" },
  ];

  return (
    <section id="premium" className="section-padding position-relative" style={{ background: "#08080d" }}>
      {/* Background neon glows */}
      <div
        className="position-absolute"
        style={{
          top: "30%",
          right: "5%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(255, 181, 46, 0.12) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        className="position-absolute"
        style={{
          bottom: "10%",
          left: "5%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(255, 41, 144, 0.12) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />

      <div className="container position-relative">
        {/* Section Header */}
        <div className="text-center mb-5" data-aos="fade-up">
          <div className="tvk-badge gold mb-3">
            <i className="bi bi-crown-fill text-gold"></i>
            <span>TVK OTT VIP PASS</span>
          </div>
          <h2 className="section-title">Unlock Unlimited Entertainment</h2>
          <p className="section-subtitle">
            Enjoy uninterrupted storytelling with TVK OTT Premium. Binge full episodes ad-free with exclusive member perks.
          </p>
        </div>

        <div className="row g-4 align-items-stretch justify-content-center">
          {/* Left Column: Premium Membership Perks */}
          <div className="col-lg-5 d-flex flex-column" data-aos="fade-right" data-aos-delay="200">
            <div
              className="p-4 p-md-5 rounded-4 h-100 d-flex flex-column justify-content-between"
              style={{
                background: "linear-gradient(145deg, #161622 0%, #0d0d14 100%)",
                border: "1px solid rgba(255, 181, 46, 0.3)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(255, 181, 46, 0.15)",
              }}
            >
              <div>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{
                      width: "56px",
                      height: "56px",
                      background: "rgba(255, 181, 46, 0.15)",
                      border: "1px solid #FFB52E",
                      color: "#FFB52E",
                      fontSize: "1.7rem",
                    }}
                  >
                    <i className="bi bi-gem"></i>
                  </div>
                  <div>
                    <h3 className="fw-bold text-white mb-0" style={{ fontSize: "1.4rem" }}>
                      Unlimit Your Entertainment
                    </h3>
                    <small className="text-secondary">VIP Member Privileges</small>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  {features.map((feat) => (
                    <div key={feat.text} className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{
                          width: "32px",
                          height: "32px",
                          background: "rgba(255, 41, 144, 0.15)",
                          color: "#FF2990",
                          fontSize: "0.95rem",
                        }}
                      >
                        <i className={`bi ${feat.icon}`}></i>
                      </div>
                      <span className="text-white-50 small fw-medium" style={{ fontSize: "0.92rem" }}>
                        {feat.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-3 mt-4" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                <div className="d-flex align-items-center gap-2 text-warning small mb-1 fw-bold">
                  <i className="bi bi-lightning-fill"></i> Instant Activation
                </div>
                <div className="text-secondary small" style={{ fontSize: "0.8rem" }}>
                  Subscribe via UPI, Credit/Debit card or Net Banking with 100% encrypted checkout.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Options (matches App Screen 10) */}
          <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
            <div className="d-flex flex-column gap-3">
              {plans.map((plan, idx) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`p-4 pricing-plan-card ${isSelected ? "selected" : "unselected"} ${
                      plan.isBestValue ? "best-value" : "standard"
                    }`}
                    data-aos="fade-up"
                    data-aos-delay={350 + idx * 100}
                    style={{
                      background: isSelected ? "#171720" : "#111117",
                      border: isSelected
                        ? plan.isBestValue
                          ? "2px solid #FFB52E"
                          : "2px solid #09C5D6"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                      boxShadow: isSelected
                        ? plan.isBestValue
                          ? "0 0 25px rgba(255, 181, 46, 0.3)"
                          : "0 0 25px rgba(9, 197, 214, 0.25)"
                        : "none",
                    }}
                  >
                    {/* Best Value Badge */}
                    {plan.isBestValue && (
                      <span
                        className="position-absolute top-0 end-0 px-3 py-1 fw-bold small"
                        style={{
                          background: "#FFB52E",
                          color: "#000000",
                          borderBottomLeftRadius: "12px",
                          borderTopRightRadius: "15px",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        BEST VALUE
                      </span>
                    )}

                    <div className="d-flex align-items-center justify-content-between">
                      {/* Left: Radio & Duration */}
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle plan-radio-circle transition-all"
                          style={{
                            width: "26px",
                            height: "26px",
                            border: `2px solid ${
                              isSelected
                                ? plan.isBestValue
                                  ? "#FFB52E"
                                  : "#09C5D6"
                                : "#555"
                            }`,
                            background: "transparent",
                            transition: "all 0.25s ease",
                          }}
                        >
                          {isSelected && (
                            <div
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                background: plan.isBestValue ? "#FFB52E" : "#09C5D6",
                              }}
                            />
                          )}
                        </div>

                        <div>
                          <h4 className="fw-bold text-white mb-1" style={{ fontSize: "1.2rem" }}>
                            {plan.name}
                          </h4>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-success bg-opacity-25 text-success small">
                              ✓ {plan.monthlyRate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Prices */}
                      <div className="text-end">
                        <div className="d-flex align-items-baseline justify-content-end gap-2">
                          <span
                            className="fw-extrabold"
                            style={{
                              fontSize: "1.6rem",
                              color: plan.isBestValue ? "#FFB52E" : "#ffffff",
                              fontWeight: 800,
                            }}
                          >
                            {plan.price}
                          </span>
                          <span className="text-decoration-line-through text-secondary small">
                            {plan.originalPrice}
                          </span>
                        </div>
                        <span className="text-success small fw-semibold" style={{ fontSize: "0.8rem" }}>
                          {plan.savings}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Auto-renew switch panel matching mobile screenshot */}
              <div
                className="p-3 rounded-4 d-flex align-items-center justify-content-between auto-renew-panel cursor-pointer"
                style={{
                  background: "#13131c",
                  border: "1px solid rgba(255, 41, 144, 0.25)",
                  cursor: "pointer",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="text-pink fs-4">
                    <i className="bi bi-arrow-repeat"></i>
                  </div>
                  <div>
                    <div className="fw-semibold text-white small">Auto-Renew Subscription</div>
                    <div className="text-secondary small" style={{ fontSize: "0.75rem" }}>
                      Renews automatically at the end of validity. Cancel anytime.
                    </div>
                  </div>
                </div>

                {/* Custom Toggle Switch */}
                <div
                  onClick={() => setAutoRenew(!autoRenew)}
                  style={{
                    width: "48px",
                    height: "26px",
                    background: autoRenew ? "#FF2990" : "#333",
                    borderRadius: "13px",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "#ffffff",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "3px",
                      left: autoRenew ? "25px" : "3px",
                      transition: "left 0.3s ease",
                    }}
                  />
                </div>
              </div>

              {/* Subscribe CTA Button */}
              <div className="mt-2">
                <a
                  href="#download"
                  className="btn-tvk-gold w-100 py-3 text-center fs-6"
                >
                  <i className="bi bi-credit-card-2-front-fill me-1"></i> Subscribe Now (Instant Access)
                </a>
                <div className="text-center text-secondary small mt-2" style={{ fontSize: "0.75rem" }}>
                  <i className="bi bi-lock-fill me-1"></i> Secure 256-Bit SSL Payment • Cancel Anytime with 1 Click
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
