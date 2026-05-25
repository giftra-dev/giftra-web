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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

const ENABLE_DEMO_AUTH =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH ===
  "true"

const isUserRole = (
  role: unknown
): role is UserRole =>
  role === "customer" ||
  role === "artist" ||
  role === "admin"

const resolveRole = (
  profileRole: unknown,
  metadataRole: unknown
): UserRole => {
  const fromProfile = isUserRole(profileRole)
    ? profileRole
    : undefined

  const fromMetadata = isUserRole(metadataRole)
    ? metadataRole
    : undefined

  if (!fromProfile && !fromMetadata) {
    console.warn(
      "No valid role found. Falling back to customer."
    )
  }

  return fromProfile ?? fromMetadata ?? "customer"
}

const isSafeRedirect = (
  redirect: string | null
): boolean => {
  if (!redirect) return false

  return (
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.includes("://") &&
    !redirect.includes("\\")
  )
}

export default function LoginClient() {
  const router = useRouter()

  const searchParams = useSearchParams()

  const login = useGiftraStore(
    (state) => state.login
  )

  const [showPassword, setShowPassword] =
    useState(false)

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [isLoading, setIsLoading] =
    useState(false)

  const [activeDemoRole, setActiveDemoRole] =
    useState<UserRole | null>(null)

  const [error, setError] = useState("")

  const getRedirectPath = (
    role: UserRole
  ): string => {
    const redirect =
      searchParams.get("redirect")

    if (isSafeRedirect(redirect)) {
      return redirect
    }

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

      router.replace(getRedirectPath(role))
    } catch (err) {
      console.error(err)

      setError(
        "Demo login failed. Please try again."
      )
    } finally {
      setIsLoading(false)
      setActiveDemoRole(null)
    }
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (isLoading) return

    try {
      setError("")
      setIsLoading(true)

      const normalizedEmail = email
        .trim()
        .toLowerCase()

      if (!normalizedEmail) {
        throw new Error("Email is required.")
      }

      /**
       * Clear demo auth state
       */
      try {
        localStorage.removeItem(
          "giftra_demo_user"
        )
      } catch (storageError) {
        console.error(
          "Failed clearing demo auth:",
          storageError
        )
      }

      const { data, error: signInError } =
        await signIn(
          normalizedEmail,
          password
        )

      if (signInError) {
        throw new Error(signInError.message)
      }

      if (!data?.user) {
        throw new Error(
          "User account not found."
        )
      }

      let profile = null

      try {
        profile =
          await getCurrentProfile()
      } catch (profileError) {
        console.error(
          "Failed fetching profile:",
          profileError
        )
      }

      const role = resolveRole(
        profile?.role,
        data.user.user_metadata?.role
      )

      login(role)

      router.replace(
        getRedirectPath(role)
      )
    } catch (err) {
      console.error(err)

      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."

      setError(message)
    } finally {
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
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Error */}
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
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
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    disabled={isLoading}
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
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    disabled={isLoading}
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