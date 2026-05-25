"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Gift,
  Users,
  Calendar,
  TrendingUp,
  ArrowRight,
  Heart,
  MessageSquare,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    name: "Relationships",
    value: "24",
    change: "+3 this month",
    icon: Users,
    color: "text-giftra-purple",
    bgColor: "bg-giftra-purple-light",
  },
  {
    name: "Upcoming Occasions",
    value: "7",
    change: "Next: 5 days",
    icon: Calendar,
    color: "text-giftra-pink",
    bgColor: "bg-giftra-pink-light",
  },
  {
    name: "Gifts Given",
    value: "48",
    change: "+12 this year",
    icon: Gift,
    color: "text-giftra-blue",
    bgColor: "bg-giftra-blue-light",
  },
  {
    name: "Gift Score",
    value: "92%",
    change: "Excellent!",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-giftra-purple-light",
  },
];

const upcomingOccasions = [
  {
    person: "Sarah",
    initials: "SM",
    occasion: "Birthday",
    date: "May 30",
    daysUntil: 5,
    budget: "$50-100",
  },
  {
    person: "Mom",
    initials: "MJ",
    occasion: "Mother&apos;s Day",
    date: "June 8",
    daysUntil: 14,
    budget: "$75-150",
  },
  {
    person: "David & Emily",
    initials: "DE",
    occasion: "Anniversary",
    date: "June 15",
    daysUntil: 21,
    budget: "$100-200",
  },
];

const recentActivity = [
  {
    action: "Purchased gift for",
    person: "James",
    item: "Wireless Headphones",
    time: "2 hours ago",
  },
  {
    action: "Added to wishlist for",
    person: "Lisa",
    item: "Cooking Class",
    time: "Yesterday",
  },
  {
    action: "Gigi suggested gift for",
    person: "Dad",
    item: "Golf Accessories",
    time: "2 days ago",
  },
];

const quickSuggestions = [
  {
    name: "Artisan Coffee Set",
    price: "$45",
    match: "95%",
    for: "Coffee Lovers",
  },
  {
    name: "Personalized Photo Book",
    price: "$35",
    match: "92%",
    for: "Family Members",
  },
  {
    name: "Spa Gift Card",
    price: "$75",
    match: "88%",
    for: "Self-care Enthusiasts",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, John!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your gift-giving journey.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/assistant">
            <MessageSquare data-icon="inline-start" />
            Chat with Gigi
          </Link>
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${stat.bgColor}`}
                  >
                    <stat.icon className={`size-5 ${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Occasions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                Upcoming Occasions
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/occasions">
                  View all
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingOccasions.map((occasion) => (
                <div
                  key={occasion.person}
                  className="flex items-center gap-4 rounded-lg border border-border p-4"
                >
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {occasion.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{occasion.person}</p>
                      <Badge variant="secondary">{occasion.occasion}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {occasion.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {occasion.daysUntil} days
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard/assistant">
                      <Sparkles data-icon="inline-start" />
                      Find Gift
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  Gigi&apos;s Quick Picks
                </span>
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/marketplace">
                  Browse all
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickSuggestions.map((suggestion) => (
                <div
                  key={suggestion.name}
                  className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-12 items-center justify-center rounded-lg bg-giftra-purple-light">
                    <Gift className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{suggestion.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.for}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{suggestion.price}</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Heart className="size-3 fill-current" />
                      {suggestion.match} match
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-1 size-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="text-muted-foreground">
                          {activity.action}
                        </span>{" "}
                        <span className="font-medium">{activity.person}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.item}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gift Budget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Monthly Gift Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Spent this month
                  </span>
                  <span className="text-sm font-medium">$285 / $500</span>
                </div>
                <Progress value={57} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold text-primary">$215</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Avg per gift</p>
                  <p className="text-2xl font-bold">$47</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/settings">Manage Budget</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
