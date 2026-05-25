"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  DollarSign,
  Gift,
  Calendar,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Contributor {
  id: string;
  name: string;
  initials: string;
  amount: number;
  paid: boolean;
}

interface GroupGift {
  id: string;
  name: string;
  description?: string;
  recipient: string;
  recipientInitials: string;
  occasion: string;
  occasionDate: string;
  daysUntil: number;
  targetAmount: number;
  collectedAmount: number;
  giftItem?: string;
  giftPrice?: number;
  organizer: string;
  contributors: Contributor[];
  status: "collecting" | "purchased" | "delivered";
}

const groupGifts: GroupGift[] = [
  {
    id: "1",
    name: "Sarah's Birthday Gift",
    description: "Getting Sarah the camera she's been wanting!",
    recipient: "Sarah Mitchell",
    recipientInitials: "SM",
    occasion: "Birthday",
    occasionDate: "May 30, 2026",
    daysUntil: 5,
    targetAmount: 500,
    collectedAmount: 375,
    giftItem: "Fujifilm X-T5 Camera",
    giftPrice: 449,
    organizer: "You",
    contributors: [
      { id: "1", name: "You", initials: "JD", amount: 150, paid: true },
      { id: "2", name: "Mom", initials: "MJ", amount: 100, paid: true },
      { id: "3", name: "Dad", initials: "RJ", amount: 75, paid: true },
      { id: "4", name: "David", initials: "DC", amount: 50, paid: true },
      { id: "5", name: "Lisa", initials: "LP", amount: 75, paid: false },
    ],
    status: "collecting",
  },
  {
    id: "2",
    name: "Office Baby Shower",
    description: "Baby shower gift for Lisa and Tom",
    recipient: "Lisa & Tom",
    recipientInitials: "LT",
    occasion: "Baby Shower",
    occasionDate: "June 20, 2026",
    daysUntil: 26,
    targetAmount: 300,
    collectedAmount: 300,
    giftItem: "Uppababy Stroller",
    giftPrice: 289,
    organizer: "Emily",
    contributors: [
      { id: "1", name: "You", initials: "JD", amount: 50, paid: true },
      { id: "2", name: "Emily", initials: "ER", amount: 75, paid: true },
      { id: "3", name: "James", initials: "JC", amount: 50, paid: true },
      { id: "4", name: "Mike", initials: "MT", amount: 75, paid: true },
      { id: "5", name: "Anna", initials: "AB", amount: 50, paid: true },
    ],
    status: "purchased",
  },
  {
    id: "3",
    name: "Parents' Anniversary Trip",
    description: "Contributing to a weekend getaway for Mom & Dad",
    recipient: "Mom & Dad",
    recipientInitials: "MD",
    occasion: "Anniversary",
    occasionDate: "July 15, 2026",
    daysUntil: 51,
    targetAmount: 1000,
    collectedAmount: 450,
    organizer: "You",
    contributors: [
      { id: "1", name: "You", initials: "JD", amount: 200, paid: true },
      { id: "2", name: "Sarah", initials: "SM", amount: 150, paid: true },
      { id: "3", name: "Brother", initials: "BJ", amount: 100, paid: true },
      { id: "4", name: "Aunt Mary", initials: "AM", amount: 0, paid: false },
    ],
    status: "collecting",
  },
];

