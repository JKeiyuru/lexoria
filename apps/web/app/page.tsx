import { Navbar } from '@/components/Navbar'
import { HeroSection } from '@/components/HeroSection'
import { HowItWorksSection } from '@/components/HowItWorksSection'
import { SubjectsSection } from '@/components/SubjectsSection'
import { DemoSection } from '@/components/DemoSection'
import { PricingSection } from '@/components/PricingSection'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <SubjectsSection />
      <DemoSection />
      <PricingSection />
      <Footer />
    </main>
  )
}