"use client";

import { useEffect, useRef } from "react";
import LandingNavbar from "./LandingNavbar";
import HeroSection from "./HeroSection";
import StatsStrip from "./StatsStrip";
import FeatureBento from "./FeatureBento";
import WorkflowSection from "./WorkflowSection";
import RoleShowcase from "./RoleShowcase";
import TrustSection from "./TrustSection";
import FAQSection from "./FAQSection";
import FinalCTA from "./FinalCTA";
import LandingFooter from "./LandingFooter";

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Scroll-triggered animations via IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".landing-animate, .landing-scale-in");
    elements.forEach((el) => {
      // Don't re-observe elements that are already visible (hero elements with is-visible pre-set)
      if (!el.classList.contains("is-visible")) {
        observerRef.current?.observe(el);
      }
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <LandingNavbar />
      <main>
        <HeroSection />
        <StatsStrip />
        <FeatureBento />
        <WorkflowSection />
        <RoleShowcase />
        <TrustSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
