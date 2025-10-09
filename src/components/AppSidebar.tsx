import { Home, Activity, Smartphone, ScanLine, ClipboardCheck, TrendingUp, Users, Settings, ArrowLeftRight, BookOpen, Mail, ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Networks", url: "/networks", icon: Activity },
  { title: "Devices", url: "#", icon: Smartphone },
  { title: "Scans", url: "#", icon: ScanLine },
  { title: "Audits", url: "#", icon: ClipboardCheck },
  { title: "Insights", url: "#", icon: TrendingUp },
];

export function AppSidebar() {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-2 text-sidebar-primary font-semibold hover:bg-sidebar-accent/50 p-2 rounded-md transition-colors">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm">
                AC
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm">Acme Corp</div>
                <div className="text-xs text-sidebar-foreground/60 font-normal">Organization</div>
              </div>
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 ml-4 bg-popover" align="start">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Switch account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Activity className="w-4 h-4 mr-2" />
              Changelog
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <BookOpen className="w-4 h-4 mr-2" />
              Help center
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Mail className="w-4 h-4 mr-2" />
              Contact support
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isPlaceholder = item.url === "#";
          
          if (isPlaceholder) {
            return (
              <button
                key={item.title}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground w-full text-left"
              >
                <item.icon className="w-4 h-4" />
                {item.title}
              </button>
            );
          }
          
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      {/* Organization Section */}
      <div className="p-2 border-t border-sidebar-border">
        <div className="px-3 py-2 text-xs text-sidebar-foreground/60 font-medium">
          Your organization
        </div>
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors">
          <Users className="w-4 h-4" />
          Pick a team
        </button>
      </div>
    </aside>
  );
}
