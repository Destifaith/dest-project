import * as React from "react"
import { usePage } from "@inertiajs/react"
import { ChevronRight, Map, BookOpen, GalleryVerticalEnd, Settings2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/Components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/Components/ui/sidebar"

// ✅ Nav structure
const navMain = [
  {
    title: "Accommodations",
    icon: Map,
    items: [
      {
        title: "Hotels",
        url: "#",
        items: [
          { title: "Add", url: "#" },
          { title: "Manage", url: "#" },
          { title: "Bookings", url: "#" },
          { title: "Availability", url: "#" },
        ],
      },
      {
        title: "Airbnb",
        url: "#",
        items: [
          { title: "Add", url: "#" },
          { title: "Manage", url: "#" },
          { title: "Bookings", url: "#" },
          { title: "Availability", url: "#" },
        ],
      },
    ],
  },
  {
    title: "Foods & Drinks",
    icon: BookOpen,
    items: [
      {
        title: "Restaurants",
        url: "#",
        items: [
          { title: "Add", url: "/dashboard/food/restaurants/add" },
          { title: "Manage", url: "/dashboard/food/restaurants/manage" },
          { title: "Bookings", url: "#" },
          { title: "Menu", url: "#" },
        ],
      },
      {
        title: "Eateries",
        url: "#",
        items: [
          { title: "Add", url: "/dashboard/food/eateries/add" },
          { title: "Manage", url: "/dashboard/food/eateries/manage" },
        ],
      },
      {
        title: "Pubs & Lounges",
        url: "#",
        items: [
          { title: "Add", url: "#" },
          { title: "Manage", url: "#" },
          { title: "Bookings", url: "#" },
          { title: "Menu", url: "#" },
        ],
      },
    ],
  },
  {
    title: "Entertainment",
    icon: GalleryVerticalEnd,
    items: [
      {
        title: "Events",
        url: "#",
        items: [
          { title: "Add", url: "/dashboard/entertainment/events/add" },
          { title: "Manage", url: "/dashboard/entertainment/events/manage" },
          { title: "Bookings", url: "#" },
          { title: "Availability", url: "#" },
        ],
      },
      {
        title: "Tour Packages",
        url: "#",
        items: [
          { title: "Add", url: "#" },
          { title: "Manage", url: "#" },
          { title: "Bookings", url: "#" },
          { title: "Availability", url: "#" },
        ],
      },
      {
        title: "Excursions",
        url: "#",
        items: [
          { title: "Add", url: "#" },
          { title: "Manage", url: "#" },
          { title: "Bookings", url: "#" },
          { title: "Availability", url: "#" },
        ],
      },
      {
        title: "Beaches",
        url: "#",
        items: [
          { title: "Add", url: "/dashboard/entertainment/beaches/add" },
          { title: "Manage", url: "/dashboard/entertainment/beaches/manage" },
        ],
      },
      {
        title: "Swimming Pool",
        url: "#",
        items: [
          { title: "Add", url: "/dashboard/entertainment/pool/add" },
          { title: "Manage", url: "/dashboard/entertainment/pool/manage" },
        ],
      },
    ],
  },
  {
    title: "Fitness & Health",
    icon: Settings2,
    items: [
      {
        title: "Spa",
        url: "/dashboard/entertainment/spa/add",
        items: [
          { title: "Add", url: "/dashboard/entertainment/spa/add" },
          { title: "Manage", url: "/dashboard/entertainment/spa/manage" },
          { title: "Bookings", url: "#" },
          { title: "Availability", url: "#" },
        ],
      },
      {
        title: "Gym",
        url: "/dashboard/entertainment/gym/add",
        items: [
          { title: "Add", url: "/dashboard/entertainment/gym/add" },
          { title: "Manage", url: "/dashboard/entertainment/gym/manage" },
          { title: "Bookings", url: "#" },
          { title: "Availability", url: "#" },
        ],
      },
    ],
  },
  {
    title: "General",
    icon: Settings2,
    items: [
      {
        title: "Job Advertisements",
        url: "#",
        items: [
          { title: "Add", url: "#" },
          { title: "Manage", url: "#" },
          { title: "Applications", url: "#" },
        ],
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // ✅ Correctly typed now (auth.user has role, name, etc.)
  const { auth } = usePage().props

  return (
    <Sidebar {...props}>
      {/* Sidebar Header with User Info */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold cursor-pointer">
                  {auth.user.name
                    .split(" ")
                    .map((n) => n.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join("")}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col">
                  <span className="font-medium">{auth.user.name}</span>
                  <span className="text-xs text-muted-foreground">{auth.user.role}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span>Hospitality Answer</span>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="gap-0">
        {navMain.map((group) => (
          <Collapsible key={group.title} defaultOpen className="group/collapsible">
            <SidebarGroup>
              {/* Group Level */}
              <SidebarGroupLabel
                asChild
                className="group/label text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  <group.icon className="mr-2 h-4 w-4" />
                  {group.title}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent>
                <SidebarGroupContent>
                  {group.items.map((category) => (
                    <Collapsible
                      key={category.title}
                      defaultOpen={false}
                      className="ml-4 group/collapsible"
                    >
                      {/* Child Level */}
                      <SidebarGroupLabel
                        asChild
                        className="group/label text-sm pl-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <CollapsibleTrigger>
                          {category.title}
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                      </SidebarGroupLabel>

                      <CollapsibleContent>
                        <SidebarMenu className="ml-6">
                          {category.items?.map((sub) => (
                            <SidebarMenuItem key={sub.title}>
                              <SidebarMenuButton asChild>
                                <a href={sub.url}>{sub.title}</a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
