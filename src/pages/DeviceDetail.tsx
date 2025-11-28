import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    BrushCleaning,
    Check,
    CheckCircle2,
    Edit2,
    FileText,
    Loader2,
    Monitor,
    RefreshCw,
    Shield,
    Wifi,
    X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ActivityViewer } from '@/components/ActivityViewer'
import { ErrorState } from '@/components/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/lib/api'
import { getDeviceOnlineBadge } from '@/lib/status'
import { formatTimeAgo } from '@/lib/time'

const DeviceDetail = () => {
    const { networkId, deviceId } = useParams()
    const queryClient = useQueryClient()
    const [activeScanId, setActiveScanId] = useState<string | null>(null)
    const [activityScans, setActivityScans] = useState<any[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        hostname: '',
        manufacturer: '',
        model: '',
        device_type: '',
        mac_address: '',
        os: '',
    })

    const {
        data: device,
        isLoading: deviceLoading,
        error: deviceError,
    } = useQuery({
        queryKey: ['device', deviceId],
        queryFn: () => api.devices.get(deviceId!),
        enabled: !!deviceId,
    })

    const { data: networkData, isLoading: networkLoading } = useQuery({
        queryKey: ['network', device?.network_id],
        queryFn: () => api.networks.get(device!.network_id),
        enabled: !!device?.network_id,
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

    // Populate edit form when device data loads
    useEffect(() => {
        if (device) {
            setEditForm({
                hostname: device.hostname || '',
                manufacturer: device.manufacturer || '',
                model: device.model || '',
                device_type: device.device_type || 'unknown',
                mac_address: device.mac_address || '',
                os: device.os || '',
            })
        }
    }, [device])

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

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        // Reset form to current device values
        if (device) {
            setEditForm({
                hostname: device.hostname || '',
                manufacturer: device.manufacturer || '',
                model: device.model || '',
                device_type: device.device_type || 'unknown',
                mac_address: device.mac_address || '',
                os: device.os || '',
            })
        }
    }

    const handleSave = async () => {
        if (!deviceId) return

        setIsSaving(true)
        try {
            await api.devices.update(deviceId, editForm)

            // Refresh device data
            await queryClient.invalidateQueries({ queryKey: ['device', deviceId] })

            toast.success('Device updated successfully')
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to update device:', error)
            toast.error('Failed to update device', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleClearIssues = async () => {
        if (!deviceId) return

        try {
            await api.scans.clearDeviceIssues(deviceId)

            // Refresh scans data
            await refetchScans()

            toast.success('Issues Cleared', {
                description: 'All issues have been cleared from this device.',
            })
        } catch (error) {
            console.error('Failed to clear issues:', error)
            toast.error('Failed to clear issues', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            })
        }
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
            const data = await api.devices.scan(deviceId!)
            setActiveScanId((data as any).scan_id)

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
                            <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                <a
                                    href={`http://${device.ip_address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {device.ip_address}
                                </a>
                                {device.mac_address && (
                                    <>
                                        <span>•</span>
                                        <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted/50 text-foreground border border-border">
                                            {device.mac_address}
                                        </code>
                                    </>
                                )}
                                {networkData && (
                                    <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                                            <Wifi className="w-3 h-3 text-blue-600" />
                                            <span className="text-xs font-medium text-blue-700">
                                                {networkData.subnet}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
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
                                    <div className="flex items-center gap-2">
                                        {getDeviceOnlineBadge(device.last_seen)}
                                        {!isEditing ? (
                                            <Button size="sm" variant="outline" onClick={handleEdit}>
                                                <Edit2 className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleCancelEdit}
                                                    disabled={isSaving}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    {isSaving ? 'Saving...' : 'Save'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1">
                                            Manufacturer
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.manufacturer}
                                                onChange={e =>
                                                    setEditForm({
                                                        ...editForm,
                                                        manufacturer: e.target.value,
                                                    })
                                                }
                                                placeholder="Unknown"
                                                className="mt-1"
                                            />
                                        ) : (
                                            <p className="font-medium">
                                                {device.manufacturer || 'Unknown'}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1">
                                            Model
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.model}
                                                onChange={e =>
                                                    setEditForm({ ...editForm, model: e.target.value })
                                                }
                                                placeholder="Unknown"
                                                className="mt-1"
                                            />
                                        ) : (
                                            <p className="font-medium">{device.model || 'Unknown'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1">
                                            Device Type
                                        </Label>
                                        {isEditing ? (
                                            <Select
                                                value={editForm.device_type}
                                                onValueChange={value =>
                                                    setEditForm({ ...editForm, device_type: value })
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unknown">Unknown</SelectItem>
                                                    <SelectItem value="medical_device">
                                                        Medical Device
                                                    </SelectItem>
                                                    <SelectItem value="iot_device">
                                                        IoT Device
                                                    </SelectItem>
                                                    <SelectItem value="network_device">
                                                        Network Device
                                                    </SelectItem>
                                                    <SelectItem value="workstation">
                                                        Workstation
                                                    </SelectItem>
                                                    <SelectItem value="server">Server</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="font-medium capitalize">
                                                {device.device_type.replace(/_/g, ' ')}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1">
                                            Operating System
                                        </Label>
                                        {isEditing ? (
                                            <Select
                                                value={editForm.os || 'Unknown'}
                                                onValueChange={value =>
                                                    setEditForm({
                                                        ...editForm,
                                                        os: value === 'Unknown' ? '' : value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select OS" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Unknown">Unknown</SelectItem>
                                                    <SelectItem value="Linux">Linux</SelectItem>
                                                    <SelectItem value="Windows">Windows</SelectItem>
                                                    <SelectItem value="Windows 10">
                                                        Windows 10
                                                    </SelectItem>
                                                    <SelectItem value="Windows 11">
                                                        Windows 11
                                                    </SelectItem>
                                                    <SelectItem value="Windows Server">
                                                        Windows Server
                                                    </SelectItem>
                                                    <SelectItem value="macOS">macOS</SelectItem>
                                                    <SelectItem value="iOS">iOS</SelectItem>
                                                    <SelectItem value="Android">Android</SelectItem>
                                                    <SelectItem value="Unix">Unix</SelectItem>
                                                    <SelectItem value="FreeBSD">FreeBSD</SelectItem>
                                                    <SelectItem value="Ubuntu">Ubuntu</SelectItem>
                                                    <SelectItem value="Debian">Debian</SelectItem>
                                                    <SelectItem value="CentOS">CentOS</SelectItem>
                                                    <SelectItem value="Red Hat">Red Hat</SelectItem>
                                                    <SelectItem value="Firmware">Firmware</SelectItem>
                                                    <SelectItem value="Embedded Linux">
                                                        Embedded Linux
                                                    </SelectItem>
                                                    <SelectItem value="RTOS">
                                                        RTOS (Real-Time OS)
                                                    </SelectItem>
                                                    <SelectItem value="VxWorks">VxWorks</SelectItem>
                                                    <SelectItem value="QNX">QNX</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="font-medium">{device.os || 'Unknown'}</p>
                                        )}
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
                                        <a
                                            href={`http://${device.ip_address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {device.ip_address}
                                        </a>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">MAC Address</p>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.mac_address}
                                                onChange={e =>
                                                    setEditForm({
                                                        ...editForm,
                                                        mac_address: e.target.value,
                                                    })
                                                }
                                                placeholder="00:1A:2B:3C:4D:5E"
                                                className="font-mono"
                                            />
                                        ) : device.mac_address ? (
                                            <code className="font-mono text-sm px-2 py-1 rounded bg-muted/50 text-foreground border border-border inline-block">
                                                {device.mac_address}
                                            </code>
                                        ) : (
                                            <p className="font-medium text-muted-foreground">N/A</p>
                                        )}
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Network</p>
                                        {networkData ? (
                                            <div className="flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-blue-600" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {networkData.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {networkData.subnet}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="font-medium text-muted-foreground">
                                                Loading...
                                            </p>
                                        )}
                                    </div>

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
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Viewer */}
                        {(() => {
                            const allActivityScans = [
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
                                            : scan.status) as 'running' | 'completed' | 'failed' | 'cancelled',
                                        startedAt: scan.started_at,
                                        completedAt: scan.completed_at,
                                        vulnerabilitiesFound: scan.vulnerabilities.length,
                                    })),
                            ]
                            const recentScans = allActivityScans.filter(s => s.status !== 'running')

                            return (
                                <ActivityViewer
                                    deviceId={deviceId!}
                                    scans={allActivityScans}
                                    audits={[]}
                                    onScanComplete={(scanId, status) => {
                                        // Update the status in activity scans
                                        setActivityScans(prev =>
                                            prev.map(s =>
                                                s.id === scanId
                                                    ? {
                                                          ...s,
                                                          status:
                                                              status === 'completed'
                                                                  ? 'completed'
                                                                  : status === 'cancelled'
                                                                    ? 'cancelled'
                                                                    : 'failed',
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
                                    onClearStaleScan={scanId => {
                                        // Remove the stale scan from activity scans
                                        setActivityScans(prev => prev.filter(s => s.id !== scanId))
                                        // Optionally refresh the scans list
                                        queryClient.invalidateQueries({
                                            queryKey: ['scans', deviceId],
                                        })
                                        toast.success('Stale scan cleared', {
                                            description:
                                                'The scan has been removed from the activity list.',
                                        })
                                    }}
                                    onDeleteScan={async scanId => {
                                        try {
                                            await api.scans.delete(scanId)
                                            setActivityScans(prev => prev.filter(s => s.id !== scanId))
                                            queryClient.invalidateQueries({
                                                queryKey: ['scans', deviceId],
                                            })
                                            toast.success('Scan deleted', {
                                                description: 'The scan has been removed successfully.',
                                            })
                                        } catch (error: any) {
                                            // 404 means scan already deleted/never persisted - treat as success
                                            if (error?.message?.includes('Not Found')) {
                                                setActivityScans(prev => prev.filter(s => s.id !== scanId))
                                                queryClient.invalidateQueries({
                                                    queryKey: ['scans', deviceId],
                                                })
                                                toast.success('Scan removed', {
                                                    description: 'The scan has been removed from the list.',
                                                })
                                            } else {
                                                console.error('Failed to delete scan:', error)
                                                toast.error('Failed to delete scan', {
                                                    description:
                                                        'An error occurred while deleting the scan.',
                                                })
                                            }
                                        }
                                    }}
                                    onClearAll={async () => {
                                        try {
                                            const scanIds = recentScans.map(s => s.id)
                                            if (scanIds.length === 0) {
                                                toast.info('No scans to clear')
                                                return
                                            }
                                            await api.scans.bulkDelete({ scan_ids: scanIds })
                                            setActivityScans(prev =>
                                                prev.filter(s => !scanIds.includes(s.id)),
                                            )
                                            queryClient.invalidateQueries({
                                                queryKey: ['scans', deviceId],
                                            })
                                            toast.success('All scans cleared', {
                                                description: `${scanIds.length} scan(s) have been removed.`,
                                            })
                                        } catch (error) {
                                            console.error('Failed to clear all scans:', error)
                                            toast.error('Failed to clear scans', {
                                                description: 'An error occurred while clearing scans.',
                                            })
                                        }
                                    }}
                                />
                            )
                        })()}
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
                                                    onClick={handleClearIssues}
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
                                                        className={`h-4 w-4 ${
                                                            scansFetching ? 'animate-spin' : ''
                                                        }`}
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
