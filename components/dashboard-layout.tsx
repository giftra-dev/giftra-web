"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  History
} from "lucide-react"
import { OrderHistoryModal } from "@/components/order-history-modal"
import { cn } from "@/lib/utils"
import { 
  getCurrentProfile, 
  getCurrentUser, 
  signOut,
  getUnreadNotificationCount,
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
      const count = await getUnreadNotificationCount(user.id)
      setUnreadNotifications(count)

      // Subscribe to new notifications
      const channel = subscribeToNotifications(user.id, (notification: Notification) => {
        setUnreadNotifications(prev => prev + 1)
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
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
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
            <Link href={`/${currentUser.role}/settings`}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
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
    </div>
  )
}
