import { ArrowRight } from "lucide-react"

export function FinalCta() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-primary/5 p-8 text-center md:p-16">
          <h2 className="mb-4 font-serif text-3xl text-foreground md:text-4xl text-balance">
            Ready to gift something unforgettable?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Start your custom gift journey today and create memories that last forever
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                Start a Custom Gift
                <ArrowRight className="ml-2 h-4 w-4" />
            </button>

            <button className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground">
                Explore Artists
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
