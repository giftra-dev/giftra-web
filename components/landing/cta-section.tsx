"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 gradient-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />

          {/* Content */}
          <div className="relative px-6 py-16 text-center sm:px-12 sm:py-24">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Transform Your Gift-Giving?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Join thousands of thoughtful gifters who never miss a special
              moment. Start your free trial today.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="h-12 bg-white px-8 text-base text-primary hover:bg-white/90"
              >
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 border-white/30 bg-transparent px-8 text-base text-white hover:bg-white/10"
              >
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
