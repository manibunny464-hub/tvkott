"use client";

import { useState } from "react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is TVK OTT?",
      a: "TVK OTT is India's premier short-story OTT and vertical entertainment streaming platform. We deliver premium, cinematic short-format series and episodic dramas designed specifically for smartphones with fast storytelling and zero fluff.",
    },
    {
      q: "How can I watch stories on TVK OTT?",
      a: "You can download the TVK OTT app for Android on Google Play or iOS on Apple App Store. Simply sign in using your mobile number and start streaming your favorite genres instantly.",
    },
    {
      q: "Which languages are available?",
      a: "TVK OTT is available in 8+ Indian regional and global languages including Hindi, Telugu, Tamil, Malayalam, Kannada, Bengali, Marathi, and English, with authentic native dubbing and localized subtitles.",
    },
    {
      q: "Is TVK OTT free to use?",
      a: "Yes! TVK OTT offers a rich selection of free episodes and teasers for all users. You can upgrade to TVK OTT VIP Premium to unlock full series, exclusive originals, ad-free watching, and offline downloads.",
    },
    {
      q: "What are the benefits of TVK OTT Premium?",
      a: "TVK OTT Premium unlocks 100% ad-free streaming, all exclusive original series, binge-mode for all episodes without wait times, ultra HD video playback, and offline downloads for uninterrupted traveling entertainment.",
    },
    {
      q: "How can I subscribe?",
      a: "Inside the app or directly through our website, navigate to the Premium section. Choose between 1-Month, 3-Month, or our Best Value 12-Month plan and checkout securely using UPI, Credit/Debit cards, or Net Banking.",
    },
    {
      q: "Can I save my favourite stories?",
      a: "Yes! Tap the Bookmark icon on any story card or video player to add it to your 'My List'. You can quickly resume watching anytime across your connected mobile devices.",
    },
    {
      q: "How can I contact support?",
      a: "Open Help & Support in your profile for contact options.",
    },
  ];

  // Floating background particle icons
  const particleIcons = [
    { icon: "bi-question-lg", top: "12%", left: "6%", size: "2.4rem", color: "#FF2990", anim: "floatParticle1 8s ease-in-out infinite" },
    { icon: "bi-film", top: "28%", left: "10%", size: "1.8rem", color: "#09C5D6", anim: "floatParticle2 10s ease-in-out 1s infinite" },
    { icon: "bi-chat-dots-fill", top: "55%", left: "4%", size: "2rem", color: "#A66BEB", anim: "floatParticle3 7s ease-in-out 0.5s infinite" },
    { icon: "bi-play-btn-fill", top: "78%", left: "8%", size: "2.2rem", color: "#FFB52E", anim: "floatParticle1 9s ease-in-out 2s infinite" },
    { icon: "bi-patch-question-fill", top: "15%", right: "6%", size: "2.5rem", color: "#09C5D6", anim: "floatParticle2 9s ease-in-out infinite" },
    { icon: "bi-stars", top: "35%", right: "10%", size: "2rem", color: "#FF2990", anim: "floatParticle1 7s ease-in-out 1.5s infinite" },
    { icon: "bi-tv", top: "62%", right: "5%", size: "2.2rem", color: "#FFB52E", anim: "floatParticle3 8s ease-in-out 2s infinite" },
    { icon: "bi-lightning-charge-fill", top: "82%", right: "8%", size: "2rem", color: "#09C5D6", anim: "floatParticle2 11s ease-in-out infinite" },
    { icon: "bi-headphones", top: "45%", left: "15%", size: "1.6rem", color: "#FF2990", anim: "floatParticle1 12s ease-in-out 3s infinite" },
    { icon: "bi-camera-reels-fill", top: "50%", right: "14%", size: "1.7rem", color: "#A66BEB", anim: "floatParticle3 9s ease-in-out 1s infinite" },
  ];

  return (
    <section id="faq" className="section-padding position-relative overflow-hidden" style={{ background: "#050508" }}>
      {/* Background ambient neon glows */}
      <div
        className="position-absolute"
        style={{
          top: "20%",
          left: "5%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(9, 197, 214, 0.1) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        className="position-absolute"
        style={{
          bottom: "15%",
          right: "5%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(255, 41, 144, 0.1) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />

      {/* Floating Animated Icon Particles */}
      {particleIcons.map((p, idx) => (
        <div
          key={idx}
          className="particle-icon d-none d-md-block"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            color: p.color,
            fontSize: p.size,
            animation: p.anim,
            filter: `drop-shadow(0 0 12px ${p.color}66)`,
          }}
        >
          <i className={`bi ${p.icon}`}></i>
        </div>
      ))}

      <div className="container position-relative" style={{ maxWidth: "860px", zIndex: 3 }}>
        {/* Header */}
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="section-tag">
            <i className="bi bi-question-circle-fill me-1"></i> Got Questions?
          </span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about TVK OTT, streaming options, subscriptions, and supported devices.
          </p>
        </div>

        {/* Custom Modern Accordion */}
        <div className="d-flex flex-column gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="rounded-4 overflow-hidden transition-all"
                data-aos="fade-up"
                data-aos-delay={60 + index * 60}
                style={{
                  background: isOpen ? "#161622" : "#111118",
                  border: isOpen ? "1px solid #FF2990" : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: isOpen ? "0 4px 20px rgba(255, 41, 144, 0.18)" : "none",
                  transition: "all 0.25s ease",
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-100 p-4 border-0 bg-transparent text-start d-flex align-items-center justify-content-between gap-3"
                  style={{ cursor: "pointer" }}
                >
                  <span
                    className="fw-bold"
                    style={{
                      fontSize: "1.05rem",
                      color: isOpen ? "#ffffff" : "#e0e0e0",
                    }}
                  >
                    {faq.q}
                  </span>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{
                      width: "32px",
                      height: "32px",
                      background: isOpen ? "rgba(255,41,144,0.2)" : "rgba(255,255,255,0.06)",
                      color: isOpen ? "#FF2990" : "#ffffff",
                      transition: "transform 0.3s ease",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <i className="bi bi-chevron-down small"></i>
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 text-secondary" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                    <div className="border-top border-secondary border-opacity-25 pt-3">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
