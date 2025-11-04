import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    ArrowLeft,
    Camera,
    Filter,
    GitBranch,
    HardDrive,
    List,
    Loader2,
    Monitor,
    Plus,
    RefreshCw,
    Router,
    Search,
    Server,
    Shield,
    Thermometer,
    Wifi,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ErrorState } from '@/components/ErrorState'
import { NetworkDiagram } from '@/components/NetworkDiagram'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/lib/api'

const NetworkDetail = () => {
    const { id } = useParams()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'diagram'>('list')
    const [selectedDeviceTypes, setSelectedDeviceTypes] = useState<string[]>([])
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

    const {
        data: network,
        isLoading: networkLoading,
        error: networkError,
    } = useQuery({
        queryKey: ['network', id],
        queryFn: () => api.networks.get(id!),
        enabled: !!id,
    })

    const { data: devicesData, isLoading: devicesLoading } = useQuery({
        queryKey: ['devices', id],
        queryFn: () => api.devices.listByNetwork(id!),
        enabled: !!id,
    })

    const devices = devicesData?.devices || []

    const handleScanNetwork = async () => {
        if (!id) return

        setIsScanning(true)
        try {
            await api.networks.scan(id)
            toast.success('Network scan initiated', {
                description: 'Discovering devices on this network...',
            })

            // Poll for updates
            const pollInterval = setInterval(async () => {
                await queryClient.invalidateQueries({ queryKey: ['devices', id] })
                await queryClient.invalidateQueries({ queryKey: ['network', id] })
            }, 3000)

            // Stop polling after 30 seconds
            setTimeout(() => {
                clearInterval(pollInterval)
                setIsScanning(false)
                toast.success('Scan complete', {
                    description: 'Device list has been updated',
                })
            }, 30000)
        } catch (error) {
            setIsScanning(false)
            toast.error('Failed to start network scan', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            })
        }
    }

    // Get unique device types and statuses from devices
    const availableDeviceTypes = useMemo(() => {
        const types = new Set(devices.map(device => device.device_type))
        return Array.from(types).sort()
    }, [devices])

    const availableStatuses = useMemo(() => {
        const statuses = new Set<string>()
        devices.forEach(device => {
            const now = new Date()
            const lastSeenDate = new Date(device.last_seen)
            const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

            if (diffInMinutes < 5) {
                statuses.add('online')
            } else if (diffInMinutes < 60) {
                statuses.add('away')
            } else {
                statuses.add('offline')
            }
        })
        return Array.from(statuses).sort()
    }, [devices])

    const filteredDevices = useMemo(() => {
        let filtered = devices

        // Apply device type filter
        if (selectedDeviceTypes.length > 0) {
            filtered = filtered.filter(device => selectedDeviceTypes.includes(device.device_type))
        }

        // Apply status filter
        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(device => {
                const now = new Date()
                const lastSeenDate = new Date(device.last_seen)
                const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

                let status = 'offline'
                if (diffInMinutes < 5) {
                    status = 'online'
                } else if (diffInMinutes < 60) {
                    status = 'away'
                }

                return selectedStatuses.includes(status)
            })
        }

        // Apply search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                device =>
                    device.hostname?.toLowerCase().includes(query) ||
                    device.ip_address.toLowerCase().includes(query) ||
                    device.manufacturer?.toLowerCase().includes(query),
            )
        }

        return filtered
    }, [devices, searchQuery, selectedDeviceTypes, selectedStatuses])

    const getDeviceIcon = (device: any) => {
        // Check for infrastructure roles
        const isGateway = device.fingerprint_metadata?.is_gateway
        const isRouter = device.fingerprint_metadata?.is_router
        const isAccessPoint = device.fingerprint_metadata?.is_access_point
        const infrastructureRole = device.fingerprint_metadata?.infrastructure_role

        // Return infrastructure icons if applicable
        if (isGateway || infrastructureRole === 'gateway') return Shield
        if (isRouter || infrastructureRole === 'router') return Router
        if (isAccessPoint || infrastructureRole === 'access_point') return Wifi

        // Default device type icons
        const icons = {
            medical_device: Monitor,
            iot_device: Thermometer,
            network_device: Wifi,
            workstation: HardDrive,
            server: Server,
            unknown: Monitor,
        }
        return icons[device.device_type as keyof typeof icons] || Monitor
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            active: {
                text: 'Active',
                className: 'bg-success/10 text-success border-success/20',
            },
            inactive: {
                text: 'Inactive',
                className: 'bg-warning/10 text-warning border-warning/20',
            },
            scanning: {
                text: 'Scanning',
                className: 'bg-primary/10 text-primary border-primary/20',
            },
        }
        const config = variants[status as keyof typeof variants] || variants.active
        return (
            <Badge variant="outline" className={config.className}>
                {config.text}
            </Badge>
        )
    }

    const getDeviceStatusBadge = (lastSeen: string) => {
        const now = new Date()
        const lastSeenDate = new Date(lastSeen)
        const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

        if (diffInMinutes < 5) {
            return (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Online
                </Badge>
            )
        } else if (diffInMinutes < 60) {
            return (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    Away
                </Badge>
            )
        } else {
            return (
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted">
                    Offline
                </Badge>
            )
        }
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'Active now'
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }

    const getIconColor = (index: number) => {
        const colors = [
            'text-purple-600 bg-purple-50',
            'text-blue-600 bg-blue-50',
            'text-teal-600 bg-teal-50',
            'text-orange-600 bg-orange-50',
            'text-pink-600 bg-pink-50',
            'text-indigo-600 bg-indigo-50',
        ]
        return colors[index % colors.length]
    }

    if (networkLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (networkError || !network) {
        return (
            <ErrorState
                variant="fullpage"
                title="Failed to load Network"
                message="Please check your connection and try again."
                backUrl="/networks"
                backLabel="Back to Networks"
            />
        )
    }

    return (
        <div className="min-h-screen w-full bg-background flex flex-col">
            <header className="border-b border-border bg-card sticky top-0 z-50 w-full">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/networks">
                                <Button variant="ghost" size="icon" className="hover:bg-secondary">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{network.name}</h1>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {getStatusBadge(network.status)}
                                    <span>•</span>
                                    <span>{network.subnet}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            className="bg-accent-foreground text-accent hover:bg-accent-foreground/90"
                            onClick={handleScanNetwork}
                            disabled={isScanning}
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Start new scan
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full px-6 py-8">
                {/* Banner */}
                <div className="mb-6 p-6 rounded-lg bg-gradient-accent border border-accent/20">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-accent-foreground mb-2">
                                Monitor your IoT devices in real-time
                            </h2>
                            <p className="text-sm text-accent-foreground/80">
                                Run security tests and compliance audits on each device to ensure network
                                safety
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-16 h-16 rounded-lg bg-white/60 flex items-center justify-center">
                                <Monitor className="w-8 h-8 text-accent-foreground/60" />
                            </div>
                            <div className="w-16 h-16 rounded-lg bg-white/60 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-accent-foreground/60" />
                            </div>
                            <div className="w-16 h-16 rounded-lg bg-white/60 flex items-center justify-center">
                                <Wifi className="w-8 h-8 text-accent-foreground/60" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Controls and Search with Filters */}
                <div className="mb-6 flex items-center gap-4">
                    {/* View Mode Toggle - Prominent on Left */}
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="gap-2"
                        >
                            <List className="w-4 h-4" />
                            List
                        </Button>
                        <Button
                            variant={viewMode === 'diagram' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('diagram')}
                            className="gap-2"
                        >
                            <GitBranch className="w-4 h-4" />
                            Visual
                        </Button>
                    </div>

                    <div className="flex-1" />

                    {/* Refresh Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleScanNetwork}
                                    disabled={isScanning}
                                >
                                    <RefreshCw
                                        className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`}
                                    />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isScanning ? 'Scanning...' : 'Refresh Devices'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Search Bar with Integrated Filters */}
                    <div className="relative w-96 flex items-center">
                        {/* Filters Button */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute left-2 z-10 h-7 gap-1.5"
                                >
                                    <Filter className="w-4 h-4" />
                                    {selectedDeviceTypes.length + selectedStatuses.length > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                                        >
                                            {selectedDeviceTypes.length + selectedStatuses.length}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-3">Device Types</h4>
                                        <div className="space-y-2">
                                            {availableDeviceTypes.map(type => (
                                                <label
                                                    key={type}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDeviceTypes.includes(type)}
                                                        onChange={e => {
                                                            setSelectedDeviceTypes(prev =>
                                                                e.target.checked
                                                                    ? [...prev, type]
                                                                    : prev.filter(t => t !== type),
                                                            )
                                                        }}
                                                        className="rounded border-input"
                                                    />
                                                    <span className="text-sm">
                                                        {type
                                                            .replace(/_/g, ' ')
                                                            .replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="font-medium mb-3">Status</h4>
                                        <div className="space-y-2">
                                            {availableStatuses.map(status => (
                                                <label
                                                    key={status}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStatuses.includes(status)}
                                                        onChange={e => {
                                                            setSelectedStatuses(prev =>
                                                                e.target.checked
                                                                    ? [...prev, status]
                                                                    : prev.filter(s => s !== status),
                                                            )
                                                        }}
                                                        className="rounded border-input"
                                                    />
                                                    <span className="text-sm">
                                                        {status.charAt(0).toUpperCase() +
                                                            status.slice(1)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {(selectedDeviceTypes.length > 0 || selectedStatuses.length > 0) && (
                                        <>
                                            <Separator />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => {
                                                    setSelectedDeviceTypes([])
                                                    setSelectedStatuses([])
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

                {/* Content Views */}
                {viewMode === 'list' ? (
                    <Card className="shadow-card border-border">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Your Devices</CardTitle>
                                    <CardDescription>
                                        {filteredDevices.length} device
                                        {filteredDevices.length !== 1 ? 's' : ''} detected on this
                                        network
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                                    <div className="col-span-3">Host</div>
                                    <div className="col-span-2">Manufacturer</div>
                                    <div className="col-span-2">MAC Address</div>
                                    <div className="col-span-2">IP Address</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-1">Last Seen</div>
                                </div>

                                {/* Table Rows */}
                                {devicesLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : filteredDevices.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">
                                            {searchQuery
                                                ? `No devices found matching "${searchQuery}"`
                                                : 'No devices detected on this network'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {filteredDevices.map((device, index) => {
                                            const Icon = getDeviceIcon(device)
                                            const isInfrastructure =
                                                device.fingerprint_metadata?.is_gateway ||
                                                device.fingerprint_metadata?.is_router ||
                                                device.fingerprint_metadata?.is_access_point
                                            const infrastructureRole =
                                                device.fingerprint_metadata?.infrastructure_role
                                            return (
                                                <Link
                                                    key={device.id}
                                                    to={`/networks/${id}/devices/${device.id}`}
                                                >
                                                    <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 transition-colors cursor-pointer group">
                                                        <div className="col-span-3 flex items-center gap-3">
                                                            <div
                                                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(
                                                                    index,
                                                                )}`}
                                                            >
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-medium group-hover:text-primary transition-colors">
                                                                    {device.hostname ||
                                                                        device.ip_address}
                                                                </span>
                                                                {isInfrastructure && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            infrastructureRole ===
                                                                            'gateway'
                                                                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500 text-xs w-fit'
                                                                                : infrastructureRole ===
                                                                                    'router'
                                                                                  ? 'bg-teal-500/10 text-teal-700 border-teal-500 text-xs w-fit'
                                                                                  : 'bg-cyan-500/10 text-cyan-700 border-cyan-500 text-xs w-fit'
                                                                        }
                                                                    >
                                                                        {infrastructureRole === 'gateway'
                                                                            ? 'Gateway'
                                                                            : infrastructureRole ===
                                                                                'router'
                                                                              ? 'Router'
                                                                              : 'Access Point'}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 flex items-center text-muted-foreground text-sm">
                                                            {device.manufacturer ? (
                                                                <span
                                                                    className="truncate"
                                                                    title={device.manufacturer}
                                                                >
                                                                    {device.manufacturer}
                                                                    {device.model && ` ${device.model}`}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground/50">
                                                                    —
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="col-span-2 flex items-center">
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
                                                        <div className="col-span-2 flex items-center">
                                                            <span
                                                                className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                                onClick={e => {
                                                                    e.preventDefault()
                                                                    e.stopPropagation()
                                                                    window.open(
                                                                        `http://${device.ip_address}`,
                                                                        '_blank',
                                                                        'noopener,noreferrer',
                                                                    )
                                                                }}
                                                            >
                                                                {device.ip_address}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-2 flex items-center">
                                                            {getDeviceStatusBadge(device.last_seen)}
                                                        </div>
                                                        <div className="col-span-1 flex items-center text-sm text-muted-foreground">
                                                            {formatTimeAgo(device.last_seen)}
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
                ) : (
                    <NetworkDiagram devices={devices} networkId={id!} subnet={network.subnet} />
                )}
            </main>
        </div>
    )
}

export default NetworkDetail
