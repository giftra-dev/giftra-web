"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Users, 
  MessageSquareText, 
  CreditCard, 
  Sparkles,
  Palette,
  Gift,
  ArrowRight,
  Check
} from "lucide-react"

function TrustBadge({ icon: Icon, title, description }: { 
  icon: React.ElementType
  title: string
  description: string 
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

function HowItWorksStep({ number, title, description }: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function CategoryCard({ icon: Icon, title, examples }: {
  icon: React.ElementType
  title: string
  examples: string[]
}) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
      <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
        <Icon className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <ul className="space-y-1">
        {examples.map((example, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
            <Check className="w-3 h-3 text-primary" />
            {example}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Giftra</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Browse Gifts
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="#categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Categories
            </Link>
            <Link href="#trust" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Trust & Safety
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Personalized Gifts, Crafted with Care
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance max-w-4xl mx-auto leading-tight">
            Describe Your Gift.
            <br />
            <span className="text-primary">We Handle the Rest.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
            Connect with talented artists who bring your gift ideas to life. 
            Secure payments, protected communication, and quality guaranteed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Browse Custom Gifts
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/signup?role=artist">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Palette className="w-4 h-4" />
                Become an Artist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section id="trust" className="py-16 border-y border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <TrustBadge 
              icon={CreditCard}
              title="Secure Payments"
              description="All payments are processed securely. Funds are only released when you are satisfied."
            />
            <TrustBadge 
              icon={Users}
              title="Admin-Controlled Matching"
              description="Our team carefully matches your request with the perfect artist for your project."
            />
            <TrustBadge 
              icon={MessageSquareText}
              title="Protected Chat System"
              description="All communication stays within Giftra, ensuring your project and privacy are protected."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From idea to delivery, we make the process simple and secure.
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-8">
            <HowItWorksStep 
              number={1}
              title="Describe Your Gift"
              description="Tell us what you are looking for - category, style, budget, and deadline. Upload reference images if you have them."
            />
            <HowItWorksStep 
              number={2}
              title="Get Matched with an Artist"
              description="Our admin team reviews your request and matches you with the perfect artist based on skill and availability."
            />
            <HowItWorksStep 
              number={3}
              title="Collaborate & Create"
              description="Chat directly with your artist in our secure platform. Share ideas, provide feedback, and watch your gift come to life."
            />
            <HowItWorksStep 
              number={4}
              title="Receive Your Gift"
              description="Once you approve the final work, we handle shipping and delivery. Your personalized gift is ready!"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From portraits to custom jewelry, our artists can create almost anything.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard 
              icon={Palette}
              title="Portraits & Art"
              examples={["Family portraits", "Pet illustrations", "Caricatures"]}
            />
            <CategoryCard 
              icon={Sparkles}
              title="Custom Jewelry"
              examples={["Engraved pendants", "Custom rings", "Personalized bracelets"]}
            />
            <CategoryCard 
              icon={Gift}
              title="Handcrafted Gifts"
              examples={["Wooden crafts", "Ceramics", "Textile art"]}
            />
            <CategoryCard 
              icon={Shield}
              title="Digital Creations"
              examples={["Digital art", "Photo editing", "Logo design"]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
              Ready to Create Something Special?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of happy customers who have brought their gift ideas to life with Giftra.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Giftra</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Personalized gifts, crafted with care. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
