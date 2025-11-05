import { useQuery } from '@tanstack/react-query'
import { Activity, AlertTriangle, Home, Loader2, Network, Search, Shield } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLayout } from '@/contexts/LayoutContext'
import { api } from '@/lib/api'
import { getNetworkStatusBadge } from '@/lib/status'
import { formatTimeAgo } from '@/lib/time'
import { getCycleColor } from '@/lib/ui'

import Landing from './Landing'

const Index = () => {
    const { setShowSidebar } = useLayout()
    const { data: networksData, isLoading: networksLoading } = useQuery({
        queryKey: ['networks'],
        queryFn: () => api.networks.list(),
    })

    const { data: devicesData, isLoading: devicesLoading } = useQuery({
        queryKey: ['devices'],
        queryFn: () => api.devices.list(),
    })

    const { data: scansData, isLoading: scansLoading } = useQuery({
        queryKey: ['scans'],
        queryFn: () => api.scans.list(),
    })

    const networks = networksData?.networks || []
    const devices = devicesData?.devices || []
    const scans = scansData?.scans || []

    const loading = networksLoading || devicesLoading || scansLoading
    const isEmpty = !loading && networks.length === 0 && devices.length === 0 && scans.length === 0
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

    const shouldShowLanding = isEmpty || isDemoMode

    useEffect(() => {
        // Hide sidebar when showing landing page, show it when showing dashboard
        setShowSidebar(!shouldShowLanding)
    }, [shouldShowLanding, setShowSidebar])

    if (shouldShowLanding) {
        return <Landing />
    }

    const vulnerabilityCount = scans.reduce((sum, scan) => sum + scan.vulnerabilities.length, 0)
    const compliantDevices = devices.length - vulnerabilityCount

    const stats = [
        {
            label: 'Active Networks',
            value: networks.filter(n => n.status === 'active').length.toString(),
            icon: Network,
            color: 'text-blue-600',
        },
        {
            label: 'Total Devices',
            value: devices.length.toString(),
            icon: Activity,
            color: 'text-teal-600',
        },
        {
            label: 'Security Issues',
            value: vulnerabilityCount.toString(),
            icon: AlertTriangle,
            color: 'text-orange-600',
        },
        {
            label: 'Compliant Devices',
            value: compliantDevices.toString(),
            icon: Shield,
            color: 'text-green-600',
        },
    ]

    return (
        <div className="min-h-screen bg-background flex-1">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                                <Home className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Home</h1>
                                <p className="text-sm text-muted-foreground">Dashboard Overview</p>
                            </div>
                        </div>
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search networks, devices..."
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map(stat => (
                        <Card key={stat.label} className="shadow-card border-border">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            {stat.label}
                                        </p>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                    </div>
                                    <div
                                        className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}
                                    >
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Networks */}
                <Card className="shadow-card border-border mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">Networks</CardTitle>
                        <CardDescription>Overview of your monitored networks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {networksLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : networks.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No networks found</p>
                        ) : (
                            <div className="space-y-4">
                                {networks.map((network, index) => (
                                    <Link key={network.id} to={`/networks/${network.id}`}>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary hover:bg-accent/30 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCycleColor(
                                                        index,
                                                    )} group-hover:scale-110 transition-transform`}
                                                >
                                                    <Network className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                        {network.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {network.device_count} devices • Last scan{' '}
                                                        {formatTimeAgo(network.last_scan)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>{getNetworkStatusBadge(network.status)}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Devices */}
                <Card className="shadow-card border-border">
                    <CardHeader>
                        <CardTitle className="text-xl">Devices</CardTitle>
                        <CardDescription>Recently discovered devices on your networks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {devicesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : devices.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No devices found</p>
                        ) : (
                            <div className="space-y-4">
                                {devices.map((device, index) => (
                                    <Link
                                        key={device.id}
                                        to={`/networks/${device.network_id}/devices/${device.id}`}
                                    >
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary hover:bg-accent/30 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCycleColor(
                                                        index,
                                                    )} group-hover:scale-110 transition-transform`}
                                                >
                                                    <Activity className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                        {device.hostname || device.ip_address}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {device.manufacturer}{' '}
                                                        {device.model && `• ${device.model}`} •{' '}
                                                        {device.ip_address}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="capitalize">
                                                    {device.device_type.replace(/_/g, ' ')}
                                                </Badge>
                                                {device.scan_count > 0 && (
                                                    <Badge variant="outline">
                                                        {device.scan_count} scans
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
export default Index
