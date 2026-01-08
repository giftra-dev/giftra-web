import { MessageSquare, FileText, Eye } from "lucide-react"

const trustPoints = [
  {
    icon: MessageSquare,
    title: "In-platform communication",
  },
  {
    icon: FileText,
    title: "Order-based conversations",
  },
  {
    icon: Eye,
    title: "Transparent process and support",
  },
]

export function TrustSafety() {
  return (
    <section className="bg-card px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-4 font-serif text-3xl text-foreground md:text-4xl text-balance">
          Safe for Customers. Fair for Artists.
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-muted-foreground">
          We prioritize trust and transparency in every interaction
        </p>
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          {trustPoints.map((point) => (
            <div key={point.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <point.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{point.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
