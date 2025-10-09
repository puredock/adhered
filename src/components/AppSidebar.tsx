import { useState } from "react";
import { Home, Search, Flame, PhoneCall, Activity, FileText, MessageCircle, Grid3x3, Users, Settings, ArrowLeftRight, BookOpen, Mail, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo & Collapse Button */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {isCollapsed ? (
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm mx-auto">
            AC
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex-1">
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
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors",
                  isCollapsed && "mx-auto mt-2"
                )}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-sidebar-foreground" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-sidebar-foreground" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isCollapsed ? "Show" : "Hide"} sidebar (⌘+.)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
          const isPlaceholder = item.url === "#";
          
          if (isPlaceholder) {
            return (
              <TooltipProvider key={item.title}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground w-full text-left",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && item.title}
                    </button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          }
          
          return (
            <TooltipProvider key={item.title}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-0"
                      )
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {!isCollapsed && item.title}
                  </NavLink>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
          })}
        </nav>
      </ScrollArea>

      {/* Organization Section */}
      {!isCollapsed && (
        <div className="p-2 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs text-sidebar-foreground/60 font-medium">
            Your organization
          </div>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors">
            <Users className="w-4 h-4" />
            Pick a team
          </button>
        </div>
      )}
    </aside>
  );
}
