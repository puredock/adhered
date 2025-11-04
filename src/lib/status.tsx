import { Badge } from '@/components/ui/badge'

/**
 * Get status badge for network status
 */
export function getNetworkStatusBadge(status: 'active' | 'inactive' | 'scanning') {
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

    const config = variants[status] || variants.active
    return (
        <Badge variant="outline" className={config.className}>
            {config.text}
        </Badge>
    )
}

/**
 * Get status badge for device online status based on last seen time
 */
export function getDeviceOnlineBadge(lastSeen: string) {
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

/**
 * Get device online status string
 */
export function getDeviceStatus(lastSeen: string): 'online' | 'away' | 'offline' {
    const now = new Date()
    const lastSeenDate = new Date(lastSeen)
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 5) return 'online'
    if (diffInMinutes < 60) return 'away'
    return 'offline'
}

/**
 * Get status badge for scan status
 */
export function getScanStatusBadge(status: 'pending' | 'in_progress' | 'completed' | 'failed') {
    const variants = {
        pending: {
            text: 'Pending',
            className: 'bg-warning/10 text-warning border-warning/20',
        },
        in_progress: {
            text: 'In Progress',
            className: 'bg-primary/10 text-primary border-primary/20',
        },
        completed: {
            text: 'Completed',
            className: 'bg-success/10 text-success border-success/20',
        },
        failed: {
            text: 'Failed',
            className: 'bg-destructive/10 text-destructive border-destructive/20',
        },
    }

    const config = variants[status] || variants.pending
    return (
        <Badge variant="outline" className={config.className}>
            {config.text}
        </Badge>
    )
}
