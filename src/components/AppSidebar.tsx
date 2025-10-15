import {
    Activity,
    AlertCircle,
    ArrowLeftRight,
    BookOpen,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    Home,
    Layers,
    LogOut,
    Mail,
    ScanLine,
    Settings,
    Smartphone,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const navItems = [{ title: 'Home', url: '/', icon: Home }]

const assetItems = [
    { title: 'Networks', url: '/networks', icon: Activity },
    { title: 'Devices', url: '/catalog', icon: Smartphone },
]

const actionItems = [
    { title: 'Audits', url: '/audits', icon: ClipboardCheck },
    { title: 'Scans', url: '/scans', icon: ScanLine },
    { title: 'Issues', url: '#', icon: AlertCircle },
    { title: 'Insights', url: '#', icon: TrendingUp },
]

export function AppSidebar() {
    const [isAssetsOpen, setIsAssetsOpen] = useState(true)
    const [isActionsOpen, setIsActionsOpen] = useState(true)

    return (
        <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-sidebar-border">
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                        <div className="flex items-center gap-2 text-sidebar-primary font-semibold hover:bg-sidebar-accent/50 p-2 rounded-md transition-colors">
                            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm">
                                IG
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm">IGS</div>
                                <div className="text-xs text-sidebar-foreground/60 font-normal">
                                    Organization
                                </div>
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
                {navItems.map(item => (
                    <NavLink
                        key={item.title}
                        to={item.url}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                                isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                            )
                        }
                    >
                        <item.icon className="w-4 h-4" />
                        {item.title}
                    </NavLink>
                ))}

                {/* Assets Collapsible */}
                <Collapsible open={isAssetsOpen} onOpenChange={setIsAssetsOpen}>
                    <CollapsibleTrigger className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground w-full text-left">
                        <Layers className="w-4 h-4" />
                        <span className="flex-1">Assets</span>
                        {isAssetsOpen ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-1">
                        {assetItems.map(item => {
                            const isPlaceholder = item.url === '#'

                            if (isPlaceholder) {
                                return (
                                    <button
                                        key={item.title}
                                        className="flex items-center gap-3 pl-10 pr-3 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground w-full text-left"
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.title}
                                    </button>
                                )
                            }

                            return (
                                <NavLink
                                    key={item.title}
                                    to={item.url}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 pl-10 pr-3 py-2 rounded-md text-sm transition-colors',
                                            isActive
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                                        )
                                    }
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                </NavLink>
                            )
                        })}
                    </CollapsibleContent>
                </Collapsible>

                {/* Actions Collapsible */}
                <Collapsible open={isActionsOpen} onOpenChange={setIsActionsOpen}>
                    <CollapsibleTrigger className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground w-full text-left">
                        <Zap className="w-4 h-4" />
                        <span className="flex-1">Actions</span>
                        {isActionsOpen ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-1">
                        {actionItems.map(item => {
                            const isPlaceholder = item.url === '#'

                            if (isPlaceholder) {
                                return (
                                    <button
                                        key={item.title}
                                        className="flex items-center gap-3 pl-10 pr-3 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground w-full text-left"
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.title}
                                    </button>
                                )
                            }

                            return (
                                <NavLink
                                    key={item.title}
                                    to={item.url}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 pl-10 pr-3 py-2 rounded-md text-sm transition-colors',
                                            isActive
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                                        )
                                    }
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                </NavLink>
                            )
                        })}
                    </CollapsibleContent>
                </Collapsible>
            </nav>

            {/* User Profile Section */}
            <div className="p-2 border-t border-sidebar-border">
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src="https://github.com/shadcn.png" alt="Harish Navnit" />
                                <AvatarFallback>HN</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-medium">Harish Navnit</div>
                                <div className="text-xs text-sidebar-foreground/60">
                                    hrajasek@ic.ac.uk
                                </div>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2 ml-2 bg-popover" align="start" side="top">
                        <DropdownMenuItem className="cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            User Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    )
}
