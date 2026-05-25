"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Heart,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Lock,
  Globe,
  Gift,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface WishlistItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  url?: string;
  priority: "high" | "medium" | "low";
  category: string;
  addedDate: string;
  reserved?: boolean;
  reservedBy?: string;
}

interface Wishlist {
  id: string;
  name: string;
  description?: string;
  owner: string;
  ownerInitials: string;
  isOwn: boolean;
  isPublic: boolean;
  items: WishlistItem[];
  sharedWith: number;
}

const wishlists: Wishlist[] = [
  {
    id: "1",
    name: "My Birthday Wishlist",
    description: "Things I'd love for my birthday!",
    owner: "You",
    ownerInitials: "JD",
    isOwn: true,
    isPublic: true,
    items: [
      {
        id: "1",
        name: "Sony WH-1000XM5 Headphones",
        description: "Noise-canceling wireless headphones",
        price: "$349",
        url: "https://example.com",
        priority: "high",
        category: "Electronics",
        addedDate: "May 15, 2026",
      },
      {
        id: "2",
        name: "Ember Temperature Control Mug",
        description: "Smart mug that keeps drinks at perfect temp",
        price: "$149",
        priority: "medium",
        category: "Home",
        addedDate: "May 10, 2026",
        reserved: true,
        reservedBy: "Sarah",
      },
      {
        id: "3",
        name: "Kindle Paperwhite",
        description: "E-reader with warm light",
        price: "$139",
        priority: "medium",
        category: "Electronics",
        addedDate: "May 5, 2026",
      },
    ],
    sharedWith: 5,
  },
  {
    id: "2",
    name: "Home Office Upgrades",
    owner: "You",
    ownerInitials: "JD",
    isOwn: true,
    isPublic: false,
    items: [
      {
        id: "4",
        name: "Ergonomic Chair",
        price: "$450",
        priority: "high",
        category: "Furniture",
        addedDate: "April 20, 2026",
      },
      {
        id: "5",
        name: "Desk Mat",
        price: "$35",
        priority: "low",
        category: "Accessories",
        addedDate: "April 15, 2026",
      },
    ],
    sharedWith: 0,
  },
  {
    id: "3",
    name: "Sarah's Birthday",
    description: "Ideas for Sarah's upcoming birthday",
    owner: "Sarah Mitchell",
    ownerInitials: "SM",
    isOwn: false,
    isPublic: true,
    items: [
      {
        id: "6",
        name: "Vintage Camera",
        price: "$200",
        priority: "high",
        category: "Photography",
        addedDate: "May 1, 2026",
      },
      {
        id: "7",
        name: "Travel Journal",
        price: "$25",
        priority: "medium",
        category: "Accessories",
        addedDate: "May 1, 2026",
        reserved: true,
        reservedBy: "You",
      },
    ],
    sharedWith: 3,
  },
];

