"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Gift,
  Calendar,
  Heart,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Relationship {
  id: string;
  name: string;
  initials: string;
  relationship: string;
  email?: string;
  phone?: string;
  location?: string;
  interests: string[];
  upcomingOccasion?: {
    name: string;
    date: string;
    daysUntil: number;
  };
  giftsGiven: number;
  notes?: string;
}

const relationships: Relationship[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    initials: "SM",
    relationship: "Sister",
    email: "sarah@email.com",
    phone: "+1 234 567 8901",
    location: "New York, NY",
    interests: ["Photography", "Travel", "Cooking", "Yoga"],
    upcomingOccasion: { name: "Birthday", date: "May 30", daysUntil: 5 },
    giftsGiven: 12,
    notes: "Loves artisan coffee and vintage cameras",
  },
  {
    id: "2",
    name: "Mom (Jane)",
    initials: "MJ",
    relationship: "Parent",
    email: "jane@email.com",
    location: "Boston, MA",
    interests: ["Gardening", "Reading", "Bird Watching", "Knitting"],
    upcomingOccasion: { name: "Mother's Day", date: "June 8", daysUntil: 14 },
    giftsGiven: 24,
    notes: "Prefers practical gifts. Loves her garden.",
  },
  {
    id: "3",
    name: "David Chen",
    initials: "DC",
    relationship: "Best Friend",
    email: "david@email.com",
    phone: "+1 234 567 8902",
    interests: ["Gaming", "Tech", "Sci-Fi", "Hiking"],
    giftsGiven: 8,
  },
  {
    id: "4",
    name: "Emily & James",
    initials: "EJ",
    relationship: "Couple Friends",
    interests: ["Wine", "Travel", "Home Decor"],
    upcomingOccasion: { name: "Anniversary", date: "June 15", daysUntil: 21 },
    giftsGiven: 4,
    notes: "Getting married next year!",
  },
  {
    id: "5",
    name: "Dad (Robert)",
    initials: "RJ",
    relationship: "Parent",
    location: "Boston, MA",
    interests: ["Golf", "History", "Woodworking", "Jazz"],
    giftsGiven: 18,
    notes: "Hard to shop for - appreciates experiences over things",
  },
  {
    id: "6",
    name: "Lisa Park",
    initials: "LP",
    relationship: "Colleague",
    email: "lisa@work.com",
    interests: ["Fitness", "Wellness", "Podcasts"],
    giftsGiven: 2,
  },
];

const relationshipCategories = [
  "All",
  "Family",
  "Friends",
  "Partner",
  "Colleagues",
  "Other",
];

export default function RelationshipsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredRelationships = relationships.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Relationships
          </h1>
          <p className="text-muted-foreground">
            Manage the people in your gift-giving circle
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus data-icon="inline-start" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Person</DialogTitle>
            </DialogHeader>
            <AddPersonForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search relationships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {relationshipCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-giftra-purple-light">
              <Heart className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{relationships.length}</p>
              <p className="text-sm text-muted-foreground">Total People</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-giftra-pink-light">
              <Calendar className="size-5 text-giftra-pink" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {relationships.filter((r) => r.upcomingOccasion).length}
              </p>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
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
                {relationships.reduce((acc, r) => acc + r.giftsGiven, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Gifts Given</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relationships Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRelationships.map((person, index) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group h-full transition-all hover:shadow-md">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {person.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{person.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {person.relationship}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 size-4" />
                        Ask Gigi
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Upcoming Occasion */}
                {person.upcomingOccasion && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-giftra-purple-light p-3">
                    <Calendar className="size-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {person.upcomingOccasion.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {person.upcomingOccasion.date} -{" "}
                        {person.upcomingOccasion.daysUntil} days
                      </p>
                    </div>
                  </div>
                )}

                {/* Interests */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Interests
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {person.interests.slice(0, 3).map((interest) => (
                      <Badge
                        key={interest}
                        variant="outline"
                        className="text-xs"
                      >
                        {interest}
                      </Badge>
                    ))}
                    {person.interests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{person.interests.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {person.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="size-3" />
                      <span className="truncate">{person.email}</span>
                    </div>
                  )}
                  {person.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3" />
                      <span>{person.location}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">
                    {person.giftsGiven} gifts given
                  </span>
                  <Button size="sm" variant="outline">
                    <Gift data-icon="inline-start" />
                    Find Gift
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AddPersonForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="sibling">Sibling</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="colleague">Colleague</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="email@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" placeholder="+1 234 567 8901" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="interests">Interests</Label>
        <Input id="interests" placeholder="Gardening, Reading, Travel..." />
        <p className="text-xs text-muted-foreground">Separate with commas</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional details about this person..."
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Add Person</Button>
      </div>
    </form>
  );
}
