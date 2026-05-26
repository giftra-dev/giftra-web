"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Gift, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useGiftraStore, type UserRole } from "@/lib/store"
import { getCurrentProfile, signIn } from "@/lib/supabase/queries"
import { hasSupabaseConfig, isDemoAuthAllowed } from "@/lib/supabase/config"

const isUserRole = (role: unknown): role is UserRole =>
  role === "customer" || role === "artist" || role === "admin"

const isRoleRoute = (path: string, role: UserRole) =>
  path === `/${role}` || path.startsWith(`/${role}/`)

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useGiftraStore((state) => state.login)
  const setCurrentUser = useGiftraStore((state) => state.setCurrentUser)

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const getRedirectPath = (role: UserRole) => {
    const redirect = searchParams.get("redirect")
    if (
      redirect?.startsWith("/") &&
      !redirect.startsWith("//") &&
      !(
        (isRoleRoute(redirect, "admin") && role !== "admin") ||
        (isRoleRoute(redirect, "artist") && role !== "artist") ||
        (isRoleRoute(redirect, "customer") && role !== "customer")
      )
    ) {
      return redirect
    }

    return `/${role}/dashboard`
  }

  const handleDemoLogin = (role: UserRole) => {
    if (!isDemoAuthAllowed) {
      setError("Demo login is available only when Supabase is not configured.")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError("")
    document.cookie = `giftra_demo_role=${role}; path=/; max-age=86400; samesite=lax`

    login(role)

    setTimeout(() => {
      router.push(getRedirectPath(role))
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!hasSupabaseConfig) {
      handleDemoLogin("customer")
      return
    }

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const { data, error: signInError } = await signIn(
        normalizedEmail,
        password,
      )

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      const profile = await getCurrentProfile()
      const metadataRole = data.user?.user_metadata?.role
      const role = isUserRole(profile?.role)
        ? profile.role
        : isUserRole(metadataRole)
          ? metadataRole
          : "customer"

      setCurrentUser({
        id: data.user.id,
        email: data.user.email ?? normalizedEmail,
        name: profile?.full_name || data.user.email || normalizedEmail,
        role,
        avatar: profile?.avatar_url ?? undefined,
        createdAt: new Date(data.user.created_at),
      })
      router.push(getRedirectPath(role))
    } catch {
      setError("Unable to sign in. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl">Giftra</span>
          </Link>

          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {isDemoAuthAllowed ? (
              <>
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>

                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or demo login as
                    </span>
                  </div>
                </div>

                {/* Demo buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleDemoLogin("customer")}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Customer
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleDemoLogin("artist")}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Artist
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleDemoLogin("admin")}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Admin
                  </Button>
                </div>
              </>
            ) : null}

            {/* Signup link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {"Don't have an account? "}
              <Link
                href="/auth/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
