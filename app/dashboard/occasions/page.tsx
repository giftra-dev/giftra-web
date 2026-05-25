"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar as CalendarIcon,
  Gift,
  Bell,
  MoreVertical,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Occasion {
  id: string;
  name: string;
  type: string;
  person: string;
  personInitials: string;
  date: string;
  daysUntil: number;
  budget?: string;
  reminder: boolean;
  giftIdeas: number;
  status: "upcoming" | "today" | "past";
}

const occasions: Occasion[] = [
  {
    id: "1",
    name: "Birthday",
    type: "Birthday",
    person: "Sarah Mitchell",
    personInitials: "SM",
    date: "May 30, 2026",
    daysUntil: 5,
    budget: "$50-100",
    reminder: true,
    giftIdeas: 3,
    status: "upcoming",
  },
  {
    id: "2",
    name: "Mother's Day",
    type: "Holiday",
    person: "Mom (Jane)",
    personInitials: "MJ",
    date: "June 8, 2026",
    daysUntil: 14,
    budget: "$75-150",
    reminder: true,
    giftIdeas: 5,
    status: "upcoming",
  },
  {
    id: "3",
    name: "Wedding Anniversary",
    type: "Anniversary",
    person: "Emily & James",
    personInitials: "EJ",
    date: "June 15, 2026",
    daysUntil: 21,
    budget: "$100-200",
    reminder: true,
    giftIdeas: 2,
    status: "upcoming",
  },
  {
    id: "4",
    name: "Father's Day",
    type: "Holiday",
    person: "Dad (Robert)",
    personInitials: "RJ",
    date: "June 22, 2026",
    daysUntil: 28,
    budget: "$50-100",
    reminder: true,
    giftIdeas: 1,
    status: "upcoming",
  },
  {
    id: "5",
    name: "Birthday",
    type: "Birthday",
    person: "David Chen",
    personInitials: "DC",
    date: "July 10, 2026",
    daysUntil: 46,
    reminder: true,
    giftIdeas: 0,
    status: "upcoming",
  },
];

const occasionTypes = [
  "Birthday",
  "Anniversary",
  "Holiday",
  "Graduation",
  "Wedding",
  "Baby Shower",
  "Housewarming",
  "Other",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function OccasionsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(4); // May (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);

  const upcomingOccasions = occasions.filter((o) => o.daysUntil <= 30);
  const thisMonthOccasions = occasions.filter((o) => {
    const eventDate = new Date(o.date);
    return (
      eventDate.getMonth() === currentMonth &&
      eventDate.getFullYear() === currentYear
    );
  });

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Occasions
          </h1>
          <p className="text-muted-foreground">
            Track important dates and never miss a moment
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus data-icon="inline-start" />
              Add Occasion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Occasion</DialogTitle>
            </DialogHeader>
            <AddOccasionForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-giftra-purple-light">
              <CalendarIcon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingOccasions.length}</p>
              <p className="text-sm text-muted-foreground">Next 30 Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-giftra-pink-light">
              <Bell className="size-5 text-giftra-pink" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {occasions.filter((o) => o.reminder).length}
              </p>
              <p className="text-sm text-muted-foreground">Reminders Set</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-giftra-blue-light">
              <Gift className="size-5 text-giftra-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {occasions.reduce((acc, o) => acc + o.giftIdeas, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Gift Ideas Saved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Urgent Occasions */}
          {upcomingOccasions.filter((o) => o.daysUntil <= 7).length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <Clock className="size-4" />
                  Coming Up This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingOccasions
                  .filter((o) => o.daysUntil <= 7)
                  .map((occasion) => (
                    <OccasionCard key={occasion.id} occasion={occasion} urgent />
                  ))}
              </CardContent>
            </Card>
          )}

          {/* All Upcoming */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">All Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {occasions.map((occasion, index) => (
                <motion.div
                  key={occasion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <OccasionCard occasion={occasion} />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <CardTitle>
                  {months[currentMonth]} {currentYear}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="p-2 text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = i - 4 + 1; // Offset for starting day
                  const isValidDay = dayNum > 0 && dayNum <= 31;
                  const hasOccasion = thisMonthOccasions.some((o) => {
                    const d = new Date(o.date).getDate();
                    return d === dayNum;
                  });
                  return (
                    <div
                      key={i}
                      className={`relative p-2 text-sm ${
                        isValidDay
                          ? "hover:bg-muted rounded-lg cursor-pointer"
                          : "text-muted-foreground/30"
                      }`}
                    >
                      {isValidDay ? dayNum : ""}
                      {hasOccasion && isValidDay && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Month Events */}
              {thisMonthOccasions.length > 0 && (
                <div className="mt-6 space-y-3 border-t border-border pt-6">
                  <h4 className="font-medium">
                    Events in {months[currentMonth]}
                  </h4>
                  {thisMonthOccasions.map((occasion) => (
                    <OccasionCard key={occasion.id} occasion={occasion} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OccasionCard({
  occasion,
  urgent = false,
}: {
  occasion: Occasion;
  urgent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
        urgent
          ? "border-destructive/30 bg-card"
          : "border-border hover:bg-muted/50"
      }`}
    >
      <Avatar className="size-10">
        <AvatarFallback className="bg-primary/10 text-primary">
          {occasion.personInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{occasion.person}</p>
          <Badge
            variant={urgent ? "destructive" : "secondary"}
            className="shrink-0"
          >
            {occasion.type}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarIcon className="size-3" />
            {occasion.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {occasion.daysUntil} days
          </span>
          {occasion.budget && <span>{occasion.budget}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {occasion.giftIdeas > 0 && (
          <Badge variant="outline" className="shrink-0">
            {occasion.giftIdeas} ideas
          </Badge>
        )}
        <Button size="sm" variant="outline">
          <Sparkles data-icon="inline-start" />
          Find Gift
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function AddOccasionForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="person">Person</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select person..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sarah">Sarah Mitchell</SelectItem>
              <SelectItem value="mom">Mom (Jane)</SelectItem>
              <SelectItem value="dad">Dad (Robert)</SelectItem>
              <SelectItem value="david">David Chen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Occasion Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {occasionTypes.map((type) => (
                <SelectItem key={type} value={type.toLowerCase()}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Budget Range</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select budget..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-25">Under $25</SelectItem>
              <SelectItem value="25-50">$25 - $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="200+">$200+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <Label htmlFor="reminder">Set Reminder</Label>
          <p className="text-sm text-muted-foreground">
            Get notified before this occasion
          </p>
        </div>
        <Switch id="reminder" defaultChecked />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Add Occasion</Button>
      </div>
    </form>
  );
}
