import { CheckCircle2, Clock, HelpCircle, Loader2, ShieldCheck, X, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Issue, IssueVerificationStatus, RemediationStatus } from '../types'

export const severityBadgeStyles: Record<Issue['severity'], string> = {
    critical: 'bg-destructive text-destructive-foreground border-destructive/30',
    high: 'bg-destructive/85 text-destructive-foreground border-destructive/25',
    medium: 'bg-warning text-warning-foreground border-warning/30',
    low: 'bg-info text-info-foreground border-info/30',
    info: 'bg-secondary text-secondary-foreground border-border',
}

export const severityStripStyles: Record<Issue['severity'], string> = {
    critical: 'bg-gradient-to-b from-destructive to-destructive/70',
    high: 'bg-gradient-to-b from-destructive/85 to-destructive/55',
    medium: 'bg-gradient-to-b from-warning to-warning/70',
    low: 'bg-gradient-to-b from-info to-info/70',
    info: 'bg-gradient-to-b from-muted-foreground to-muted-foreground/50',
}

export const verificationConfig: Record<
    IssueVerificationStatus,
    { className: string; icon: React.ReactNode; label: string }
> = {
    confirmed: {
        className: 'bg-success/15 text-success border-success/25',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        label: 'Confirmed',
    },
    dismissed: {
        className: 'bg-muted text-muted-foreground border-border',
        icon: <X className="h-3.5 w-3.5" />,
        label: 'Dismissed',
    },
    needs_info: {
        className: 'bg-warning/15 text-warning border-warning/25',
        icon: <HelpCircle className="h-3.5 w-3.5" />,
        label: 'Needs Info',
    },
    reproducing: {
        className: 'bg-info/15 text-info border-info/25',
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
        label: 'Reproducing',
    },
    pending: {
        className: 'bg-secondary text-muted-foreground border-border',
        icon: <Clock className="h-3.5 w-3.5" />,
        label: 'Pending Review',
    },
}

export const remediationConfig: Partial<
    Record<RemediationStatus, { className: string; icon: React.ReactNode; label: string }>
> = {
    applied: {
        className: 'bg-success/15 text-success border-success/25',
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: 'Applied',
    },
    verified: {
        className: 'bg-success text-success-foreground border-success/30',
        icon: <ShieldCheck className="h-3 w-3" />,
        label: 'Verified',
    },
    in_progress: {
        className: 'bg-info/15 text-info border-info/25',
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
        label: 'In Progress',
    },
    failed: {
        className: 'bg-destructive/15 text-destructive border-destructive/25',
        icon: <XCircle className="h-3 w-3" />,
        label: 'Failed',
    },
}

export function VerificationBadge({ status = 'pending' }: { status?: IssueVerificationStatus }) {
    const config = verificationConfig[status]
    return (
        <Badge className={cn('text-xs gap-1', config.className)}>
            {config.icon}
            {config.label}
        </Badge>
    )
}

export function RemediationBadge({ status }: { status?: RemediationStatus }) {
    if (!status || !remediationConfig[status]) return null
    const config = remediationConfig[status]!
    return (
        <Badge className={cn('text-xs gap-1', config.className)}>
            {config.icon}
            {config.label}
        </Badge>
    )
}

export function formatIssueDate(dateStr?: string): string | null {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
