"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Gift,
  LayoutDashboard,
  Users,
  Calendar,
  Heart,
  ShoppingBag,
  MessageSquare,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Package,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Gigi Assistant",
    href: "/dashboard/assistant",
    icon: MessageSquare,
    badge: "AI",
  },
  {
    name: "Relationships",
    href: "/dashboard/relationships",
    icon: Users,
  },
  {
    name: "Occasions",
    href: "/dashboard/occasions",
    icon: Calendar,
  },
  {
    name: "Wishlists",
    href: "/dashboard/wishlists",
    icon: Heart,
  },
  {
    name: "Group Gifts",
    href: "/dashboard/group-gifts",
    icon: UsersRound,
  },
  {
    name: "Marketplace",
    href: "/dashboard/marketplace",
    icon: ShoppingBag,
  },
  {
    name: "My Orders",
    href: "/dashboard/orders",
    icon: Package,
  },
];

const bottomNavigation = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex size-9 items-center justify-center rounded-xl gradient-primary">
          <Gift className="size-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gradient">Giftra</span>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-5" />
                {item.name}
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "ml-auto",
                      isActive && "bg-primary-foreground/20 text-primary-foreground"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="px-3 py-4">
        <Separator className="mb-4" />
        <nav className="flex flex-col gap-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 lg:hidden"
          >
            <Menu />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Spacer for mobile menu button */}
      <div className="w-10 lg:hidden" />

      {/* Search - hidden on mobile for now */}
      <div className="hidden flex-1 lg:block" />

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  JD
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">
                John Doe
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-destructive">
              <Link href="/login">
                <LogOut className="mr-2 size-4" />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
