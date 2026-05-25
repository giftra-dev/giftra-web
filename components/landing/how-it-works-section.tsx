"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, Sparkles, Gift } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Users,
    title: "Add Your People",
    description:
      "Create profiles for friends and family with their interests, preferences, and important dates.",
    color: "text-giftra-purple",
    bgColor: "bg-giftra-purple-light",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Chat with Gigi",
    description:
      "Tell our AI assistant about the person and occasion. Get personalized gift ideas instantly.",
    color: "text-giftra-pink",
    bgColor: "bg-giftra-pink-light",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Get Recommendations",
    description:
      "Browse AI-curated suggestions tailored to your budget, their taste, and the occasion.",
    color: "text-giftra-blue",
    bgColor: "bg-giftra-blue-light",
  },
  {
    number: "04",
    icon: Gift,
    title: "Send with Love",
    description:
      "Purchase directly through our marketplace or save ideas for later. Track delivery and reactions.",
    color: "text-primary",
    bgColor: "bg-giftra-purple-light",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            How It Works
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Gift-Giving Made{" "}
            <span className="text-gradient">Effortlessly Personal</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Four simple steps to find the perfect gift every time.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-full top-16 hidden h-px w-8 bg-border lg:block" />
              )}

              <div className="text-center">
                {/* Step Number */}
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border-2 border-border bg-card">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={`mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl ${step.bgColor}`}
                >
                  <step.icon className={`size-6 ${step.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
