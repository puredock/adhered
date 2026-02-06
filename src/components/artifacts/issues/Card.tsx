import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Issue } from '../types'
import { severityBadgeStyles, severityStripStyles, VerificationBadge } from './Ui'

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
