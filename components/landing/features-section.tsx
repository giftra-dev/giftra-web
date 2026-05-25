"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  Calendar,
  ShoppingBag,
  MessageSquare,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI Gift Recommendations",
    description:
      "Our AI assistant learns preferences, interests, and past gifts to suggest perfectly personalized presents.",
    gradient: "from-giftra-purple to-giftra-pink",
    bgColor: "bg-giftra-purple-light",
  },
  {
    icon: Users,
    title: "Relationship Management",
    description:
      "Keep track of everyone important in your life with detailed profiles, preferences, and gift history.",
    gradient: "from-giftra-pink to-giftra-blue",
    bgColor: "bg-giftra-pink-light",
  },
  {
    icon: Calendar,
    title: "Occasion Tracking",
    description:
      "Never miss a birthday, anniversary, or special moment. Get timely reminders and suggestions.",
    gradient: "from-giftra-blue to-giftra-purple",
    bgColor: "bg-giftra-blue-light",
  },
  {
    icon: ShoppingBag,
    title: "Curated Marketplace",
    description:
      "Browse a hand-picked selection of unique gifts from trusted vendors, all in one place.",
    gradient: "from-giftra-purple to-giftra-blue",
    bgColor: "bg-giftra-purple-light",
  },
  {
    icon: MessageSquare,
    title: "Collaborative Wishlists",
    description:
      "Create and share wishlists with family and friends. Coordinate group gifts seamlessly.",
    gradient: "from-giftra-pink to-giftra-purple",
    bgColor: "bg-giftra-pink-light",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Receive timely alerts for upcoming occasions, price drops, and gift inspiration.",
    gradient: "from-giftra-blue to-giftra-pink",
    bgColor: "bg-giftra-blue-light",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Features
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need for{" "}
            <span className="text-gradient">Perfect Gifting</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From AI-powered suggestions to seamless tracking, Giftra handles
            every aspect of thoughtful gift-giving.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6">
                  <div
                    className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${feature.bgColor}`}
                  >
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
