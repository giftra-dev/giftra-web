import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"

const benefits = [
  "Get genuine customers",
  "No more DM chaos",
  "Secure orders and payments",
  "Focus on creating, not chasing clients",
]

export function ForArtists() {
  return (
    <section id="for-artists" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-secondary">
              <img
                src="/artist-workspace-creative-studio-warm-lighting.jpg"
                alt="Artist creative workspace"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div>
            <h2 className="mb-6 font-serif text-3xl text-foreground md:text-4xl text-balance">
              Create. Earn. Grow with Giftra.
            </h2>
            <ul className="mb-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Join as an Artist
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
