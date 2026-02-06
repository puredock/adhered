import { ChevronRight, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Issue } from '../types'
import { RemediationBadge, severityBadgeStyles, severityStripStyles, VerificationBadge } from './Ui'

export interface IssueCardProps {
    issue: Issue
    onClick?: () => void
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group relative w-full text-left border border-border rounded-xl overflow-hidden bg-card transition-all duration-200',
                'hover:border-primary/30 hover:bg-primary/[0.02] cursor-pointer',
            )}
        >
            {/* Severity indicator strip */}
            <div
                className={cn(
                    'absolute left-0 top-0 bottom-0 w-1.5',
                    severityStripStyles[issue.severity],
                )}
            />

            <div className="pl-6 pr-4 py-3.5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1.5">
                        <h4 className="font-bold text-base text-foreground leading-tight">
                            {issue.title}
                        </h4>
                        <Badge
                            className={cn(
                                'text-[11px] font-bold px-2.5 py-0.5 flex-shrink-0',
                                severityBadgeStyles[issue.severity],
                            )}
                        >
                            {issue.severity.toUpperCase()}
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {issue.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        {issue.verification_status && issue.verification_status !== 'pending' && (
                            <VerificationBadge status={issue.verification_status} />
                        )}
                        <RemediationBadge status={issue.remediation_status} />
                        {issue.cvss_score && (
                            <span className="inline-flex items-center gap-1 text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/60">
                                <span className="font-semibold text-warning">CVSS</span>
                                <span className="font-mono font-bold">
                                    {issue.cvss_score.toFixed(1)}
                                </span>
                            </span>
                        )}
                        {issue.id && (
                            <span className="text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-md border border-border/60">
                                {issue.id}
                            </span>
                        )}
                        {issue.cve_id && (
                            <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 font-mono bg-muted/50 px-2 py-0.5 rounded-md border border-border/60">
                                {issue.cve_id}
                                <ExternalLink className="h-2.5 w-2.5" />
                            </span>
                        )}
                        {issue.category && (
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/60">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="font-medium">{issue.category}</span>
                            </span>
                        )}
                    </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
            </div>
        </button>
    )
}
