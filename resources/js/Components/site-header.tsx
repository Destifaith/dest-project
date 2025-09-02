"use client"

import * as React from "react"
import { usePage, router } from "@inertiajs/react"
import { Separator } from "@/Components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/Components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the User type (avatar optional)
interface User {
  name: string
  email: string
  avatar?: string | null
}

export function SiteHeader() {
  const { auth } = usePage().props as { auth?: { user?: User } }

  // Provide defaults if user or avatar is missing
  const user: User = {
    name: auth?.user?.name ?? "Guest",
    email: auth?.user?.email ?? "guest@example.com",
    avatar: auth?.user?.avatar ?? null, // null means no avatar
  }

  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  // Generate initials from the name
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  const handleLogout = () => {
    router.post(route("logout"), undefined, {
      onFinish: () => setDropdownOpen(false),
    })
  }

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">Dashboard</h1>

        <div className="ml-auto flex items-center gap-3">
          <ModeToggle />

          {/* Profile dropdown */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full focus:outline-none">
                <Avatar className="h-8 w-8 rounded-full border">
                  {user.avatar ? (
                    <AvatarImage
                      src={user.avatar}
                      alt={user.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground dark:bg-muted dark:text-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
