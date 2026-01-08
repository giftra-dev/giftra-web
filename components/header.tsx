import Link from "next/link"

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
            <button className="hidden md:inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium
             text-gray-700 hover:bg-gray-100 transition">
                Log in
            </button>

            <button className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium
                        bg-black text-white hover:bg-gray-800 transition">
                Get Started
            </button>

        </div>
      </div>
    </header>
  )
}
