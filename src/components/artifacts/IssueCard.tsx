import { CheckCircle2, ChevronRight, HelpCircle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Issue } from './types'

export interface IssueCardProps {
    issue: Issue
    onClick?: () => void
}

const severityStyles: Record<Issue['severity'], string> = {
    critical: 'bg-destructive text-destructive-foreground border-destructive/30',
    high: 'bg-destructive/85 text-destructive-foreground border-destructive/25',
    medium: 'bg-warning text-warning-foreground border-warning/30',
    low: 'bg-info text-info-foreground border-info/30',
    info: 'bg-secondary text-secondary-foreground border-border',
}

const severityStripStyles: Record<Issue['severity'], string> = {
    critical: 'bg-gradient-to-b from-destructive to-destructive/70',
    high: 'bg-gradient-to-b from-destructive/85 to-destructive/55',
    medium: 'bg-gradient-to-b from-warning to-warning/70',
    low: 'bg-gradient-to-b from-info to-info/70',
    info: 'bg-gradient-to-b from-muted-foreground to-muted-foreground/50',
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
    const getVerificationStatusBadge = () => {
        switch (issue.verification_status) {
            case 'confirmed':
                return (
                    <Badge className="bg-success/15 text-success border-success/25 text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Confirmed
                    </Badge>
                )
            case 'dismissed':
                return (
                    <Badge className="bg-muted text-muted-foreground border-border text-xs gap-1">
                        <X className="h-3 w-3" />
                        Dismissed
                    </Badge>
                )
            case 'needs_info':
                return (
                    <Badge className="bg-warning/15 text-warning border-warning/25 text-xs gap-1">
                        <HelpCircle className="h-3 w-3" />
                        Needs Info
                    </Badge>
                )
            default:
                return null
        }
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group relative w-full text-left border border-border rounded-xl overflow-hidden bg-card shadow-sm transition-all duration-200',
                'hover:shadow-card hover:border-primary/30 cursor-pointer',
            )}
        >
            {/* Severity indicator strip */}
            <div
                className={cn(
                    'absolute left-0 top-0 bottom-0 w-1.5',
                    severityStripStyles[issue.severity],
                )}
            />

            <div className="pl-6 pr-4 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-bold text-lg text-foreground leading-tight">
                            {issue.title}
                        </h4>
                        <Badge
                            className={cn(
                                'text-xs font-bold px-3 py-1 flex-shrink-0 shadow-sm',
                                severityStyles[issue.severity],
                            )}
                        >
                            {issue.severity.toUpperCase()}
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {issue.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        {getVerificationStatusBadge()}
                        {issue.category && (
                            <div className="flex items-center gap-1.5 text-muted-foreground bg-background/60 px-2.5 py-1 rounded-full border border-border">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="font-medium">{issue.category}</span>
                            </div>
                        )}
                        {issue.cvss_score && (
                            <div className="flex items-center gap-1.5 text-muted-foreground bg-background/60 px-2.5 py-1 rounded-full border border-border">
                                <span className="font-semibold text-warning">CVSS</span>
                                <span className="font-mono font-bold">
                                    {issue.cvss_score.toFixed(1)}
                                </span>
                            </div>
                        )}
                        {issue.cve_id && (
                            <div className="flex items-center gap-1.5 text-muted-foreground bg-background/60 px-2.5 py-1 rounded-full border border-border font-mono text-xs">
                                {issue.cve_id}
                            </div>
                        )}
                    </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
            </div>
        </button>
    )
}
