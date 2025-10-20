import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    BrushCleaning,
    CheckCircle2,
    FileText,
    Loader2,
    Monitor,
    RefreshCw,
    Shield,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ActivityViewer } from '@/components/ActivityViewer'
import { ErrorState } from '@/components/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/lib/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DeviceDetail = () => {
    const { networkId, deviceId } = useParams()
    const queryClient = useQueryClient()
    const [activeScanId, setActiveScanId] = useState<string | null>(null)
    const [activityScans, setActivityScans] = useState<any[]>([])

    const {
        data: device,
        isLoading: deviceLoading,
        error: deviceError,
    } = useQuery({
        queryKey: ['device', deviceId],
        queryFn: () => api.devices.get(deviceId!),
        enabled: !!deviceId,
    })

    const {
        data: scansData,
        isLoading: scansLoading,
        refetch: refetchScans,
        isFetching: scansFetching,
    } = useQuery({
        queryKey: ['scans', deviceId],
        queryFn: () => api.scans.listByDevice(deviceId!),
        enabled: !!deviceId,
    })

    const scans = scansData?.scans || []

    const handleRefreshScans = async () => {
        await refetchScans()
        toast.success('Scans Refreshed', {
            description: `Found ${scans.length} scan(s) with ${scans.reduce(
                (sum, scan) => sum + scan.vulnerabilities.length,
                0,
            )} vulnerabilities`,
        })
    }

    // Update activity scans when a new scan is initiated
    useEffect(() => {
        if (activeScanId) {
            const newScan = {
                id: activeScanId,
                type: 'scan',
                name: 'Penetration Test',
                status: 'running',
                startedAt: new Date().toISOString(),
            }
            setActivityScans(prev => [newScan, ...prev])
        }
    }, [activeScanId])

    // Mock device data for fallback - in a real app, this would come from an API
    const allDevices = {
        '1': {
            id: 1,
            name: 'MacBook Pro',
            type: 'computer',
            ip: '192.168.1.101',
            mac: 'A4:83:E7:5F:2B:1C',
            status: 'online',
            manufacturer: 'Apple Inc.',
            model: 'MacBook Pro (16-inch, 2023)',
            os: 'macOS Sonoma 14.2',
            lastSeen: 'Active now',
            openPorts: [22, 80, 443, 5000],
            vulnerabilities: 2,
            complianceStatus: 'passed',
        },
        '2': {
            id: 2,
            name: 'iPhone 14',
            type: 'mobile',
            ip: '192.168.1.102',
            mac: 'B2:45:E9:3A:7D:8E',
            status: 'online',
            manufacturer: 'Apple Inc.',
            model: 'iPhone 14 Pro',
            os: 'iOS 17.2',
            lastSeen: '2 minutes ago',
            openPorts: [443, 5000],
            vulnerabilities: 0,
            complianceStatus: 'passed',
        },
        '3': {
            id: 3,
            name: 'Smart Thermostat',
            type: 'iot',
            ip: '192.168.1.115',
            mac: 'C8:72:A1:9B:4F:2D',
            status: 'online',
            manufacturer: 'Nest Labs',
            model: 'Learning Thermostat (3rd Gen)',
            os: 'Nest OS 5.9.3',
            lastSeen: 'Active now',
            openPorts: [80, 443],
            vulnerabilities: 1,
            complianceStatus: 'warning',
        },
        '4': {
            id: 4,
            name: 'HP LaserJet',
            type: 'printer',
            ip: '192.168.1.120',
            mac: 'D4:6B:C2:8D:1E:5A',
            status: 'online',
            manufacturer: 'HP Inc.',
            model: 'LaserJet Pro M404dn',
            os: 'Embedded firmware',
            lastSeen: '15 minutes ago',
            openPorts: [80, 443, 9100],
            vulnerabilities: 3,
            complianceStatus: 'critical',
        },
        '5': {
            id: 5,
            name: 'Security Camera',
            type: 'camera',
            ip: '192.168.1.130',
            mac: 'E9:34:D5:7A:2B:6C',
            status: 'online',
            manufacturer: 'Hikvision',
            model: 'DS-2CD2142FWD-I',
            os: 'Firmware V5.6.3',
            lastSeen: 'Active now',
            openPorts: [80, 554, 8000],
            vulnerabilities: 2,
            complianceStatus: 'warning',
        },
        '6': {
            id: 6,
            name: 'WiFi Router',
            type: 'network',
            ip: '192.168.1.1',
            mac: 'A1:B2:C3:D4:E5:F6',
            status: 'online',
            manufacturer: 'Cisco Systems',
            model: 'RV340 Router',
            os: 'IOS 15.7',
            lastSeen: 'Active now',
            openPorts: [22, 80, 443, 8443],
            vulnerabilities: 1,
            complianceStatus: 'passed',
        },
        '7': {
            id: 7,
            name: 'Smart TV',
            type: 'iot',
            ip: '192.168.1.145',
            mac: 'F8:A9:D2:5E:3C:7B',
            status: 'online',
            manufacturer: 'Samsung',
            model: 'QLED 4K Smart TV',
            os: 'Tizen OS 7.0',
            lastSeen: '1 hour ago',
            openPorts: [80, 443],
            vulnerabilities: 0,
            complianceStatus: 'passed',
        },
        '8': {
            id: 8,
            name: 'Laptop Dell',
            type: 'computer',
            ip: '192.168.1.150',
            mac: 'G2:H5:I8:J1:K4:L7',
            status: 'online',
            manufacturer: 'Dell Inc.',
            model: 'XPS 15 (9520)',
            os: 'Windows 11 Pro',
            lastSeen: 'Active now',
            openPorts: [135, 445, 3389],
            vulnerabilities: 1,
            complianceStatus: 'passed',
        },
    }
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'Active now'
        if (diffInMinutes < 60) return `${diffInMinutes} mins ago`
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours} hrs ago`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays} days ago`
    }

    if (deviceLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (deviceError || !device) {
        return <ErrorState variant="fullpage" backUrl="/networks" backLabel="Go Back" />
    }

    const handlePenTest = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/devices/${deviceId}/scan`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Failed to start penetration test')
            }

            const data = await response.json()
            setActiveScanId(data.scan_id)

            toast.success('Penetration test initiated', {
                description: 'Comprehensive security testing in progress...',
            })
        } catch (error) {
            toast.error('Failed to start penetration test', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            })
        }
    }
    const handleRiskAssessment = () => {
        toast.success('Risk assessment started', {
            description: 'Analyzing security posture and vulnerabilities...',
        })
    }
    const handleComplianceAudit = () => {
        toast.success('Compliance audit launched', {
            description: 'Checking against industry standards...',
        })
    }
    const handleRegulatoryAdvisory = () => {
        toast.info('Regulatory advisory report', {
            description: 'Generating compliance recommendations...',
        })
    }
    const getStatusBadge = () => {
        const now = new Date()
        const lastSeen = new Date(device.last_seen)
        const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))

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
    const getSeverityIcon = (severity: string) => {
        if (severity === 'success') return <CheckCircle2 className="w-4 h-4 text-success" />
        if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-warning" />
        return <Activity className="w-4 h-4 text-info" />
    }
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={`/networks/${networkId}`}>
                            <Button variant="ghost" size="icon" className="hover:bg-secondary">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {device.hostname || device.ip_address}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {device.ip_address} • {device.mac_address || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Device Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-card border-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Monitor className="w-5 h-5 text-primary" />
                                            Overview
                                        </CardTitle>
                                        <CardDescription>Hardware and network details</CardDescription>
                                    </div>
                                    {getStatusBadge()}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Manufacturer
                                        </p>
                                        <p className="font-medium">{device.manufacturer || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Model</p>
                                        <p className="font-medium">{device.model || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Device Type</p>
                                        <p className="font-medium capitalize">
                                            {device.device_type.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Operating System
                                        </p>
                                        <p className="font-medium">{device.os || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Last Active</p>
                                        <p className="font-medium">{formatTimeAgo(device.last_seen)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Discovered</p>
                                        <p className="font-medium">
                                            {formatTimeAgo(device.discovered_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">IP Address</p>
                                        <p className="font-mono font-medium">{device.ip_address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">MAC Address</p>
                                        <p className="font-mono font-medium">
                                            {device.mac_address || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Open Ports</p>
                                    {device.open_ports.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {device.open_ports.map(port => (
                                                <Badge
                                                    key={port}
                                                    variant="outline"
                                                    className="font-mono"
                                                >
                                                    {port}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No open ports detected
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Viewer */}
                        <ActivityViewer
                            deviceId={deviceId!}
                            scans={[
                                ...activityScans,
                                ...scans
                                    .filter(scan => !activityScans.some(as => as.id === scan.id))
                                    .map(scan => ({
                                        id: scan.id,
                                        type: 'scan' as const,
                                        name: scan.scan_type.replace(/_/g, ' '),
                                        status: (scan.status === 'in_progress' ||
                                        scan.status === 'pending'
                                            ? 'running'
                                            : scan.status) as 'running' | 'completed' | 'failed',
                                        startedAt: scan.started_at,
                                        completedAt: scan.completed_at,
                                        vulnerabilitiesFound: scan.vulnerabilities.length,
                                    })),
                            ]}
                            audits={[]}
                            onScanComplete={(scanId, status) => {
                                // Update the status in activity scans
                                setActivityScans(prev =>
                                    prev.map(s =>
                                        s.id === scanId
                                            ? {
                                                  ...s,
                                                  status:
                                                      status === 'completed' ? 'completed' : 'failed',
                                                  completedAt: new Date().toISOString(),
                                              }
                                            : s,
                                    ),
                                )
                                // Invalidate and refetch the scans data
                                queryClient.invalidateQueries({
                                    queryKey: ['scans', deviceId],
                                })
                            }}
                        />
                    </div>

                    {/* Actions Panel */}
                    <div className="space-y-6">
                        <Card className="shadow-card border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    Actions
                                </CardTitle>
                                <CardDescription>Run security tests and assessments</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    onClick={handlePenTest}
                                    className="w-full bg-primary hover:bg-primary/90 justify-start"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Penetration Test
                                </Button>
                                <Button
                                    onClick={handleRiskAssessment}
                                    variant="outline"
                                    className="w-full justify-start hover:bg-secondary"
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Risk Assessment
                                </Button>
                                <Button
                                    onClick={handleComplianceAudit}
                                    variant="outline"
                                    className="w-full justify-start hover:bg-secondary"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Compliance Audit
                                </Button>
                                <Button
                                    onClick={handleRegulatoryAdvisory}
                                    variant="outline"
                                    className="w-full justify-start hover:bg-secondary"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Regulatory Advisory
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Issues Panel */}
                        <Card className="shadow-card border-border">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-primary" />
                                    Issues
                                </CardTitle>
                                <TooltipProvider>
                                    <div className="flex items-center gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        toast.success('Issues Cleared', {
                                                            description:
                                                                'All issues have been cleared from this device.',
                                                        })
                                                    }}
                                                    disabled={
                                                        !scans.some(
                                                            scan => scan.vulnerabilities.length > 0,
                                                        )
                                                    }
                                                >
                                                    <BrushCleaning className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Clear all issues</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleRefreshScans}
                                                    disabled={scansFetching}
                                                >
                                                    <RefreshCw
                                                        className={`h-4 w-4 ${scansFetching ? 'animate-spin' : ''}`}
                                                    />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Refresh scans</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TooltipProvider>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-muted-foreground">
                                            Issues Found
                                        </span>
                                        <span className="font-bold text-warning">
                                            {scans.reduce(
                                                (sum, scan) => sum + scan.vulnerabilities.length,
                                                0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-warning"
                                            style={{
                                                width: `${Math.min(
                                                    (scans.reduce(
                                                        (sum, scan) => sum + scan.vulnerabilities.length,
                                                        0,
                                                    ) /
                                                        10) *
                                                        100,
                                                    100,
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-muted-foreground">
                                            Device Type
                                        </span>
                                        <Badge variant="outline" className="capitalize">
                                            {device.device_type.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Vulnerability List */}
                                {scans.length > 0 &&
                                    scans.some(scan => scan.vulnerabilities.length > 0) && (
                                        <div className="mt-4 space-y-2">
                                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                                Recent Vulnerabilities
                                            </div>
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                {scans
                                                    .flatMap(scan =>
                                                        scan.vulnerabilities.map((vuln, idx) => (
                                                            <div
                                                                key={`${scan.id}-${idx}`}
                                                                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <Badge
                                                                                variant={
                                                                                    vuln.severity ===
                                                                                    'critical'
                                                                                        ? 'destructive'
                                                                                        : vuln.severity ===
                                                                                            'high'
                                                                                          ? 'destructive'
                                                                                          : vuln.severity ===
                                                                                              'medium'
                                                                                            ? 'default'
                                                                                            : 'secondary'
                                                                                }
                                                                                className="text-xs"
                                                                            >
                                                                                {vuln.severity}
                                                                            </Badge>
                                                                            {vuln.cvss_score && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    CVSS{' '}
                                                                                    {vuln.cvss_score}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm font-medium">
                                                                            {vuln.title}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            {vuln.description}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )),
                                                    )
                                                    .slice(0, 5)}
                                            </div>
                                            {scans.reduce(
                                                (sum, scan) => sum + scan.vulnerabilities.length,
                                                0,
                                            ) > 5 && (
                                                <p className="text-xs text-muted-foreground text-center mt-2">
                                                    +
                                                    {scans.reduce(
                                                        (sum, scan) => sum + scan.vulnerabilities.length,
                                                        0,
                                                    ) - 5}{' '}
                                                    more vulnerabilities
                                                </p>
                                            )}
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
export default DeviceDetail
