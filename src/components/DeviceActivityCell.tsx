import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatTimeAgo } from '@/lib/time'
import { Scan } from 'lucide-react'

interface DeviceActivityCellProps {
    lastSeen: string
    discoveredAt: string
    scanCount: number
    lastScannedAt?: string | null
}

/**
 * Get activity status based on last seen time
 */
function getActivityStatus(lastSeen: string): {
    status: 'online' | 'away' | 'offline'
    label: string
    dotClass: string
    textClass: string
} {
    const now = new Date()
    const lastSeenDate = new Date(lastSeen)
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 5) {
        return {
            status: 'online',
            label: 'Online',
            dotClass: 'bg-success',
            textClass: 'text-success',
        }
    } else if (diffInMinutes < 60) {
        return {
            status: 'away',
            label: 'Away',
            dotClass: 'bg-warning',
            textClass: 'text-warning',
        }
    } else {
        return {
            status: 'offline',
            label: formatTimeAgo(lastSeen),
            dotClass: 'bg-muted-foreground/40',
            textClass: 'text-muted-foreground',
        }
    }
}

/**
 * Format full date for tooltip
 */
function formatFullDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}

export function DeviceActivityCell({
    lastSeen,
    discoveredAt,
    scanCount,
    lastScannedAt,
}: DeviceActivityCellProps) {
    const activity = getActivityStatus(lastSeen)

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex flex-col gap-0.5 cursor-default">
                    {/* Status line */}
                    <div className="flex items-center gap-1.5">
                        <span
                            className={`w-2 h-2 rounded-full shrink-0 ${activity.dotClass} ${activity.status === 'online' ? 'animate-pulse' : ''}`}
                        />
                        <span className={`text-sm ${activity.textClass}`}>
                            {activity.label}
                        </span>
                    </div>

                    {/* Scan count line */}
                    <div className="flex items-center gap-1">
                        <Scan className={`w-3 h-3 ${scanCount > 0 ? 'text-primary' : 'text-muted-foreground/40'}`} />
                        <span className={`text-xs ${scanCount > 0 ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                            {scanCount === 1 ? '1 scan' : `${scanCount} scans`}
                        </span>
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
                <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Last Active</span>
                        <span className="font-medium">{formatFullDate(lastSeen)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Discovered</span>
                        <span className="font-medium">{formatFullDate(discoveredAt)}</span>
                    </div>
                    <div className="h-px bg-border my-0.5" />
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Total Scans</span>
                        <span className="font-medium">{scanCount}</span>
                    </div>
                    {lastScannedAt && (
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Last Scan</span>
                            <span className="font-medium">{formatFullDate(lastScannedAt)}</span>
                        </div>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    )
}
