"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gift, Heart, Store, UserRound } from "lucide-react"

export function MarketplaceHeader({ wishlistCount = 0 }: { wishlistCount?: number }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Gift className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Giftra</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/signup?role=artist">
              <Store className="mr-2 h-4 w-4" />
              Sell
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/login">
              <UserRound className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/wishlist">
              <Heart className="mr-2 h-4 w-4" />
              {wishlistCount}
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
