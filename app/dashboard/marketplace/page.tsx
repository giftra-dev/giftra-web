"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Filter, 
  Heart, 
  Star, 
  ShoppingCart, 
  Sparkles,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  X,
  Tag,
  Truck,
  Shield,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const categories = [
  { id: "all", name: "All Gifts", count: 1240 },
  { id: "experiences", name: "Experiences", count: 186 },
  { id: "tech", name: "Tech & Gadgets", count: 324 },
  { id: "home", name: "Home & Living", count: 215 },
  { id: "fashion", name: "Fashion & Accessories", count: 298 },
  { id: "wellness", name: "Wellness & Self-Care", count: 167 },
  { id: "food", name: "Food & Drinks", count: 143 },
  { id: "books", name: "Books & Media", count: 89 },
]

const products = [
  {
    id: 1,
    name: "Personalized Star Map",
    description: "Custom night sky print of any special date and location",
    price: 49.99,
    originalPrice: 69.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
    reviews: 2847,
    category: "home",
    tags: ["Personalized", "Romantic", "Anniversary"],
    aiRecommended: true,
    freeShipping: true,
    deliveryTime: "3-5 days",
  },
  {
    id: 2,
    name: "Spa Day Experience",
    description: "Full day spa package with massage, facial, and lunch",
    price: 189.00,
    originalPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 1523,
    category: "experiences",
    tags: ["Relaxation", "Self-Care", "Luxury"],
    aiRecommended: true,
    freeShipping: false,
    deliveryTime: "E-voucher",
  },
  {
    id: 3,
    name: "Smart Home Starter Kit",
    description: "Everything needed to start a smart home journey",
    price: 299.99,
    originalPrice: 399.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 892,
    category: "tech",
    tags: ["Tech", "Modern", "Practical"],
    aiRecommended: false,
    freeShipping: true,
    deliveryTime: "2-3 days",
  },
  {
    id: 4,
    name: "Artisan Chocolate Collection",
    description: "Handcrafted chocolates from world-renowned chocolatiers",
    price: 65.00,
    originalPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
    reviews: 3241,
    category: "food",
    tags: ["Gourmet", "Indulgent", "Classic"],
    aiRecommended: true,
    freeShipping: true,
    deliveryTime: "1-2 days",
  },
  {
    id: 5,
    name: "Cashmere Scarf",
    description: "Luxuriously soft 100% cashmere scarf in elegant colors",
    price: 149.00,
    originalPrice: 199.00,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 756,
    category: "fashion",
    tags: ["Luxury", "Classic", "Winter"],
    aiRecommended: false,
    freeShipping: true,
    deliveryTime: "3-5 days",
  },
  {
    id: 6,
    name: "Meditation App Subscription",
    description: "1-year premium subscription to top meditation app",
    price: 69.99,
    originalPrice: 99.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 4521,
    category: "wellness",
    tags: ["Mindfulness", "Digital", "Self-Care"],
    aiRecommended: true,
    freeShipping: false,
    deliveryTime: "Instant",
  },
  {
    id: 7,
    name: "Cooking Class Experience",
    description: "Learn to cook authentic cuisine with a professional chef",
    price: 125.00,
    originalPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
    reviews: 892,
    category: "experiences",
    tags: ["Learning", "Fun", "Foodie"],
    aiRecommended: false,
    freeShipping: false,
    deliveryTime: "E-voucher",
  },
  {
    id: 8,
    name: "Wireless Earbuds Pro",
    description: "Premium noise-cancelling earbuds with spatial audio",
    price: 249.00,
    originalPrice: 299.00,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 2156,
    category: "tech",
    tags: ["Tech", "Music", "Practical"],
    aiRecommended: true,
    freeShipping: true,
    deliveryTime: "1-2 days",
  },
]

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("recommended")
  const [favorites, setFavorites] = useState<number[]>([])
  const [cart, setCart] = useState<number[]>([])

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const addToCart = (id: number) => {
    if (!cart.includes(id)) {
      setCart(prev => [...prev, id])
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <ShoppingCart className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gift Marketplace</h1>
            <p className="text-muted-foreground">Discover perfect gifts curated by AI</p>
          </div>
        </div>
      </div>

      {/* AI Suggestion Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-4 border border-primary/20"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/20">
            <Sparkles className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">AI Gift Suggestions Available</p>
            <p className="text-sm text-muted-foreground">
              Based on your relationships, Gigi has highlighted 4 perfect gift matches
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
            View Suggestions
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search gifts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-card border-border/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-border/50">
                <SlidersHorizontal />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Refine your gift search</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" className="w-24" />
                    <span className="text-muted-foreground">to</span>
                    <Input placeholder="Max" className="w-24" />
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Delivery</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="free-shipping" />
                      <Label htmlFor="free-shipping">Free Shipping</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="instant" />
                      <Label htmlFor="instant">Instant Delivery</Label>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2].map(rating => (
                      <div key={rating} className="flex items-center gap-2">
                        <Checkbox id={`rating-${rating}`} />
                        <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1">
                          {rating}+ <Star className="size-3 fill-amber-400 text-amber-400" />
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center border border-border/50 rounded-lg p-1 bg-card">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={selectedCategory === category.id 
              ? "bg-primary hover:bg-primary/90 shrink-0" 
              : "border-border/50 shrink-0"
            }
          >
            {category.name}
            <Badge variant="secondary" className="ml-2 text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className={viewMode === "grid" 
        ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
        : "flex flex-col gap-4"
      }>
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg ${
                viewMode === "list" ? "flex flex-row" : ""
              }`}>
                <div className={`relative ${viewMode === "list" ? "w-48 shrink-0" : ""}`}>
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.aiRecommended && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary/90 text-white gap-1">
                          <Sparkles className="size-3" />
                          AI Pick
                        </Badge>
                      </div>
                    )}
                    {product.originalPrice && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="destructive" className="bg-red-500">
                          Sale
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-3 right-3 size-8 bg-white/90 hover:bg-white shadow-md"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart className={`size-4 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </Button>
                </div>
                
                <CardContent className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      {product.freeShipping && (
                        <span className="flex items-center gap-1">
                          <Truck className="size-3" /> Free Shipping
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {product.deliveryTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => addToCart(product.id)}
                      className={cart.includes(product.id) ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {cart.includes(product.id) ? "Added" : "Add to Cart"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No gifts found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={() => {
            setSearchQuery("")
            setSelectedCategory("all")
          }}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button size="lg" className="rounded-full shadow-xl gap-2 px-6">
            <ShoppingCart />
            View Cart ({cart.length})
          </Button>
        </motion.div>
      )}
    </div>
  )
}
