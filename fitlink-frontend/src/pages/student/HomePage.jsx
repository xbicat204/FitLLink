// src/pages/CustomerPage.jsx
import HeroCarousel from "@/components/HeroCarousel";
import MainLayout from "@/layouts/MainLayout";
import BMIFloatingButton from "@/components/student/BMIFloatingButton";
import ChatAIFloatingButton from "@/components/student/ChatAIFloatingButton";

import FeaturesSection from "@/components/page/home/FeaturesSection";
import ProgramSection from "@/components/page/home/ProgramSection";
import TrainerSection from "@/components/page/home/TrainerSection";
import TestimonialSection from "@/components/page/home/TestimonialSection";
import CallToActionSection from "@/components/page/home/CallToActionSection";
import PricingSection from "@/components/page/home/PricingSection";
export default function CustomerPage() {
  return (
    <MainLayout>
      <HeroCarousel />
      <FeaturesSection />
      <ProgramSection />
      <PricingSection />
      <TrainerSection />
      <TestimonialSection />
      <CallToActionSection />

      <BMIFloatingButton />
      <ChatAIFloatingButton />
    </MainLayout>
  );
}
