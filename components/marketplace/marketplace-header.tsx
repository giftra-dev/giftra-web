"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/queries"
import type { UserRole } from "@/lib/types/database"
import { Gift, Heart, Store, UserRound } from "lucide-react"

export function MarketplaceHeader({ wishlistCount = 0 }: { wishlistCount?: number }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<UserRole>("customer")

  useEffect(() => {
    async function loadUser() {
      const [userData, profile] = await Promise.all([
        getCurrentUser().catch(() => ({ user: null })),
        getCurrentProfile().catch(() => null),
      ])

      setIsLoggedIn(Boolean(userData.user))
      setRole(profile?.role || "customer")
    }

    loadUser()
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground">
        Unique personalised gifts from independent Giftra artists
      </div>
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Gift className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Giftra</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/#artworks">Browse</Link>
          </Button>
          {isLoggedIn ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/${role}/settings`}>
                  <UserRound className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/${role}/dashboard`}>Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/artist/login">
                  <Store className="mr-2 h-4 w-4" />
                  Become an artist
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/customer/login">
                  <UserRound className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            </>
          )}
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
