"use client";

import { useState, useEffect } from "react";
import AOS from "aos";
import Header from "@/components/landing/Header";
import OffcanvasMenu from "@/components/landing/OffcanvasMenu";
import HeroSection from "@/components/landing/HeroSection";
import FeaturedStories from "@/components/landing/FeaturedStories";
import ExploreGenres from "@/components/landing/ExploreGenres";
import TrendingStories from "@/components/landing/TrendingStories";
import HowItWorks from "@/components/landing/HowItWorks";
import LanguageSection from "@/components/landing/LanguageSection";
import PremiumSection from "@/components/landing/PremiumSection";
import AppShowcase from "@/components/landing/AppShowcase";
import Testimonials from "@/components/landing/Testimonials";
import FAQSection from "@/components/landing/FAQSection";
import DownloadSection from "@/components/landing/DownloadSection";
import Footer from "@/components/landing/Footer";
import MobileBottomNav from "@/components/landing/MobileBottomNav";

export default function LandingPage({ playStoreUrl }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      easing: "ease-out-cubic",
      offset: 50,
    });
  }, []);

  return (
    <main
      className="tvk-landing has-bottom-nav position-relative overflow-hidden"
      data-aos-easing="ease-out-cubic"
      data-aos-duration="800"
      data-aos-delay="0"
    >
      {/* Fixed Sticky Header */}
      <Header onOpenMenu={() => setIsMenuOpen(true)} />

      {/* Bootstrap Offcanvas Mobile Navigation Menu */}
      <OffcanvasMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Hero Banner Section */}
      <HeroSection />

      {/* Featured Stories Carousel */}
      <FeaturedStories />

      {/* Explore Genres Grid */}
      <ExploreGenres />

      {/* Trending Now Section */}
      <TrendingStories />

      {/* How TVK OTT Works */}
      <HowItWorks />

      {/* Multiple Regional Languages */}
      <LanguageSection />

      {/* Premium Membership Plans */}
      <PremiumSection />

      {/* Mobile App Showcase with 10 actual app screenshots */}
      <AppShowcase />

      {/* Testimonials and User Reviews */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQSection />

      {/* Download App CTA Section */}
      <DownloadSection playStoreUrl={playStoreUrl} />

      {/* Premium Full Footer */}
      <Footer />

      {/* App-Style Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </main>
  );
}
