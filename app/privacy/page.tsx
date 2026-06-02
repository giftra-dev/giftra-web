import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/">Back to Giftra</Link>
        </Button>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-3 text-muted-foreground">
          Giftra stores only the information needed to operate customer requests, artist portfolios, orders, payments, and protected messages.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-6 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Data We Collect</h2>
            <p>Account details, profile information, request details, uploaded references, messages, order records, payment status, and support/admin activity logs.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">How We Use Data</h2>
            <p>We use data to match customers with artists, manage orders, secure communication, process payments, send notifications, and improve marketplace quality.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Storage And Access</h2>
            <p>Customer, artist, and admin access is separated by role-based database policies. Public portfolio samples may be visible to anonymous visitors.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Contact</h2>
            <p>For privacy requests, contact the Giftra team using your production support email before launch.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
