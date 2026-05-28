"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllUsers, updateUserProfile } from "@/lib/supabase/queries"
import type { Profile, UserRole } from "@/lib/types/database"
import { Mail, Search, Shield, User, UserCheck } from "lucide-react"

const roleIcons: Record<UserRole, React.ElementType> = {
  customer: User,
  artist: UserCheck,
  admin: Shield,
}

function AdminUsersContent() {
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await getAllUsers())
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = users.filter((user) => {
    const searchText = `${user.full_name || ""} ${user.email} ${user.role}`.toLowerCase()
    return (roleFilter === "all" || user.role === roleFilter) && searchText.includes(search.toLowerCase())
  })

  const handleRoleChange = async (user: Profile, role: UserRole) => {
    setUpdatingUserId(user.id)
    const { data, error } = await updateUserProfile(user.id, { role })
    if (error) {
      console.error("Error updating role:", error)
    } else if (data) {
      setUsers((current) => current.map((item) => (item.id === data.id ? data : item)))
    }
    setUpdatingUserId(null)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage customer, artist, and admin accounts</p>
        </div>

        <div className="grid sm:grid-cols-[1fr_180px] gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="artist">Artists</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No users found</div>
            ) : (
              <div className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const RoleIcon = roleIcons[user.role]
                  return (
                    <div key={user.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <RoleIcon className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{user.full_name || "Unnamed user"}</p>
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                            {user.is_super_admin && <Badge variant="outline">Super Admin</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user, value as UserRole)}
                          disabled={updatingUserId === user.id || user.is_super_admin}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="artist">Artist</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" disabled>
                          {new Date(user.created_at).toLocaleDateString()}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function AdminUsersPage() {
  return <AdminUsersContent />
}
