"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Settings,
  User,
  Bell,
  CreditCard,
  Shield,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Key,
  Trash2,
  LogOut,
  ChevronRight,
  Camera,
  Check,
  Moon,
  Sun,
  Monitor,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [theme, setTheme] = useState("system")

  const settingsSections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Settings className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 shrink-0">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === section.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <section.icon className="size-4" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Profile Photo */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                  <CardDescription>Update your profile picture</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="size-24 border-4 border-primary/20">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">JD</AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors">
                        <Camera className="size-4" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        JPG, GIF or PNG. Max size of 2MB.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Upload</Button>
                        <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" className="bg-background" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john@example.com" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthday">Birthday</Label>
                    <Input id="birthday" type="date" defaultValue="1990-06-15" className="bg-background" />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription */}
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="size-5 text-primary" />
                        Giftra Pro
                      </CardTitle>
                      <CardDescription>You&apos;re on the Pro plan</CardDescription>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">$12.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                      <p className="text-sm text-muted-foreground">Next billing date: Feb 15, 2024</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">Change Plan</Button>
                      <Button variant="ghost" className="text-destructive">Cancel</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      title: "Upcoming Occasions",
                      description: "Get reminded about birthdays, anniversaries, and special dates",
                      email: true,
                      push: true,
                    },
                    {
                      title: "AI Gift Recommendations",
                      description: "Receive personalized gift suggestions from Gigi",
                      email: true,
                      push: false,
                    },
                    {
                      title: "Order Updates",
                      description: "Shipping confirmations and delivery notifications",
                      email: true,
                      push: true,
                    },
                    {
                      title: "Group Gift Activity",
                      description: "Updates when friends contribute or comment",
                      email: false,
                      push: true,
                    },
                    {
                      title: "Wishlist Updates",
                      description: "Price drops and availability alerts",
                      email: true,
                      push: false,
                    },
                    {
                      title: "Marketing & Promotions",
                      description: "Special offers and new features",
                      email: false,
                      push: false,
                    },
                  ].map((pref, index) => (
                    <div key={index} className="flex items-start justify-between gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{pref.title}</p>
                        <p className="text-sm text-muted-foreground">{pref.description}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-muted-foreground" />
                          <Switch defaultChecked={pref.email} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="size-4 text-muted-foreground" />
                          <Switch defaultChecked={pref.push} />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "billing" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Payment Methods */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
                        <CreditCard className="size-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/26</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Default</Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <CreditCard className="size-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "Jan 15, 2024", description: "Pro Subscription", amount: "$12.99" },
                      { date: "Dec 15, 2023", description: "Pro Subscription", amount: "$12.99" },
                      { date: "Nov 15, 2023", description: "Pro Subscription", amount: "$12.99" },
                    ].map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{transaction.amount}</span>
                          <Button variant="ghost" size="sm">Receipt</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "privacy" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Password */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password regularly for security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" className="bg-background" />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button>Update Password</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Auth */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-green-500/10">
                        <Shield className="size-6 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">2FA is enabled</p>
                        <p className="text-sm text-muted-foreground">Using authenticator app</p>
                      </div>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Connected Accounts */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>Manage your linked social accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Google", connected: true, email: "john@gmail.com" },
                    { name: "Apple", connected: false, email: null },
                    { name: "Facebook", connected: false, email: null },
                  ].map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                          <Globe className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium">{account.name}</p>
                          {account.email && (
                            <p className="text-sm text-muted-foreground">{account.email}</p>
                          )}
                        </div>
                      </div>
                      <Button variant={account.connected ? "outline" : "default"} size="sm">
                        {account.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions for your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently remove your account and all data</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Theme */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Choose your preferred color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { id: "light", label: "Light", icon: Sun },
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "system", label: "System", icon: Monitor },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id)}
                        className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-colors ${
                          theme === option.id
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-primary/30"
                        }`}
                      >
                        <div className={`p-3 rounded-full ${theme === option.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <option.icon className="size-6" />
                        </div>
                        <span className="font-medium">{option.label}</span>
                        {theme === option.id && (
                          <Check className="size-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Language */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                  <CardDescription>Set your preferred language and regional settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select defaultValue="usd">
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="cad">CAD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="est">
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="est">Eastern Time (ET)</SelectItem>
                        <SelectItem value="cst">Central Time (CT)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
