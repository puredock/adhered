import { useQuery } from '@tanstack/react-query'
import {
    Camera,
    Filter,
    Loader2,
    Monitor,
    Plus,
    Search,
    Smartphone,
    Thermometer,
    Wifi,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddDeviceDialog } from '@/components/AddDeviceDialog'
import { ErrorState } from '@/components/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { getDeviceIcon } from '@/lib/devices'
import { getCycleColor } from '@/lib/ui'

const Catalog = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedSources, setSelectedSources] = useState<string[]>([])
    const [showAddDeviceDialog, setShowAddDeviceDialog] = useState(false)

    const { data, isLoading, error } = useQuery({
        queryKey: ['devices'],
        queryFn: () => api.devices.list(),
    })

    const { data: networksData } = useQuery({
        queryKey: ['networks'],
        queryFn: () => api.networks.list(),
    })

    const devices = data?.devices || []
    const networks = networksData?.networks || []

    const getNetworkInfo = (networkId: string) => {
        return networks.find(n => n.id === networkId)
    }

    // Get unique device categories (device types)
    const availableCategories = useMemo(() => {
        const categories = new Set(devices.map(device => device.device_type))
        return Array.from(categories).sort()
    }, [devices])

    // Get unique sources (networks)
    const availableSources = useMemo(() => {
        const networkIds = new Set(devices.map(device => device.network_id))
        return networks
            .filter(network => networkIds.has(network.id))
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [devices, networks])

    const filteredDevices = useMemo(() => {
        let filtered = devices

        // Apply category filter (device type)
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(device => selectedCategories.includes(device.device_type))
        }

        // Apply source filter (network)
        if (selectedSources.length > 0) {
            filtered = filtered.filter(device => selectedSources.includes(device.network_id))
        }

        // Apply search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                device =>
                    device.hostname?.toLowerCase().includes(query) ||
                    device.ip_address.toLowerCase().includes(query) ||
                    device.manufacturer?.toLowerCase().includes(query) ||
                    device.model?.toLowerCase().includes(query),
            )
        }

        return filtered
    }, [devices, searchQuery, selectedCategories, selectedSources])
    const systemTypes = [
        {
            id: 1,
            name: 'Port Scanning',
            description: 'Automated port scanning across all devices',
            entries: '18 devices',
            source: 'Auto-scan',
            iconColor: 'text-yellow-600 bg-yellow-50',
            icon: Activity,
        },
        {
            id: 2,
            name: 'Vulnerability Assessment',
            description: 'CVE database matching and risk scoring',
            entries: '12 issues',
            source: 'Security DB',
            iconColor: 'text-red-600 bg-red-50',
            icon: AlertTriangle,
        },
        {
            id: 3,
            name: 'Compliance Check',
            description: 'Industry standard compliance validation',
            entries: '35 passed',
            source: 'Compliance',
            iconColor: 'text-green-600 bg-green-50',
            icon: CheckCircle2,
        },
        {
            id: 4,
            name: 'Network Monitoring',
            description: 'Real-time network traffic analysis',
            entries: '3 networks',
            source: 'Monitor',
            iconColor: 'text-blue-600 bg-blue-50',
            icon: Activity,
        },
    ]

    return (
        <div className="flex-1 min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Devices</h1>
                                <p className="text-sm text-muted-foreground">
                                    Device types and security assessment categories
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                size="sm"
                                className="bg-accent-foreground text-accent hover:bg-accent-foreground/90"
                                onClick={() => setShowAddDeviceDialog(true)}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add New
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 space-y-6">
                {/* Info Banner - Mint Green */}
                <div className="p-6 rounded-lg bg-gradient-accent border border-accent/20 animate-fade-in">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
                                    <span className="text-sm">👋</span>
                                </div>
                                <span className="font-medium text-accent-foreground">
                                    System recommends
                                </span>
                            </div>
                            <h2 className="text-lg font-semibold text-accent-foreground mb-2">
                                Set up your device monitoring to track security across your network
                            </h2>
                            <Button
                                size="sm"
                                className="bg-accent-foreground text-accent hover:bg-accent-foreground/90"
                            >
                                Set up monitoring
                            </Button>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-20 h-20 rounded-lg bg-white/60 flex items-center justify-center hover-scale">
                                <Monitor className="w-10 h-10 text-accent-foreground/60" />
                            </div>
                            <div className="w-20 h-20 rounded-lg bg-white/60 flex items-center justify-center hover-scale">
                                <Camera className="w-10 h-10 text-accent-foreground/60" />
                            </div>
                            <div className="w-20 h-20 rounded-lg bg-white/60 flex items-center justify-center hover-scale">
                                <Wifi className="w-10 h-10 text-accent-foreground/60" />
                            </div>
                            <div className="w-20 h-20 rounded-lg bg-white/60 flex items-center justify-center hover-scale">
                                <Thermometer className="w-10 h-10 text-accent-foreground/60" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Your Devices Section - Purple Gradient */}
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Your Devices</h2>

                        {/* Search Bar with Integrated Filters */}
                        <div className="relative w-72 flex items-center">
                            {/* Filters Button */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute left-2 z-10 h-7 gap-1.5"
                                    >
                                        <Filter className="w-4 h-4" />
                                        {selectedCategories.length + selectedSources.length > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                                            >
                                                {selectedCategories.length + selectedSources.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-3">Device Categories</h4>
                                            <div className="space-y-2">
                                                {availableCategories.map(category => (
                                                    <label
                                                        key={category}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(
                                                                category,
                                                            )}
                                                            onChange={e => {
                                                                setSelectedCategories(prev =>
                                                                    e.target.checked
                                                                        ? [...prev, category]
                                                                        : prev.filter(
                                                                              c => c !== category,
                                                                          ),
                                                                )
                                                            }}
                                                            className="rounded border-input"
                                                        />
                                                        <span className="text-sm">
                                                            {category
                                                                .replace(/_/g, ' ')
                                                                .replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <Separator />
                                        <div>
                                            <h4 className="font-medium mb-3">Network Sources</h4>
                                            <div className="space-y-2">
                                                {availableSources.map(network => (
                                                    <label
                                                        key={network.id}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSources.includes(
                                                                network.id,
                                                            )}
                                                            onChange={e => {
                                                                setSelectedSources(prev =>
                                                                    e.target.checked
                                                                        ? [...prev, network.id]
                                                                        : prev.filter(
                                                                              id => id !== network.id,
                                                                          ),
                                                                )
                                                            }}
                                                            className="rounded border-input"
                                                        />
                                                        <span className="text-sm">{network.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        {(selectedCategories.length > 0 ||
                                            selectedSources.length > 0) && (
                                            <>
                                                <Separator />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        setSelectedCategories([])
                                                        setSelectedSources([])
                                                    }}
                                                >
                                                    Clear All Filters
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Search Input */}
                            <Search className="absolute left-16 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search devices..."
                                className="pl-24 pr-4"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <Card className="shadow-card border-border overflow-hidden">
                        <div className="bg-gradient-purple p-6 border-b border-border">
                            <CardTitle className="text-base">Network Devices</CardTitle>
                            <CardDescription>
                                All IoT and computing devices detected on your networks
                            </CardDescription>
                        </div>
                        <CardContent className="p-0">
                            <div className="overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                                    <div className="col-span-3">Device</div>
                                    <div className="col-span-3">Manufacturer</div>
                                    <div className="col-span-3">MAC Address</div>
                                    <div className="col-span-3">IP Address</div>
                                </div>

                                {/* Table Rows */}
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : error ? (
                                    <ErrorState
                                        variant="inline"
                                        title="Failed to load devices"
                                        message="Please check your connection and try again"
                                        showRetry={false}
                                        showBackButton={false}
                                    />
                                ) : filteredDevices.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">No devices found</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {filteredDevices.map((device, index) => {
                                            const Icon = getDeviceIcon(device)
                                            const networkInfo = getNetworkInfo(device.network_id)
                                            return (
                                                <Link
                                                    key={device.id}
                                                    to={`/networks/${device.network_id}/devices/${device.id}`}
                                                    style={{
                                                        animationDelay: `${index * 50}ms`,
                                                    }}
                                                    className="animate-fade-in"
                                                >
                                                    <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 transition-all cursor-pointer group">
                                                        <div className="col-span-3 flex items-center gap-3">
                                                            <div
                                                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCycleColor(
                                                                    index,
                                                                    'extended',
                                                                )} group-hover:scale-110 transition-transform`}
                                                            >
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium group-hover:text-primary transition-colors">
                                                                    {device.hostname ||
                                                                        device.ip_address}
                                                                </span>
                                                                {networkInfo && (
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                        <Wifi className="w-3 h-3" />
                                                                        <span>{networkInfo.subnet}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-3 flex items-center text-muted-foreground text-sm">
                                                            {device.manufacturer ? (
                                                                <span
                                                                    className="truncate"
                                                                    title={device.manufacturer}
                                                                >
                                                                    {device.manufacturer}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground/50">
                                                                    —
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="col-span-3 flex items-center">
                                                            {device.mac_address ? (
                                                                <code className="font-mono text-xs px-2 py-0.5 rounded bg-muted/50 text-foreground border border-border">
                                                                    {device.mac_address}
                                                                </code>
                                                            ) : (
                                                                <span className="text-muted-foreground/50">
                                                                    —
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="col-span-3 flex items-center">
                                                            <Link
                                                                to={`/networks/${device.network_id}/devices/${device.id}`}
                                                                className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                {device.ip_address}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Types Section - Blue Gradient */}
                <div
                    className="animate-fade-in"
                    style={{
                        animationDelay: '200ms',
                    }}
                >
                    <h2 className="text-lg font-semibold mb-4">System Types</h2>
                    <Card className="shadow-card border-border overflow-hidden">
                        <div className="bg-gradient-blue p-6 border-b border-border">
                            <CardTitle className="text-base">Security Assessment Types</CardTitle>
                            <CardDescription>
                                Automated security testing and compliance validation
                            </CardDescription>
                        </div>
                        <CardContent className="p-0">
                            <div className="overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                                    <div className="col-span-3">Name</div>
                                    <div className="col-span-4">Description</div>
                                    <div className="col-span-2">Entries</div>
                                    <div className="col-span-3">Source</div>
                                </div>

                                {/* Table Rows */}
                                <div className="divide-y divide-border">
                                    {systemTypes.map((type, index) => (
                                        <div
                                            key={type.id}
                                            style={{
                                                animationDelay: `${(index + 8) * 50}ms`,
                                            }}
                                            className="animate-fade-in"
                                        >
                                            <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 transition-all cursor-pointer group">
                                                <div className="col-span-3 flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.iconColor} group-hover:scale-110 transition-transform`}
                                                    >
                                                        <type.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium group-hover:text-primary transition-colors">
                                                        {type.name}
                                                    </span>
                                                </div>
                                                <div className="col-span-4 flex items-center text-muted-foreground text-sm">
                                                    {type.description}
                                                </div>
                                                <div className="col-span-2 flex items-center text-sm">
                                                    <Badge variant="outline">{type.entries}</Badge>
                                                </div>
                                                <div className="col-span-3 flex items-center text-sm text-muted-foreground">
                                                    {type.source}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Add Device Dialog */}
            <AddDeviceDialog
                open={showAddDeviceDialog}
                onOpenChange={setShowAddDeviceDialog}
                networks={networks}
            />
        </div>
    )
}

// Missing imports
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react'
export default Catalog
