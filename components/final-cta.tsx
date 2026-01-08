import { Button } from "@/components/ui/button"
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
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Start a Custom Gift
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-secondary bg-transparent"
            >
              Explore Artists
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
