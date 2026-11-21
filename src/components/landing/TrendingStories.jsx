"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";

export default function TrendingStories() {
  const trendingList = [
    {
      rank: 1,
      title: "The Ninth Minute",
      genre: "Mystery / Thriller",
      episodes: "12 Episodes",
      views: "1.4M Streams",
      poster: "/images/trend_ninth_minute_1793613766157.jpg",
      rankColor: "#09C5D6",
      featuredBadge: "Trending #1",
    },
    {
      rank: 2,
      title: "Off Campus",
      genre: "Romance Drama",
      episodes: "18 Episodes",
      views: "2.1M Streams",
      poster: "/images/trend_off_campus_1793613800914.jpg",
      rankColor: "#FF2990",
      featuredBadge: "Viewer Favorite",
    },
    {
      rank: 3,
      title: "Locke & Key Origins",
      genre: "Thriller / Fantasy",
      episodes: "16 Episodes",
      views: "980K Streams",
      poster: "/images/trend_locke_key_1793613833596.jpg",
      rankColor: "#FFB52E",
      featuredBadge: "Trending #3",
    },
    {
      rank: 4,
      title: "Tokyo Neon Noir",
      genre: "Action / Sci-Fi",
      episodes: "14 Episodes",
      views: "820K Streams",
      poster: "/images/trend_tokyo_noir_1793613867887.jpg",
      rankColor: "#A66BEB",
      featuredBadge: "Rising Fast",
    },
    {
      rank: 5,
      title: "Letters from Varanasi",
      genre: "Emotional Drama",
      episodes: "10 Episodes",
      views: "750K Streams",
      poster: "/images/trend_varanasi_1793613913151.jpg",
      rankColor: "#09C5D6",
      featuredBadge: "Top Rated",
    },
  ];

  return (
    <section id="trending" className="section-padding position-relative" style={{ background: "#050509" }}>
      {/* Decorative gradient glow */}
      <div
        className="position-absolute"
        style={{
          top: "40%",
          left: "-10%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(255, 41, 144, 0.12) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />

      <div className="container position-relative">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-5 gap-3">
          <div data-aos="fade-right">
            <span className="section-tag">
              <i className="bi bi-fire me-1 text-danger"></i> Chartbusters
            </span>
            <h2 className="section-title mb-2">Trending on Chirpii</h2>
            <p className="text-secondary mb-0" style={{ maxWidth: "580px" }}>
              The most loved stories captivating thousands of viewers right now. Witness gripping cliffhangers and viral sensations.
            </p>
          </div>
          <div className="d-flex align-items-center gap-3" data-aos="fade-left">
            <span className="badge px-3 py-2 rounded-pill bg-dark border border-secondary text-light">
              <i className="bi bi-clock-history me-1 text-cyan"></i> Updated Hourly
            </span>
            {/* Sleek Custom Arrows Header Controls */}
            <div className="d-flex align-items-center gap-2">
              <button
                id="trendingPrevBtn"
                className="trending-nav-btn trending-nav-prev"
                aria-label="Previous slide"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                id="trendingNextBtn"
                className="trending-nav-btn trending-nav-next"
                aria-label="Next slide"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div data-aos="fade-up" data-aos-delay="200">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: "#trendingPrevBtn",
              nextEl: "#trendingNextBtn",
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              576: { slidesPerView: 2, spaceBetween: 24 },
              992: { slidesPerView: 3, spaceBetween: 28 },
              1400: { slidesPerView: 3, spaceBetween: 32 },
            }}
            className="pb-3 trending-swiper"
          >
            {trendingList.map((item, idx) => (
              <SwiperSlide key={item.rank}>
                <div
                  className="position-relative d-flex align-items-center"
                  data-aos="zoom-in"
                  data-aos-delay={100 + idx * 100}
                style={{
                  height: "380px",
                  borderRadius: "22px",
                  paddingLeft: "40px",
                }}
              >
                {/* Large Stylized Number in Background matching Mobile screen 5 */}
                <div
                  className="position-absolute top-50 translate-middle-y"
                  style={{
                    left: "0px",
                    zIndex: 2,
                    fontSize: "clamp(6.5rem, 10vw, 8.5rem)",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: item.rankColor,
                    textShadow: `0 0 30px ${item.rankColor}88`,
                    userSelect: "none",
                  }}
                >
                  {item.rank}
                </div>

                {/* Poster Card */}
                <div
                  className="w-100 h-100 rounded-4 overflow-hidden position-relative shadow-lg"
                  style={{
                    marginLeft: "45px",
                    background: "#14141c",
                    border: item.rank === 2 ? "2px solid #09C5D6" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: item.rank === 2 ? "0 0 25px rgba(9, 197, 214, 0.4)" : "0 10px 30px rgba(0,0,0,0.6)",
                    transition: "all 0.35s ease",
                  }}
                >
                  <Image
                    src={item.poster}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    style={{ objectFit: "cover" }}
                  />

                  {/* Gradient shadow */}
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                      background: "linear-gradient(0deg, rgba(8,8,12,0.95) 0%, rgba(8,8,12,0.4) 50%, rgba(0,0,0,0.1) 100%)",
                    }}
                  />

                  {/* Card Content Overlay */}
                  <div className="position-absolute bottom-0 start-0 w-100 p-4 d-flex flex-column justify-content-end">
                    <span
                      className="d-inline-flex align-items-center gap-1 mb-2 px-2 py-1 rounded"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(6px)",
                        border: `1px solid ${item.rankColor}`,
                        color: item.rankColor,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        width: "fit-content",
                      }}
                    >
                      <i className="bi bi-graph-up-arrow"></i>
                      {item.featuredBadge}
                    </span>

                    <h4 className="text-white fw-bold mb-1" style={{ fontSize: "1.25rem" }}>
                      {item.title}
                    </h4>

                    <div className="d-flex align-items-center justify-content-between text-secondary small">
                      <span>{item.genre}</span>
                      <span className="text-white-50">{item.views}</span>
                    </div>

                    <div className="mt-3 pt-2 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                      <span className="text-secondary small">{item.episodes}</span>
                      <a
                        href="#download"
                        className="btn btn-sm d-inline-flex align-items-center gap-1 text-white fw-bold px-3 py-1 rounded-pill"
                        style={{
                          background: "var(--gradient-brand)",
                          fontSize: "0.78rem",
                        }}
                      >
                        <i className="bi bi-play-fill"></i> Watch
                      </a>
                    </div>
                  </div>
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
