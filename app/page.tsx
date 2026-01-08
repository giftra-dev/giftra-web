import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { WhyGiftra } from "@/components/why-giftra"
import { ArtistShowcase } from "@/components/artist-showcase"
import { ForArtists } from "@/components/for-artists"
import { TrustSafety } from "@/components/trust-safety"
import { FinalCta } from "@/components/final-cta"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <WhyGiftra />
        <ArtistShowcase />
        <ForArtists />
        <TrustSafety />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
