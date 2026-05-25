"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, ArrowLeft, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 size-96 rounded-full bg-giftra-purple/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 size-80 rounded-full bg-giftra-pink/5 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <div className="flex size-10 items-center justify-center rounded-xl gradient-primary">
            <Gift className="size-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient">Giftra</span>
        </motion.div>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8"
            >
              <h1 className="text-2xl font-bold tracking-tight">
                Forgot your password?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                No worries! Enter your email and we&apos;ll send you reset
                instructions.
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Sending..."
                ) : (
                  <>
                    Send reset instructions
                    <ArrowRight data-icon="inline-end" />
                  </>
                )}
              </Button>
            </motion.form>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve sent password reset instructions to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <div className="mt-8 space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">Back to login</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email?{" "}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-primary hover:underline"
                >
                  Try again
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* Sign Up Link */}
        {!isSubmitted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up for free
            </Link>
          </motion.p>
        )}
      </div>
    </div>
  );
}
