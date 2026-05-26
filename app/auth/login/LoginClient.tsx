"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import {
  Eye,
  EyeOff,
  Gift,
  Loader2,
  Lock,
  Mail,
} from "lucide-react"

import { useGiftraStore, type UserRole } from "@/lib/store"

import {
  getCurrentProfile,
  signIn,
} from "@/lib/supabase/queries"

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

export default function LoginClient() {
  const router = useRouter()

  const searchParams = useSearchParams()
  const login = useGiftraStore((state) => state.login)
  const setCurrentUser = useGiftraStore((state) => state.setCurrentUser)

  const login = useGiftraStore(
    (state) => state.login
  )

  const [showPassword, setShowPassword] =
    useState(false)

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
        (redirect.startsWith("/admin") && role !== "admin") ||
        (redirect.startsWith("/artist") && role !== "artist") ||
        (redirect.startsWith("/customer") && role !== "customer")
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

    return `/${role}/dashboard`
  }

  const handleDemoLogin = async (
    role: UserRole
  ) => {
    if (isLoading) return

    try {
      setError("")
      setIsLoading(true)
      setActiveDemoRole(role)

      /**
       * Clear any previous auth artifacts
       */
      try {
        localStorage.removeItem(
          "giftra_demo_user"
        )

        localStorage.setItem(
          "giftra_demo_user",
          JSON.stringify({
            role,
            authMode: "demo",
            isDemo: true,
          })
        )
      } catch (storageError) {
        console.error(
          "Local storage unavailable:",
          storageError
        )
      }

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
      const { data, error: signInError } = await signIn(email, password)

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
        email: data.user.email ?? email,
        name: profile?.full_name || data.user.email || email,
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
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary-foreground" />
            </div>

            <span className="text-2xl font-bold">
              Giftra
            </span>
          </Link>

          <h1 className="text-2xl font-bold">
            Welcome back
          </h1>

          <p className="mt-1 text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              Sign in
            </CardTitle>

            <CardDescription>
              Enter your email and password
              to access your account
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
                <Label htmlFor="email">
                  Email
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={
                      showPassword
                    }
                    disabled={isLoading}
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading &&
                !activeDemoRole ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Demo Auth */}
            {ENABLE_DEMO_AUTH ? (
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

                {/* Demo Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="text-xs"
                    disabled={isLoading}
                    onClick={() =>
                      handleDemoLogin(
                        "customer"
                      )
                    }
                  >
                    {activeDemoRole ===
                    "customer" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Customer"
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="text-xs"
                    disabled={isLoading}
                    onClick={() =>
                      handleDemoLogin(
                        "artist"
                      )
                    }
                  >
                    {activeDemoRole ===
                    "artist" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Artist"
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="text-xs"
                    disabled={isLoading}
                    onClick={() =>
                      handleDemoLogin(
                        "admin"
                      )
                    }
                  >
                    {activeDemoRole ===
                    "admin" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Admin"
                    )}
                  </Button>
                </div>
              </>
            ) : null}

            {/* Signup */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {"Don't have an account? "}

              <Link
                href="/auth/signup"
                className="font-medium text-primary hover:underline"
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
