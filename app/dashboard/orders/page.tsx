"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  Gift,
  User,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const orders = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    recipient: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      relationship: "Sister",
    },
    occasion: "Birthday",
    items: [
      {
        name: "Personalized Star Map",
        price: 49.99,
        image: "/placeholder.svg?height=80&width=80",
        quantity: 1,
      }
    ],
    total: 49.99,
    status: "delivered",
    statusText: "Delivered",
    deliveredDate: "2024-01-18",
    trackingNumber: "1Z999AA10123456784",
    carrier: "UPS",
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-20",
    recipient: {
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      relationship: "Best Friend",
    },
    occasion: "Thank You",
    items: [
      {
        name: "Wireless Earbuds Pro",
        price: 249.00,
        image: "/placeholder.svg?height=80&width=80",
        quantity: 1,
      },
      {
        name: "Artisan Chocolate Collection",
        price: 65.00,
        image: "/placeholder.svg?height=80&width=80",
        quantity: 1,
      }
    ],
    total: 314.00,
    status: "shipped",
    statusText: "In Transit",
    estimatedDelivery: "2024-01-25",
    trackingNumber: "1Z999AA10123456785",
    carrier: "FedEx",
    progress: 65,
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-22",
    recipient: {
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      relationship: "Mom",
    },
    occasion: "Anniversary",
    items: [
      {
        name: "Spa Day Experience",
        price: 189.00,
        image: "/placeholder.svg?height=80&width=80",
        quantity: 1,
      }
    ],
    total: 189.00,
    status: "processing",
    statusText: "Processing",
    estimatedShip: "2024-01-24",
  },
  {
    id: "ORD-2024-004",
    date: "2024-01-10",
    recipient: {
      name: "David Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      relationship: "Dad",
    },
    occasion: "Christmas",
    items: [
      {
        name: "Smart Home Starter Kit",
        price: 299.99,
        image: "/placeholder.svg?height=80&width=80",
        quantity: 1,
      }
    ],
    total: 299.99,
    status: "delivered",
    statusText: "Delivered",
    deliveredDate: "2024-01-13",
    trackingNumber: "1Z999AA10123456783",
    carrier: "USPS",
  },
]

const statusColors: Record<string, string> = {
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  shipped: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  processing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
}

const statusIcons: Record<string, React.ReactNode> = {
  delivered: <CheckCircle className="size-4" />,
  shipped: <Truck className="size-4" />,
  processing: <Clock className="size-4" />,
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTab = activeTab === "all" || order.status === activeTab
    return matchesSearch && matchesTab
  })

  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === "delivered").length,
    inTransit: orders.filter(o => o.status === "shipped").length,
    processing: orders.filter(o => o.status === "processing").length,
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Package className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order History</h1>
            <p className="text-muted-foreground">Track and manage your gift orders</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 mb-6 sm:grid-cols-4">
        {[
          { label: "Total Orders", value: stats.total, icon: Package, color: "text-primary" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-green-500" },
          { label: "In Transit", value: stats.inTransit, icon: Truck, color: "text-blue-500" },
          { label: "Processing", value: stats.processing, icon: Clock, color: "text-amber-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="size-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                {/* Order Header */}
                <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12 border-2 border-primary/20">
                      <AvatarImage src={order.recipient.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {order.recipient.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{order.recipient.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {order.recipient.relationship}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Gift className="size-3" /> {order.occasion}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" /> {new Date(order.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={`gap-1 ${statusColors[order.status]}`}>
                      {statusIcons[order.status]}
                      {order.statusText}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="size-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="size-4 mr-2" />
                          Reorder
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="size-4 mr-2" />
                          Contact Support
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Progress Bar for Shipped Orders */}
                {order.status === "shipped" && order.progress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Shipping Progress</span>
                      <span className="font-medium">Est. {new Date(order.estimatedDelivery!).toLocaleDateString()}</span>
                    </div>
                    <Progress value={order.progress} className="h-2" />
                  </div>
                )}

                {/* Order Items */}
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/30 mb-4">
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-4">
                      <div className="size-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-col gap-4 pt-4 border-t border-border/50 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Order {order.id}</span>
                    {order.trackingNumber && (
                      <span className="flex items-center gap-1 text-primary cursor-pointer hover:underline">
                        <MapPin className="size-3" />
                        Track Package
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="text-xl font-bold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-muted mb-4">
            <Package className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search" : "Start shopping to see your orders here"}
          </p>
          <Button>
            <Gift className="mr-2" />
            Browse Gifts
          </Button>
        </div>
      )}
    </div>
  )
}
