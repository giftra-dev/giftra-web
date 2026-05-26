import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/30 px-4 py-1.5 text-sm text-accent-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Personalized gifts, made with love</span>
            </div>
            <h1 className="mb-6 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              Gift it your way
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
              Discover artists. Co-create personalized gifts for every occasion.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
            <button className="inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium
             bg-black text-white hover:bg-gray-800 transition">
                Find an Artist
                <ArrowRight className="ml-2 h-4 w-4" />
            </button>

            <button className="inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium
                        border border-gray-300 text-gray-900 bg-transparent hover:bg-gray-100 transition">
                Become an Artist
            </button>

            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative aspect-square rounded-3xl bg-secondary p-8">
              <Image
                src="/artistic-gift-boxes-with-ribbons-and-handmade-craf.jpg"
                alt="Custom handmade gifts and artistic creations"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-full w-full rounded-2xl object-cover"
              />
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-card p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/20" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Sarah M.</p>
                    <p className="text-xs text-muted-foreground">Portrait Artist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
