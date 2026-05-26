"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Gift, Mail, Lock, Eye, EyeOff, User, Palette } from "lucide-react"
import { useGiftraStore, type UserRole } from "@/lib/store"
import { signUp } from "@/lib/supabase/queries"
import { hasSupabaseConfig, isDemoAuthAllowed } from "@/lib/supabase/config"

const isSignupRole = (role: unknown): role is Exclude<UserRole, "admin"> =>
  role === "customer" || role === "artist"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useGiftraStore(state => state.login)
  const setCurrentUser = useGiftraStore(state => state.setCurrentUser)
  const initialRole = searchParams.get("role")
  
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Exclude<UserRole, "admin">>(
    isSignupRole(initialRole) ? initialRole : "customer"
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!hasSupabaseConfig) {
      if (!isDemoAuthAllowed) {
        setError("Supabase is not configured.")
        setIsLoading(false)
        return
      }

      document.cookie = `giftra_demo_role=${role}; path=/; max-age=86400; samesite=lax`
      login(role)
      setTimeout(() => {
        router.push(`/${role}/dashboard`)
      }, 500)
      return
    }

    try {
      const { data, error: signUpError } = await signUp(email, password, name, role)

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }

      if (data.session) {
        setCurrentUser({
          id: data.user?.id ?? crypto.randomUUID(),
          email,
          name,
          role,
          createdAt: data.user?.created_at ? new Date(data.user.created_at) : new Date(),
        })
        router.push(`/${role}/dashboard`)
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl">Giftra</span>
          </Link>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-1">Join Giftra and start creating</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign up</CardTitle>
            <CardDescription>
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>I want to join as</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as Exclude<UserRole, "admin">)}>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
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