export default function WishlistsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(
    null
  );

  const myWishlists = wishlists.filter((w) => w.isOwn);
  const sharedWishlists = wishlists.filter((w) => !w.isOwn);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Wishlists
          </h1>
          <p className="text-muted-foreground">
            Create and manage wishlists for yourself and others
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus data-icon="inline-start" />
              Create Wishlist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Wishlist</DialogTitle>
            </DialogHeader>
            <CreateWishlistForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search wishlists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-giftra-purple-light">
              <Heart className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{myWishlists.length}</p>
              <p className="text-sm text-muted-foreground">My Wishlists</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-giftra-pink-light">
              <Gift className="size-5 text-giftra-pink" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {wishlists.reduce((acc, w) => acc + w.items.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-giftra-blue-light">
              <Share2 className="size-5 text-giftra-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sharedWishlists.length}</p>
              <p className="text-sm text-muted-foreground">Shared With Me</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wishlists */}
      <Tabs defaultValue="my-wishlists" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-wishlists">My Wishlists</TabsTrigger>
          <TabsTrigger value="shared">Shared With Me</TabsTrigger>
        </TabsList>

        <TabsContent value="my-wishlists" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myWishlists.map((wishlist, index) => (
              <motion.div
                key={wishlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <WishlistCard
                  wishlist={wishlist}
                  onSelect={() => setSelectedWishlist(wishlist)}
                />
              </motion.div>
            ))}
            {/* Add New Card */}
            <Card
              className="flex cursor-pointer items-center justify-center border-dashed hover:bg-muted/50 transition-colors min-h-[200px]"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <div className="text-center">
                <Plus className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Create New Wishlist</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sharedWishlists.map((wishlist, index) => (
              <motion.div
                key={wishlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <WishlistCard
                  wishlist={wishlist}
                  onSelect={() => setSelectedWishlist(wishlist)}
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Wishlist Detail Dialog */}
      <Dialog
        open={!!selectedWishlist}
        onOpenChange={(open) => !open && setSelectedWishlist(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedWishlist && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {selectedWishlist.name}
                      {selectedWishlist.isPublic ? (
                        <Globe className="size-4 text-muted-foreground" />
                      ) : (
                        <Lock className="size-4 text-muted-foreground" />
                      )}
                    </DialogTitle>
                    {selectedWishlist.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedWishlist.description}
                      </p>
                    )}
                  </div>
                  {selectedWishlist.isOwn && (
                    <Button variant="outline" size="sm">
                      <Share2 data-icon="inline-start" />
                      Share
                    </Button>
                  )}
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {selectedWishlist.items.map((item) => (
                  <WishlistItemCard
                    key={item.id}
                    item={item}
                    isOwn={selectedWishlist.isOwn}
                  />
                ))}
                {selectedWishlist.isOwn && (
                  <Button variant="outline" className="w-full">
                    <Plus data-icon="inline-start" />
                    Add Item
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WishlistCard({
  wishlist,
  onSelect,
}: {
  wishlist: Wishlist;
  onSelect: () => void;
}) {
  return (
    <Card
      className="group h-full cursor-pointer transition-all hover:shadow-md"
      onClick={onSelect}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {wishlist.ownerInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{wishlist.name}</h3>
              <p className="text-sm text-muted-foreground">{wishlist.owner}</p>
            </div>
          </div>
          {wishlist.isPublic ? (
            <Globe className="size-4 text-muted-foreground" />
          ) : (
            <Lock className="size-4 text-muted-foreground" />
          )}
        </div>

        {wishlist.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {wishlist.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{wishlist.items.length} items</span>
          {wishlist.isOwn && wishlist.sharedWith > 0 && (
            <span>Shared with {wishlist.sharedWith}</span>
          )}
        </div>

        {/* Preview items */}
        <div className="mt-4 flex flex-wrap gap-1">
          {wishlist.items.slice(0, 3).map((item) => (
            <Badge key={item.id} variant="outline" className="text-xs">
              {item.name.length > 15
                ? item.name.substring(0, 15) + "..."
                : item.name}
            </Badge>
          ))}
          {wishlist.items.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{wishlist.items.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WishlistItemCard({
  item,
  isOwn,
}: {
  item: WishlistItem;
  isOwn: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border p-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Gift className="size-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{item.name}</h4>
          {item.priority === "high" && (
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
          )}
          {item.reserved && (
            <Badge variant="secondary" className="text-xs">
              Reserved{isOwn ? "" : ` by ${item.reservedBy}`}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
            {item.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-4">
          <span className="font-semibold text-primary">{item.price}</span>
          <Badge variant="outline" className="text-xs">
            {item.category}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isOwn && !item.reserved && (
          <Button size="sm">
            <ShoppingCart data-icon="inline-start" />
            Reserve
          </Button>
        )}
        {item.url && (
          <Button variant="ghost" size="icon-sm" asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
            </a>
          </Button>
        )}
        {isOwn && (
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
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function CreateWishlistForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Wishlist Name</Label>
        <Input id="name" placeholder="e.g., Birthday Wishlist" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="What's this wishlist for?"
          rows={2}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <Label htmlFor="public">Make Public</Label>
          <p className="text-sm text-muted-foreground">
            Allow others to view and share this wishlist
          </p>
        </div>
        <Switch id="public" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Wishlist</Button>
      </div>
    </form>
  );
}
