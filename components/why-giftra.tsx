import { Heart, BadgeCheck, Shield, Headphones } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Truly Personalized",
    description: "Every gift is made just for you.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Artists",
    description: "Trusted creators across styles and categories.",
  },
  {
    icon: Shield,
    title: "Safe In-Platform Chat",
    description: "Your conversations stay protected.",
  },
  {
    icon: Headphones,
    title: "End-to-End Support",
    description: "From idea to delivery, we've got you covered.",
  },
]

export function WhyGiftra() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-3xl text-foreground md:text-4xl text-balance">Why Giftra</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">Everything you need for the perfect custom gift</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
