import { CheckCircle2, ChevronRight, HelpCircle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Issue } from './types'

export interface IssueCardProps {
    issue: Issue
    onClick?: () => void
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
    const getVerificationStatusBadge = () => {
        switch (issue.verification_status) {
            case 'confirmed':
                return (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Confirmed
                    </Badge>
                )
            case 'dismissed':
                return (
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs gap-1">
                        <X className="h-3 w-3" />
                        Dismissed
                    </Badge>
                )
            case 'needs_info':
                return (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs gap-1">
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
                'group relative w-full text-left border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-200',
                'hover:shadow-md hover:border-primary/30 cursor-pointer',
            )}
        >
            {/* Severity indicator strip */}
            <div
                className={cn(
                    'absolute left-0 top-0 bottom-0 w-1.5',
                    issue.severity === 'critical' && 'bg-gradient-to-b from-red-600 to-red-400',
                    issue.severity === 'high' && 'bg-gradient-to-b from-orange-600 to-orange-400',
                    issue.severity === 'medium' && 'bg-gradient-to-b from-yellow-600 to-yellow-400',
                    issue.severity === 'low' && 'bg-gradient-to-b from-blue-600 to-blue-400',
                    issue.severity === 'info' && 'bg-gradient-to-b from-gray-600 to-gray-400',
                )}
            />

            <div className="pl-6 pr-4 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-bold text-lg text-slate-900 leading-tight">{issue.title}</h4>
                        <Badge
                            className={cn(
                                'text-xs font-bold px-3 py-1 flex-shrink-0 shadow-sm',
                                issue.severity === 'critical' && 'bg-red-500 text-white border-red-600',
                                issue.severity === 'high' &&
                                    'bg-orange-500 text-white border-orange-600',
                                issue.severity === 'medium' &&
                                    'bg-yellow-500 text-white border-yellow-600',
                                issue.severity === 'low' && 'bg-blue-500 text-white border-blue-600',
                                issue.severity === 'info' && 'bg-gray-500 text-white border-gray-600',
                            )}
                        >
                            {issue.severity.toUpperCase()}
                        </Badge>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{issue.description}</p>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        {getVerificationStatusBadge()}
                        {issue.category && (
                            <div className="flex items-center gap-1.5 text-slate-600 bg-white/60 px-2.5 py-1 rounded-full border border-slate-200">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="font-medium">{issue.category}</span>
                            </div>
                        )}
                        {issue.cvss_score && (
                            <div className="flex items-center gap-1.5 text-slate-600 bg-white/60 px-2.5 py-1 rounded-full border border-slate-200">
                                <span className="font-semibold text-orange-600">CVSS</span>
                                <span className="font-mono font-bold">
                                    {issue.cvss_score.toFixed(1)}
                                </span>
                            </div>
                        )}
                        {issue.cve_id && (
                            <div className="flex items-center gap-1.5 text-slate-600 bg-white/60 px-2.5 py-1 rounded-full border border-slate-200 font-mono text-xs">
                                {issue.cve_id}
                            </div>
                        )}
                    </div>
                </div>

                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0 mt-1" />
            </div>
        </button>
    )
}
