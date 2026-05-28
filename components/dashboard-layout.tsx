"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Gift, 
  LayoutDashboard, 
  MessageSquare, 
  Package, 
  LogOut,
  User,
  Palette,
  Shield,
  Bell,
  Settings,
  Users,
  History,
  UserCheck
} from "lucide-react"
import { OrderHistoryModal } from "@/components/order-history-modal"
import { cn } from "@/lib/utils"
import { 
  getCurrentProfile, 
  getCurrentUser, 
  signOut,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications 
} from "@/lib/supabase/queries"
import { hasSupabaseConfig } from "@/lib/supabase/config"
import type { UserRole, Profile, Notification } from "@/lib/types/database"

const roleNavItems: Record<UserRole, { href: string; label: string; icon: React.ElementType }[]> = {
  customer: [
    { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customer/requests", label: "My Requests", icon: Package },
    { href: "/customer/chats", label: "Messages", icon: MessageSquare },
  ],
  artist: [
    { href: "/artist/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/artist/orders", label: "Active Orders", icon: Package },
    { href: "/artist/chats", label: "Messages", icon: MessageSquare },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/requests", label: "Requests Queue", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/artists", label: "Artists", icon: UserCheck },
    { href: "/admin/chats", label: "Chat Monitor", icon: MessageSquare },
  ],
}

const roleIcons: Record<UserRole, React.ElementType> = {
  customer: User,
  artist: Palette,
  admin: Shield,
}

interface UserState {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<UserState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false)

  const loadUser = useCallback(async () => {
    if (!hasSupabaseConfig) {
      setIsLoading(false)
      return
    }

    try {
      const [{ user }, profile] = await Promise.all([
        getCurrentUser(),
        getCurrentProfile(),
      ])

      if (!user || !profile) {
        router.push('/auth/login')
        return
      }

      setCurrentUser({
        id: user.id,
        email: user.email ?? profile.email ?? "",
        name: profile.full_name || user.email || "Giftra user",
        role: profile.role,
        avatar: profile.avatar_url ?? undefined,
      })

      // Load unread notifications
      const [count, notificationData] = await Promise.all([
        getUnreadNotificationCount(user.id),
        getNotifications(user.id),
      ])
      setUnreadNotifications(count)
      setNotifications(notificationData)

      // Subscribe to new notifications
      const channel = subscribeToNotifications(user.id, (notification: Notification) => {
        setUnreadNotifications(prev => prev + 1)
        setNotifications(prev => [notification, ...prev])
      })

      return () => {
        channel.unsubscribe()
      }
    } catch (error) {
      console.error('Error loading user:', error)
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    if (!currentUser) return

    const isWrongRoleRoute =
      (pathname.startsWith("/admin") && currentUser.role !== "admin") ||
      (pathname.startsWith("/artist") && currentUser.role !== "artist") ||
      (pathname.startsWith("/customer") && currentUser.role !== "customer")

    if (isWrongRoleRoute) {
      router.replace(`/${currentUser.role}/dashboard`)
    }
  }, [currentUser, pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center animate-pulse">
            <Gift className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to continue</p>
          <Button asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const navItems = roleNavItems[currentUser.role]
  const RoleIcon = roleIcons[currentUser.role]

  const handleLogout = async () => {
    if (hasSupabaseConfig) {
      await signOut()
    }
    router.push("/")
  }

  const handleOpenNotifications = async () => {
    if (!currentUser) return
    setNotificationsOpen(true)
    const data = await getNotifications(currentUser.id)
    setNotifications(data)
  }

  const handleMarkAllRead = async () => {
    if (!currentUser) return
    await markAllNotificationsAsRead(currentUser.id)
    setUnreadNotifications(0)
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })))
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
      setUnreadNotifications((count) => Math.max(0, count - 1))
      setNotifications((current) =>
        current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item)
      )
    }
    if (notification.link) {
      router.push(notification.link)
      setNotificationsOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="h-16 border-b border-sidebar-border flex items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Gift className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">Giftra</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.label === "Messages" && unreadNotifications > 0 && (
                  <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] px-1.5">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center overflow-hidden">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <RoleIcon className="w-5 h-5 text-sidebar-accent-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {currentUser.role}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={handleOpenNotifications}
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] px-1.5">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </Badge>
              )}
            </Button>
            {currentUser.role === "customer" && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                onClick={() => setOrderHistoryOpen(true)}
              >
                <History className="w-4 h-4 mr-2" />
                Order History
              </Button>
            )}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <Link href={`/${currentUser.role}/settings`}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {currentUser.role === "customer" && (
        <OrderHistoryModal
          open={orderHistoryOpen}
          onOpenChange={setOrderHistoryOpen}
          userId={currentUser.id}
        />
      )}

      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>Recent account and order updates</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={unreadNotifications === 0}>
              Mark all read
            </Button>
          </div>
          <ScrollArea className="h-[420px] pr-4">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No notifications yet</div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className="w-full text-left rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.is_read && <span className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
