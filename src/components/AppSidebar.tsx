import { Home, Search, Flame, PhoneCall, Activity, FileText, MessageCircle, Grid3x3, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search", url: "#", icon: Search },
  { title: "Networks", url: "/networks", icon: Activity },
  { title: "Catalog", url: "/catalog", icon: Grid3x3 },
  { title: "Incidents", url: "#", icon: Flame },
  { title: "On-call", url: "#", icon: PhoneCall },
  { title: "Status", url: "#", icon: FileText },
  { title: "Post-incident", url: "#", icon: MessageCircle },
  { title: "Insights", url: "#", icon: Activity },
];

export function AppSidebar() {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-sidebar-primary font-semibold">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm">
            AD
          </div>
          adhere
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
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
        ))}
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
