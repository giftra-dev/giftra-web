import Image from "next/image"
import { ArrowRight, Check } from "lucide-react"

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
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
          <Image
            src="/artist-workspace-creative-studio-warm-lighting.jpg"
            alt="Artist creative workspace"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-6 font-serif text-3xl text-foreground md:text-4xl">
          Create. Earn. Grow with Giftra.
        </h2>

        <ul className="mb-8 space-y-4">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                <Check className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>

        <button
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Join as an Artist
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</section>

  )
}
