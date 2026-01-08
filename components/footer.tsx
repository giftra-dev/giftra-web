import Link from "next/link"

const links = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Artists", href: "#artists" },
  { label: "Become an Artist", href: "#for-artists" },
  { label: "Contact", href: "#" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <Link href="/" className="font-serif text-2xl font-medium text-foreground">
            Giftra
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Giftra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
