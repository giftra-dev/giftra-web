"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Marketing Director",
    content:
      "Giftra completely changed how I approach gift-giving. The AI suggestions are spot-on, and I&apos;ve never seen my family so delighted!",
    initials: "SM",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Software Engineer",
    content:
      "I used to dread shopping for gifts. Now Gigi handles everything - from remembering birthdays to suggesting the perfect present.",
    initials: "JC",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Small Business Owner",
    content:
      "The relationship tracking feature is a game-changer. I never forget an important date, and my clients love the thoughtful gifts.",
    initials: "ER",
    rating: 5,
  },
  {
    name: "Michael Thompson",
    role: "Father of Three",
    content:
      "With three kids and extended family, keeping track was impossible. Giftra made me look like a gift-giving genius!",
    initials: "MT",
    rating: 5,
  },
  {
    name: "Lisa Park",
    role: "Event Planner",
    content:
      "The group gifting feature saved my sanity during the holidays. Coordinating with family has never been easier.",
    initials: "LP",
    rating: 5,
  },
  {
    name: "David Wilson",
    role: "Remote Worker",
    content:
      "Being far from family, I relied on Giftra to send meaningful gifts. The marketplace has unique items you won&apos;t find elsewhere.",
    initials: "DW",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 sm:py-32">
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
            Testimonials
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by <span className="text-gradient">Thoughtful Gifters</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands who have transformed their gift-giving experience.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="flex h-full flex-col p-6">
                  {/* Stars */}
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="flex-1 text-sm text-muted-foreground">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="mt-6 flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