export default function GroupGiftsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GroupGift | null>(null);

  const activeGifts = groupGifts.filter(
    (g) => g.status === "collecting" || g.status === "purchased"
  );
  const completedGifts = groupGifts.filter((g) => g.status === "delivered");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Group Gifts
          </h1>
          <p className="text-muted-foreground">
            Coordinate gifts with friends and family
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus data-icon="inline-start" />
              Create Group Gift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Group Gift</DialogTitle>
            </DialogHeader>
            <CreateGroupGiftForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-giftra-purple-light">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeGifts.length}</p>
              <p className="text-sm text-muted-foreground">Active Groups</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-giftra-pink-light">
              <DollarSign className="size-5 text-giftra-pink" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${groupGifts.reduce((acc, g) => acc + g.collectedAmount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Collected</p>
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
                {groupGifts.reduce((acc, g) => acc + g.contributors.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Contributors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Group Gifts */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeGifts.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedGifts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGifts.map((gift, index) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GroupGiftCard
                gift={gift}
                onSelect={() => setSelectedGift(gift)}
              />
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGifts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="size-12 text-muted-foreground" />
                <p className="mt-4 font-medium">No completed group gifts yet</p>
                <p className="text-sm text-muted-foreground">
                  Your delivered group gifts will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            completedGifts.map((gift) => (
              <GroupGiftCard
                key={gift.id}
                gift={gift}
                onSelect={() => setSelectedGift(gift)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Group Gift Detail Dialog */}
      <Dialog
        open={!!selectedGift}
        onOpenChange={(open) => !open && setSelectedGift(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedGift && <GroupGiftDetail gift={selectedGift} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupGiftCard({
  gift,
  onSelect,
}: {
  gift: GroupGift;
  onSelect: () => void;
}) {
  const progress = (gift.collectedAmount / gift.targetAmount) * 100;
  const paidContributors = gift.contributors.filter((c) => c.paid).length;

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left Side */}
          <div className="flex items-start gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {gift.recipientInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{gift.name}</h3>
                <Badge
                  variant={
                    gift.status === "collecting"
                      ? "secondary"
                      : gift.status === "purchased"
                        ? "default"
                        : "outline"
                  }
                >
                  {gift.status === "collecting"
                    ? "Collecting"
                    : gift.status === "purchased"
                      ? "Purchased"
                      : "Delivered"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                For {gift.recipient} - {gift.occasion}
              </p>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {gift.occasionDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {gift.daysUntil} days
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {gift.contributors.length} contributors
                </span>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <UserPlus className="mr-2 size-4" />
                  Invite People
                </DropdownMenuItem>
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

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              ${gift.collectedAmount} of ${gift.targetAmount} collected
            </span>
            <span className="text-sm font-medium">
              {paidContributors}/{gift.contributors.length} paid
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Gift Item Preview */}
        {gift.giftItem && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Gift className="size-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">{gift.giftItem}</p>
              {gift.giftPrice && (
                <p className="text-xs text-muted-foreground">
                  ${gift.giftPrice}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contributors Preview */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-2">
            {gift.contributors.slice(0, 4).map((contributor) => (
              <Avatar
                key={contributor.id}
                className="size-8 border-2 border-background"
              >
                <AvatarFallback
                  className={`text-xs ${contributor.paid ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {contributor.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {gift.contributors.length > 4 && (
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                +{gift.contributors.length - 4}
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            Organized by {gift.organizer}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupGiftDetail({ gift }: { gift: GroupGift }) {
  const progress = (gift.collectedAmount / gift.targetAmount) * 100;

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {gift.recipientInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle>{gift.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              For {gift.recipient} - {gift.occasion}
            </p>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6 mt-6">
        {/* Description */}
        {gift.description && (
          <p className="text-muted-foreground">{gift.description}</p>
        )}

        {/* Progress Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Collection Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${gift.collectedAmount} collected
              </span>
              <span className="font-medium">${gift.targetAmount} goal</span>
            </div>
          </CardContent>
        </Card>

        {/* Gift Item */}
        {gift.giftItem && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Gift</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-lg bg-giftra-purple-light">
                  <Gift className="size-8 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{gift.giftItem}</p>
                  {gift.giftPrice && (
                    <p className="text-xl font-bold text-primary">
                      ${gift.giftPrice}
                    </p>
                  )}
                </div>
                <Button>
                  View Item
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contributors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Contributors</CardTitle>
            <Button variant="outline" size="sm">
              <UserPlus data-icon="inline-start" />
              Invite
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {gift.contributors.map((contributor) => (
              <div
                key={contributor.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback
                      className={
                        contributor.paid
                          ? "bg-primary/10 text-primary"
                          : "bg-muted"
                      }
                    >
                      {contributor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{contributor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${contributor.amount}
                    </p>
                  </div>
                </div>
                {contributor.paid ? (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 bg-green-50"
                  >
                    <CheckCircle className="mr-1 size-3" />
                    Paid
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-200 bg-yellow-50"
                  >
                    <AlertCircle className="mr-1 size-3" />
                    Pending
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function CreateGroupGiftForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Group Gift Name</Label>
        <Input id="name" placeholder="e.g., Sarah's Birthday Gift" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select person..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sarah">Sarah Mitchell</SelectItem>
              <SelectItem value="mom">Mom (Jane)</SelectItem>
              <SelectItem value="dad">Dad (Robert)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="occasion">Occasion</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select occasion..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="anniversary">Anniversary</SelectItem>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="baby-shower">Baby Shower</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="target">Target Amount ($)</Label>
        <Input id="target" type="number" placeholder="500" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="What are you collecting for?"
          rows={2}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Group Gift</Button>
      </div>
    </form>
  );
}
