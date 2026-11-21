"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

export default function Testimonials() {
  const reviews = [
    {
      name: "Aarav Sharma",
      location: "Mumbai",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      review: "The vertical format is revolutionary! I watch 2 episodes of Off Campus on metro rides every morning. Fast, engaging, and zero buffering.",
      tag: "Verified Subscriber",
    },
    {
      name: "Sneha Reddy",
      location: "Hyderabad",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      review: "Finally an OTT platform with high-budget Telugu short series. The plot twists in The Ninth Minute blew my mind. Absolutely worth the VIP pass!",
      tag: "VIP Member",
    },
    {
      name: "Vikram Malhotra",
      location: "Bengaluru",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      review: "Love how concise the storytelling is. No stretched episodes or boring fillers. Just pure thrill from the first second to the cliffhanger.",
      tag: "Verified Viewer",
    },
    {
      name: "Pooja Nair",
      location: "Kochi",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      review: "Malayalam stories are deeply emotional and relatable. The app interface is sleek, gorgeous dark mode, and very responsive.",
      tag: "VIP Member",
    },
    {
      name: "Rohan Patel",
      location: "Ahmedabad",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      review: "Subscription is super affordable at ₹42/month for 12 months. Clean audio quality and ad-free experience makes it 10/10.",
      tag: "Annual Pass Holder",
    },
  ];

  return (
    <section id="testimonials" className="section-padding position-relative" style={{ background: "#0a0a0f" }}>
      <div className="container position-relative">
        {/* Header */}
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="section-tag">
            <i className="bi bi-heart-fill me-1 text-pink"></i> Community Love
          </span>
          <h2 className="section-title">Loved by Story Lovers</h2>
          <p className="section-subtitle">
            Join over 250,000+ enthusiastic viewers who enjoy their daily dose of short-story drama on Chirpii.
          </p>
        </div>

        {/* Carousel */}
        <div data-aos="fade-up" data-aos-delay="200">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1.1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
            className="pb-5 swiper-equal-height"
          >
            {reviews.map((rev, i) => (
              <SwiperSlide key={i} className="h-auto">
                <div
                  className="w-100 p-4 rounded-4 position-relative d-flex flex-column justify-content-between flex-grow-1"
                  data-aos="zoom-in"
                  data-aos-delay={100 + (i % 3) * 100}
                  style={{
                    background: "#14141c",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                <div>
                  {/* Top Quote & Stars */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex text-warning gap-1">
                      {[...Array(rev.rating)].map((_, idx) => (
                        <i key={idx} className="bi bi-star-fill text-gold" style={{ fontSize: "0.85rem" }}></i>
                      ))}
                    </div>
                    <i className="bi bi-quote text-pink fs-2 opacity-50"></i>
                  </div>

                  {/* Review Text */}
                  <p className="text-light mb-4" style={{ fontSize: "0.95rem", lineHeight: 1.6, fontStyle: "italic" }}>
                    &ldquo;{rev.review}&rdquo;
                  </p>
                </div>

                {/* User Info */}
                <div className="d-flex align-items-center gap-3 pt-3 border-top border-secondary border-opacity-25">
                  <div
                    className="position-relative rounded-circle overflow-hidden flex-shrink-0"
                    style={{ width: "46px", height: "46px", border: "2px solid #FF2990" }}
                  >
                    <Image
                      src={rev.avatar}
                      alt={rev.name}
                      fill
                      sizes="46px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <h6 className="text-white fw-bold mb-0" style={{ fontSize: "0.95rem" }}>
                      {rev.name}
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary small" style={{ fontSize: "0.78rem" }}>{rev.location}</span>
                      <span className="badge bg-secondary bg-opacity-25 text-cyan small" style={{ fontSize: "0.68rem" }}>
                        {rev.tag}
                      </span>
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
