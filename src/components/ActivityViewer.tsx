import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    Clock,
    History,
    Loader2,
    ScanLine,
    Trash2,
    X,
} from 'lucide-react'
import { useState } from 'react'
import { PenetrationTestLog } from '@/components/PenetrationTestLog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type ActivityType = 'scans' | 'audits'
type ActivityTab = 'ongoing' | 'recent'

interface ActivityEntry {
    id: string
    type: 'scan' | 'audit'
    name: string
    status: 'running' | 'completed' | 'failed' | 'cancelled'
    startedAt: string
    completedAt?: string
    vulnerabilitiesFound?: number
}

interface ActivityViewerProps {
    deviceId: string
    scans?: ActivityEntry[]
    audits?: ActivityEntry[]
    onActivityClick?: (activityId: string) => void
    onScanComplete?: (scanId: string, status: string) => void
    onClearStaleScan?: (scanId: string) => void
    onDeleteScan?: (scanId: string) => void
    onClearAll?: () => void
}

export function ActivityViewer({
    deviceId,
    scans = [],
    audits = [],
    onScanComplete,
    onClearStaleScan,
    onDeleteScan,
    onClearAll,
}: ActivityViewerProps) {
    const [activityType, setActivityType] = useState<ActivityType>('scans')
    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
    const [mountKey, setMountKey] = useState(0)
    const [scanStates, setScanStates] = useState<Record<string, { steps: any[]; logs: any[] }>>({})

    const getStatusIcon = (status: ActivityEntry['status']) => {
        switch (status) {
            case 'running':
                return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />
            case 'failed':
                return <AlertTriangle className="w-4 h-4 text-red-500" />
            case 'cancelled':
                return <X className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusBadge = (status: ActivityEntry['status']) => {
        const variants = {
            running: 'default',
            completed: 'default',
            failed: 'destructive',
            cancelled: 'secondary',
        }

        return (
            <Badge variant={variants[status] as any} className="capitalize">
                {status}
            </Badge>
        )
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}h ago`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}d ago`
    }

    const currentActivities = activityType === 'scans' ? scans : audits
    const ongoingActivities = currentActivities.filter(a => a.status === 'running')
    const recentActivities = currentActivities.filter(a => a.status !== 'running')

    const handleActivityClick = (activityId: string) => {
        console.log('Activity clicked:', activityId, 'Current selected:', selectedActivityId)
        setSelectedActivityId(prevId => {
            const newId = prevId === activityId ? null : activityId
            console.log('Setting selected ID to:', newId)
            if (newId !== null) {
                setMountKey(prev => prev + 1)
            }
            return newId
        })
    }

    const getActivityTypeIcon = () => {
        return activityType === 'scans' ? (
            <ScanLine className="w-4 h-4" />
        ) : (
            <ClipboardCheck className="w-4 h-4" />
        )
    }

    const getActivityTypeLabel = () => {
        return activityType === 'scans' ? 'Scans' : 'Audits'
    }

    const handleDeleteScan = async (e: React.MouseEvent, scanId: string, isRunning: boolean) => {
        e.stopPropagation()
        const message = isRunning
            ? 'This scan is currently running. Deleting it will terminate the scan and remove all data. Are you sure?'
            : 'Are you sure you want to delete this scan?'
        if (confirm(message)) {
            onDeleteScan?.(scanId)
        }
    }

    const renderActivityEntry = (activity: ActivityEntry) => {
        const isSelected = selectedActivityId === activity.id

        return (
            <div key={activity.id} className="space-y-2 group">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => handleActivityClick(activity.id)}
                        className={cn(
                            'w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent',
                            isSelected ? 'bg-accent border-primary' : 'bg-card border-border',
                        )}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            {getStatusIcon(activity.status)}
                            <div className="flex-1 text-left">
                                <p className="font-medium">{activity.name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTimeAgo(activity.startedAt)}</span>
                                    {activity.vulnerabilitiesFound !== undefined &&
                                        activity.vulnerabilitiesFound > 0 && (
                                            <>
                                                <span>•</span>
                                                <span className="text-orange-600">
                                                    {activity.vulnerabilitiesFound} vulnerabilities
                                                </span>
                                            </>
                                        )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(activity.status)}
                            <ChevronRight
                                className={cn(
                                    'w-4 h-4 transition-transform text-muted-foreground',
                                    isSelected && 'rotate-90',
                                )}
                            />
                        </div>
                    </button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={e => handleDeleteScan(e, activity.id, activity.status === 'running')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {isSelected && (
                    <div className="mt-3 ml-8 pl-4 border-l-2 border-muted space-y-2">
                        <PenetrationTestLog
                            scanId={activity.id}
                            initialStatus={activity.status}
                            persistedState={scanStates[activity.id]}
                            onStateChange={newState => {
                                setScanStates(prev => ({
                                    ...prev,
                                    [activity.id]: newState,
                                }))
                            }}
                            onComplete={status => {
                                console.log(`Activity ${activity.id} completed with status: ${status}`)
                                onScanComplete?.(activity.id, status)
                            }}
                            onCancel={() => {
                                setSelectedActivityId(null)
                            }}
                            onClearStaleScan={onClearStaleScan}
                        />
                    </div>
                )}
            </div>
        )
    }

    return (
        <Card className="shadow-card border-border">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Activity
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {recentActivities.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    if (
                                        confirm(
                                            `Are you sure you want to clear all ${recentActivities.length} recent ${activityType}?`,
                                        )
                                    ) {
                                        onClearAll?.()
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear All
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    {getActivityTypeIcon()}
                                    {getActivityTypeLabel()}
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                    onClick={() => setActivityType('scans')}
                                    className={cn(
                                        'gap-2 cursor-pointer',
                                        activityType === 'scans' && 'bg-accent',
                                    )}
                                >
                                    <ScanLine className="w-4 h-4" />
                                    Scans
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setActivityType('audits')}
                                    className={cn(
                                        'gap-2 cursor-pointer',
                                        activityType === 'audits' && 'bg-accent',
                                    )}
                                >
                                    <ClipboardCheck className="w-4 h-4" />
                                    Audits
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="ongoing" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ongoing">
                            Ongoing {ongoingActivities.length > 0 && `(${ongoingActivities.length})`}
                        </TabsTrigger>
                        <TabsTrigger value="recent">
                            Recent {recentActivities.length > 0 && `(${recentActivities.length})`}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ongoing" className="mt-4 space-y-3">
                        {ongoingActivities.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No ongoing {activityType}
                            </p>
                        ) : (
                            ongoingActivities.map(renderActivityEntry)
                        )}
                    </TabsContent>

                    <TabsContent value="recent" className="mt-4 space-y-3">
                        {recentActivities.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No recent {activityType}
                            </p>
                        ) : (
                            recentActivities.map(renderActivityEntry)
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
