import { useQuery } from '@tanstack/react-query'
import {
    ArrowLeft,
    Camera,
    ChevronDown,
    HardDrive,
    Loader2,
    Monitor,
    Search,
    Server,
    Thermometer,
    Wifi,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

const NetworkDetail = () => {
    const { id } = useParams()
    const [searchQuery, setSearchQuery] = useState('')

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

    const filteredDevices = useMemo(() => {
        if (!searchQuery.trim()) return devices

        const query = searchQuery.toLowerCase()
        return devices.filter(
            device =>
                device.hostname?.toLowerCase().includes(query) ||
                device.ip_address.toLowerCase().includes(query) ||
                device.manufacturer?.toLowerCase().includes(query),
        )
    }, [devices, searchQuery])

    const getDeviceIcon = (type: string) => {
        const icons = {
            medical_device: Monitor,
            iot_device: Thermometer,
            network_device: Wifi,
            workstation: HardDrive,
            server: Server,
            unknown: Monitor,
        }
        return icons[type as keyof typeof icons] || Monitor
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
                        <Button className="bg-primary hover:bg-primary/90">Scan Network</Button>
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

                {/* Filters and Search */}
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="outline" className="gap-2">
                        <ChevronDown className="w-4 h-4" />
                        All device types
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <ChevronDown className="w-4 h-4" />
                        All statuses
                    </Button>
                    <div className="flex-1 max-w-md ml-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search devices..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Devices Catalog Table */}
                <Card className="shadow-card border-border">
                    <CardHeader>
                        <CardTitle>Your Devices</CardTitle>
                        <CardDescription>
                            {filteredDevices.length} device
                            {filteredDevices.length !== 1 ? 's' : ''} detected on this network
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-hidden">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                                <div className="col-span-3">Device Name</div>
                                <div className="col-span-3">Details</div>
                                <div className="col-span-2">IP Address</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2">Last Seen</div>
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
                                        const Icon = getDeviceIcon(device.device_type)
                                        return (
                                            <Link
                                                key={device.id}
                                                to={`/networks/${id}/devices/${device.id}`}
                                            >
                                                <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 transition-colors cursor-pointer group">
                                                    <div className="col-span-3 flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(index)}`}
                                                        >
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <span className="font-medium group-hover:text-primary transition-colors">
                                                            {device.hostname || device.ip_address}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-3 flex items-center text-muted-foreground text-sm">
                                                        {device.manufacturer}{' '}
                                                        {device.model && `• ${device.model}`}
                                                    </div>
                                                    <div className="col-span-2 flex items-center font-mono text-sm">
                                                        {device.ip_address}
                                                    </div>
                                                    <div className="col-span-2 flex items-center">
                                                        {getDeviceStatusBadge(device.last_seen)}
                                                    </div>
                                                    <div className="col-span-2 flex items-center text-sm text-muted-foreground">
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
            </main>
        </div>
    )
}

export default NetworkDetail
