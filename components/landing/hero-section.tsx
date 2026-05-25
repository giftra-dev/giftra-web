"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Heart, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 size-96 rounded-full bg-giftra-purple/10 blur-3xl animate-float" />
        <div className="absolute right-1/4 top-1/3 size-80 rounded-full bg-giftra-pink/10 blur-3xl animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/3 size-72 rounded-full bg-giftra-blue/10 blur-3xl animate-float" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-giftra-purple-light px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="size-4" />
              <span>AI-Powered Gift Recommendations</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            The Gift of{" "}
            <span className="text-gradient">Thoughtful Giving</span>,
            <br className="hidden sm:block" /> Powered by AI
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty sm:text-xl"
          >
            Transform your gift-giving experience with personalized AI
            recommendations, relationship tracking, and a curated marketplace.
            Never miss another special moment.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/signup">
                Start Gifting Smarter
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 px-8 text-base"
            >
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:gap-12"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted"
                  >
                    <Heart className="size-3 text-giftra-pink" />
                  </div>
                ))}
              </div>
              <span>10,000+ happy gifters</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="size-4 text-primary" />
              <span>50,000+ gifts delivered</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-giftra-blue" />
              <span>98% satisfaction rate</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20"
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-giftra-purple/20 via-giftra-pink/20 to-giftra-blue/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <div className="size-3 rounded-full bg-destructive/60" />
                <div className="size-3 rounded-full bg-yellow-500/60" />
                <div className="size-3 rounded-full bg-green-500/60" />
                <span className="ml-4 text-xs text-muted-foreground">
                  giftra.ai/dashboard
                </span>
              </div>
              <div className="aspect-video bg-gradient-to-br from-giftra-purple-light via-background to-giftra-pink-light p-8">
                <div className="flex h-full flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="mt-2 h-3 w-48 rounded bg-muted/60" />
                    </div>
                    <div className="h-10 w-24 rounded-lg gradient-primary opacity-80" />
                  </div>
                  <div className="grid flex-1 grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-card/80 p-4 shadow-sm"
                      >
                        <div className="size-10 rounded-lg bg-giftra-purple/20" />
                        <div className="mt-4 h-3 w-20 rounded bg-muted" />
                        <div className="mt-2 h-2 w-16 rounded bg-muted/60" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 rounded-xl bg-card/80 p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-giftra-pink/20" />
                        <div>
                          <div className="h-3 w-24 rounded bg-muted" />
                          <div className="mt-1 h-2 w-32 rounded bg-muted/60" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 rounded-xl bg-card/80 p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-giftra-blue/20" />
                        <div>
                          <div className="h-3 w-24 rounded bg-muted" />
                          <div className="mt-1 h-2 w-32 rounded bg-muted/60" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
