import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/">Back to Giftra</Link>
        </Button>
        <h1 className="text-3xl font-bold">Terms Of Service</h1>
        <p className="mt-3 text-muted-foreground">
          These starter terms describe the core marketplace rules. Replace them with counsel-approved terms before accepting live payments.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-6 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Marketplace Role</h2>
            <p>Giftra coordinates custom gift requests, artist assignment, order communication, and payment workflow between customers and artists.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Custom Work</h2>
            <p>Final scope, pricing, delivery timeline, revisions, and shipping details must be confirmed in the order workflow before production begins.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Payments And Refunds</h2>
            <p>Payment, refund, and dispute rules should follow the production payment provider policy and Giftra admin review process.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Artist Content</h2>
            <p>Artists are responsible for portfolio accuracy and rights to uploaded samples. Giftra may hide or remove inappropriate listings.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
