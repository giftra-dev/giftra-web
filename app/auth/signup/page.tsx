"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Gift, Mail, Lock, Eye, EyeOff, User, Palette, CheckCircle, Sparkles } from "lucide-react"
import { signUp, signInWithGoogle } from "@/lib/supabase/queries"
import { hasSupabaseConfig } from "@/lib/supabase/config"
import type { UserRole } from "@/lib/types/database"

const isSignupRole = (role: unknown): role is Exclude<UserRole, "admin"> =>
  role === "customer" || role === "artist"

const signupCopy: Record<Exclude<UserRole, "admin">, {
  eyebrow: string
  title: string
  description: string
  cardTitle: string
  cardDescription: string
  cta: string
  bullets: string[]
  icon: React.ElementType
}> = {
  customer: {
    eyebrow: "For thoughtful gift buyers",
    title: "Request a custom gift without chasing artists manually",
    description: "Create a brief, get matched by Giftra, pay once the quote is ready, and keep every conversation protected in one place.",
    cardTitle: "Create Customer Account",
    cardDescription: "Start with a gift request and track every order from your dashboard.",
    cta: "Create customer account",
    bullets: ["Submit gift briefs", "Track requests and orders", "Chat after payment unlocks"],
    icon: User,
  },
  artist: {
    eyebrow: "For makers and artists",
    title: "Join Giftra as an artist and receive curated assignments",
    description: "Set up your profile, manage assigned orders, share previews, and keep production conversations organized.",
    cardTitle: "Create Artist Account",
    cardDescription: "Build your artist profile after signup so admins can assign the right work.",
    cta: "Create artist account",
    bullets: ["Receive matched orders", "Manage production status", "Share artwork and shipping updates"],
    icon: Palette,
  },
}

export function SignupForm({ fixedRole }: { fixedRole?: Exclude<UserRole, "admin"> }) {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get("role")
  const next = searchParams.get("next")
  const isRoleLocked = Boolean(fixedRole || isSignupRole(initialRole))
  
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Exclude<UserRole, "admin">>(
    fixedRole || (isSignupRole(initialRole) ? initialRole : "customer")
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const copy = signupCopy[role]
  const CopyIcon = copy.icon

  const handleGoogleSignUp = async () => {
    if (!hasSupabaseConfig) {
      setError("Google sign-up requires Supabase configuration.")
      return
    }

    setIsGoogleLoading(true)
    setError("")

    try {
      const { error: googleError } = await signInWithGoogle(role, next || undefined)
      if (googleError) {
        setError(googleError.message)
        setIsGoogleLoading(false)
      }
      // If successful, the user will be redirected to Google
    } catch {
      setError("Unable to sign up with Google. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!hasSupabaseConfig) {
      setError("Supabase is not configured. Please add your Supabase credentials.")
      setIsLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await signUp(email, password, name, role, next || undefined)

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }

      if (data.session) {
        // User is signed in immediately (email confirmation disabled)
        window.location.assign(next?.startsWith("/") && !next.startsWith("//") ? next : `/${role}/dashboard`)
        return
      }

      setSuccess("Check your email to confirm your account before signing in.")
    } catch {
      setError("Unable to create your account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground">
        Join Giftra to request or create personalised gifts
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center px-4 py-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_440px]">
          <section className="flex flex-col justify-center rounded-lg border bg-card p-6 shadow-sm lg:p-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-2xl">Giftra</span>
            </Link>

            <Badge className="mb-4 w-fit rounded-full bg-accent text-accent-foreground">
              Giftra marketplace
            </Badge>
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              <CopyIcon className="w-4 h-4" />
              {copy.eyebrow}
            </div>
            <h1 className="text-3xl font-bold leading-tight">{copy.title}</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">{copy.description}</p>

            <div className="mt-8 grid gap-3">
              {copy.bullets.map((bullet) => (
                <div key={bullet} className="flex items-center gap-3 rounded-lg bg-muted p-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {bullet}
                </div>
              ))}
            </div>

            {!isRoleLocked && (
              <div className="mt-8 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={role === "customer" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setRole("customer")}
                >
                  <User className="w-4 h-4" />
                  Customer
                </Button>
                <Button
                  type="button"
                  variant={role === "artist" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setRole("artist")}
                >
                  <Palette className="w-4 h-4" />
                  Artist
                </Button>
              </div>
            )}
          </section>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">{copy.cardTitle}</CardTitle>
            <CardDescription>
              {copy.cardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 mb-4"
              onClick={handleGoogleSignUp}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                "Connecting..."
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              {success ? (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    disabled={isLoading || isGoogleLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isGoogleLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isRoleLocked && (
              <div className="space-y-3">
                <Label>I want to join as</Label>
                <RadioGroup value={role} onValueChange={(v: string) => setRole(v as Exclude<UserRole, "admin">)}>
                  <div className="grid grid-cols-2 gap-3">
                    <Label
                      htmlFor="customer"
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        role === "customer" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="customer" id="customer" className="sr-only" />
                      <User className={`w-6 h-6 ${role === "customer" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${role === "customer" ? "text-primary" : ""}`}>
                        Customer
                      </span>
                      <span className="text-xs text-muted-foreground text-center">
                        Request custom gifts
                      </span>
                    </Label>
                    <Label
                      htmlFor="artist"
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        role === "artist" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="artist" id="artist" className="sr-only" />
                      <Palette className={`w-6 h-6 ${role === "artist" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${role === "artist" ? "text-primary" : ""}`}>
                        Artist
                      </span>
                      <span className="text-xs text-muted-foreground text-center">
                        Create custom gifts
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? "Creating account..." : copy.cta}
              </Button>
            </form>

            {role === "artist" && (
              <div className="mt-4 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                  <p>After signup, complete your specialties, portfolio link, and availability in Artist Settings.</p>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href={role === "artist" ? "/auth/artist/login" : "/auth/customer/login"} className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
