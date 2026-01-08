import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-medium text-foreground">Giftra</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </Link>
          <Link href="#artists" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Artists
          </Link>
          <Link href="#for-artists" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Become an Artist
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Log in
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
