import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-medium text-foreground">Giftra</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/browse" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Browse Gifts
          </Link>
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
            <Link href="/auth/login" className="hidden items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground md:inline-flex">
                Log in
            </Link>

            <Link href="/browse" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                Browse Gifts
            </Link>

        </div>
      </div>
    </header>
  )
}
