import { BookingProvider } from "@/components/site/BookingContext";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Pricing } from "@/components/site/Pricing";
import { Babies } from "@/components/site/Babies";
import { MobileService } from "@/components/site/MobileService";
import { Reviews } from "@/components/site/Reviews";
import { Faq } from "@/components/site/Faq";
import { BookingSection } from "@/components/site/BookingSection";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { ChatWidget } from "@/components/site/ChatWidget";

export default function Home() {
  return (
    <BookingProvider>
      <Header />
      <main id="top">
        <Hero />
        <HowItWorks />
        <Pricing />
        <Babies />
        <MobileService />
        <Reviews />
        <Faq />
        <BookingSection />
        <About />
        <Contact />
        <Footer />
      </main>
      <ChatWidget />
    </BookingProvider>
  );
}
