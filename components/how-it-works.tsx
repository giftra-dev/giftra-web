import { Search, MessageCircle, Package } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Discover Artists",
    description: "Browse artists by style, category, and budget.",
  },
  {
    icon: MessageCircle,
    title: "Chat & Customize",
    description: "Discuss your idea directly with the artist using in-platform chat.",
  },
  {
    icon: Package,
    title: "Receive Your Gift",
    description: "Track progress from concept to doorstep delivery.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-card px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-3xl text-foreground md:text-4xl text-balance">How It Works</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">From idea to delivery in three simple steps</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="group relative flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="mb-2 text-sm font-medium text-primary">Step {index + 1}</span>
              <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
