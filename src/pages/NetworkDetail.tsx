import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    ArrowLeft,
    Camera,
    Filter,
    GitBranch,
    List,
    Loader2,
    Monitor,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Wifi,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AddDeviceDialog } from '@/components/AddDeviceDialog'
import { ErrorState } from '@/components/ErrorState'
import { NetworkDiagram } from '@/components/NetworkDiagram'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/lib/api'
import { getDeviceIcon, getInfrastructureRole } from '@/lib/devices'
import { getDeviceOnlineBadge, getDeviceStatus, getNetworkStatusBadge } from '@/lib/status'
import { formatTimeAgo } from '@/lib/time'
import { getCycleColor } from '@/lib/ui'

const NetworkDetail = () => {
    const { id } = useParams()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'diagram'>('list')
    const [selectedDeviceTypes, setSelectedDeviceTypes] = useState<string[]>([])
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    const [showAddDeviceDialog, setShowAddDeviceDialog] = useState(false)
    const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

    const { data: networksData } = useQuery({
        queryKey: ['networks'],
        queryFn: () => api.networks.list(),
    })

    const devices = devicesData?.devices || []
    const networks = networksData?.networks || []

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
        }
    }, [])

    const handleScanNetwork = async () => {
        if (!id) return

        // Clear any existing intervals
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)

        setIsScanning(true)
        try {
            await api.networks.scan(id)
            toast.success('Network scan initiated', {
                description: 'Discovering devices on this network...',
            })

            // Poll for updates every 3 seconds
            pollIntervalRef.current = setInterval(async () => {
                await queryClient.invalidateQueries({ queryKey: ['devices', id] })
                await queryClient.invalidateQueries({ queryKey: ['network', id] })
            }, 3000)

            // Stop polling after 30 seconds
            pollTimeoutRef.current = setTimeout(() => {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
                setIsScanning(false)
                toast.success('Scan complete', {
                    description: 'Device list has been updated',
                })
            }, 30000)
        } catch (error) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
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
                const status = getDeviceStatus(device.last_seen)
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

    const handleToggleDevice = (deviceId: string) => {
        const newSelected = new Set(selectedDevices)
        if (newSelected.has(deviceId)) {
            newSelected.delete(deviceId)
        } else {
            newSelected.add(deviceId)
        }
        setSelectedDevices(newSelected)
    }

    const handleToggleAllDevices = () => {
        if (selectedDevices.size === filteredDevices.length && filteredDevices.length > 0) {
            setSelectedDevices(new Set())
        } else {
            setSelectedDevices(new Set(filteredDevices.map(d => d.id)))
        }
    }

    const handleDeleteDevices = async () => {
        if (selectedDevices.size === 0) return

        setIsDeleting(true)
        try {
            if (selectedDevices.size === 1) {
                const deviceId = Array.from(selectedDevices)[0]
                await api.devices.delete(deviceId)
                toast.success('Device deleted successfully')
            } else {
                await api.devices.bulkDelete(Array.from(selectedDevices))
                toast.success(`${selectedDevices.size} devices deleted successfully`)
            }

            // Refresh device list
            await queryClient.invalidateQueries({ queryKey: ['devices', id] })
            await queryClient.invalidateQueries({ queryKey: ['network', id] })

            // Clear selection
            setSelectedDevices(new Set())
            setShowDeleteDialog(false)
        } catch (error) {
            console.error('Failed to delete devices:', error)
            toast.error('Failed to delete devices', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            })
        } finally {
            setIsDeleting(false)
        }
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
                                    {getNetworkStatusBadge(network.status)}
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
                                    New Scan
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

                {/* View Controls */}
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
                                        {selectedDevices.size > 0 && (
                                            <span className="ml-2 text-primary">
                                                ({selectedDevices.size} selected)
                                            </span>
                                        )}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
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
                                                    {selectedDeviceTypes.length +
                                                        selectedStatuses.length >
                                                        0 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                                                        >
                                                            {selectedDeviceTypes.length +
                                                                selectedStatuses.length}
                                                        </Badge>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80" align="end">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-medium mb-3">
                                                            Device Types
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {availableDeviceTypes.map(type => (
                                                                <label
                                                                    key={type}
                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedDeviceTypes.includes(
                                                                            type,
                                                                        )}
                                                                        onChange={e => {
                                                                            setSelectedDeviceTypes(
                                                                                prev =>
                                                                                    e.target.checked
                                                                                        ? [...prev, type]
                                                                                        : prev.filter(
                                                                                              t =>
                                                                                                  t !==
                                                                                                  type,
                                                                                          ),
                                                                            )
                                                                        }}
                                                                        className="rounded border-input"
                                                                    />
                                                                    <span className="text-sm">
                                                                        {type
                                                                            .replace(/_/g, ' ')
                                                                            .replace(/\b\w/g, l =>
                                                                                l.toUpperCase(),
                                                                            )}
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
                                                                        checked={selectedStatuses.includes(
                                                                            status,
                                                                        )}
                                                                        onChange={e => {
                                                                            setSelectedStatuses(prev =>
                                                                                e.target.checked
                                                                                    ? [...prev, status]
                                                                                    : prev.filter(
                                                                                          s =>
                                                                                              s !==
                                                                                              status,
                                                                                      ),
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
                                                    {(selectedDeviceTypes.length > 0 ||
                                                        selectedStatuses.length > 0) && (
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
                                    {selectedDevices.size > 0 && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => setShowDeleteDialog(true)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Delete ({selectedDevices.size})
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowAddDeviceDialog(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add New
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                                    <div className="col-span-1 flex items-center">
                                        <Checkbox
                                            checked={
                                                filteredDevices.length > 0 &&
                                                selectedDevices.size === filteredDevices.length
                                            }
                                            onCheckedChange={handleToggleAllDevices}
                                        />
                                    </div>
                                    <div className="col-span-2">Host</div>
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
                                            const {
                                                isInfrastructure,
                                                label: roleLabel,
                                                badgeClass,
                                            } = getInfrastructureRole(device)
                                            return (
                                                <div
                                                    key={device.id}
                                                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 transition-colors group"
                                                >
                                                    <div className="col-span-1 flex items-center">
                                                        <Checkbox
                                                            checked={selectedDevices.has(device.id)}
                                                            onCheckedChange={() =>
                                                                handleToggleDevice(device.id)
                                                            }
                                                            onClick={e => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <Link
                                                        to={`/networks/${id}/devices/${device.id}`}
                                                        className="col-span-2 flex items-center gap-3 cursor-pointer"
                                                    >
                                                        <div
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCycleColor(
                                                                index,
                                                            )}`}
                                                        >
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-medium group-hover:text-primary transition-colors">
                                                                {device.hostname || device.ip_address}
                                                            </span>
                                                            {isInfrastructure && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`${badgeClass} text-xs w-fit`}
                                                                >
                                                                    {roleLabel}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </Link>
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
                                                        <button
                                                            type="button"
                                                            className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                            onClick={e => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                window.open(
                                                                    `http://${device.ip_address}`,
                                                                    '_blank',
                                                                    'noopener,noreferrer',
                                                                )
                                                            }}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    e.stopPropagation()
                                                                    window.open(
                                                                        `http://${device.ip_address}`,
                                                                        '_blank',
                                                                        'noopener,noreferrer',
                                                                    )
                                                                }
                                                            }}
                                                        >
                                                            {device.ip_address}
                                                        </button>
                                                    </div>
                                                    <div className="col-span-2 flex items-center">
                                                        {getDeviceOnlineBadge(device.last_seen)}
                                                    </div>
                                                    <div className="col-span-1 flex items-center text-sm text-muted-foreground">
                                                        {formatTimeAgo(device.last_seen)}
                                                    </div>
                                                </div>
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

            {/* Add Device Dialog */}
            <AddDeviceDialog
                open={showAddDeviceDialog}
                onOpenChange={setShowAddDeviceDialog}
                preselectedNetworkId={id}
                networks={networks}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Device{selectedDevices.size > 1 ? 's' : ''}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedDevices.size} device
                            {selectedDevices.size > 1 ? 's' : ''}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteDevices}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default NetworkDetail
