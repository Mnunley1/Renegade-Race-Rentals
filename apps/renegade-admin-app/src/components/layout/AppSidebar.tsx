import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Car,
  FileText,
  Flag,
  MapPin,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigationItems = [
  {
    title: "Rentals",
    url: "/app/rentals",
    icon: FileText,
  },
  {
    title: "Users",
    url: "/app/users",
    icon: Users,
  },
  {
    title: "Vehicles",
    url: "/app/vehicles",
    icon: Car,
  },
  {
    title: "Disputes",
    url: "/app/disputes",
    icon: AlertTriangle,
  },
  {
    title: "Tracks",
    url: "/app/tracks",
    icon: MapPin,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-gray-200 shadow-sm">
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
            <Flag className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-800">Renegade</span>
            <span className="text-sm text-red-600 font-medium">
              Race Rentals
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-700",
                        isActive &&
                          "bg-red-100 text-red-800 shadow-sm border-r-2 border-red-600 font-semibold"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-gray-600 text-center">
          © 2025 Renegade Race Rentals
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
