import { AlertCircle, CheckCircle2, ChevronDown, Code2, Info, Terminal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Issue } from './types'

export interface IssueCardProps {
    issue: Issue
    expanded: boolean
    onToggle: () => void
}

export function IssueCard({ issue, expanded, onToggle }: IssueCardProps) {
    return (
        <div
            className={cn(
                'group relative border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300',
                expanded && 'shadow-lg',
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

            {/* Clickable header */}
            <button
                type="button"
                onClick={onToggle}
                className="relative w-full text-left pl-6 pr-4 py-4 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 border-b flex items-start gap-4 hover:bg-slate-50/60 transition-colors"
                aria-expanded={expanded}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-bold text-lg text-slate-900 leading-tight">{issue.title}</h4>
                        <Badge
                            className={cn(
                                'text-xs font-bold px-3 py-1 flex-shrink-0 shadow-sm',
                                issue.severity === 'critical' &&
                                    'bg-red-500 text-white border-red-600 hover:bg-red-600',
                                issue.severity === 'high' &&
                                    'bg-orange-500 text-white border-orange-600 hover:bg-orange-600',
                                issue.severity === 'medium' &&
                                    'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600',
                                issue.severity === 'low' &&
                                    'bg-blue-500 text-white border-blue-600 hover:bg-blue-600',
                                issue.severity === 'info' &&
                                    'bg-gray-500 text-white border-gray-600 hover:bg-gray-600',
                            )}
                        >
                            {issue.severity.toUpperCase()}
                        </Badge>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{issue.description}</p>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
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

                <ChevronDown
                    className={cn(
                        'h-5 w-5 mt-1 text-slate-500 transition-transform flex-shrink-0',
                        expanded && 'rotate-180',
                    )}
                />
            </button>

            {/* Collapsible body */}
            {expanded && (
                <div className="pl-6 pr-4 py-5 space-y-5">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center">
                                <Info className="h-3 w-3 text-blue-600" />
                            </div>
                            <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Description
                            </h5>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed pl-7">
                            {issue.description}
                        </p>
                    </div>

                    {issue.affected_component && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 w-5 rounded-md bg-purple-100 flex items-center justify-center">
                                    <Terminal className="h-3 w-3 text-purple-600" />
                                </div>
                                <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                    Affected Component
                                </h5>
                            </div>
                            <div className="pl-7">
                                <code className="text-sm text-purple-700 font-mono bg-purple-50 px-3 py-1.5 rounded-md border border-purple-200 inline-block">
                                    {issue.affected_component}
                                </code>
                            </div>
                        </div>
                    )}

                    {issue.impact && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 w-5 rounded-md bg-orange-100 flex items-center justify-center">
                                    <AlertCircle className="h-3 w-3 text-orange-600" />
                                </div>
                                <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                    Impact
                                </h5>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed pl-7">{issue.impact}</p>
                        </div>
                    )}

                    {issue.reproduction_steps && issue.reproduction_steps.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 w-5 rounded-md bg-cyan-100 flex items-center justify-center">
                                    <Code2 className="h-3 w-3 text-cyan-600" />
                                </div>
                                <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                    Steps to Reproduce
                                </h5>
                            </div>
                            <ol className="space-y-2 pl-7">
                                {issue.reproduction_steps.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-slate-700">
                                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs flex items-center justify-center">
                                            {idx + 1}
                                        </span>
                                        <span className="flex-1 leading-relaxed pt-0.5">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {issue.remediation && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-6 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                                <h5 className="text-sm font-bold text-green-900 uppercase tracking-wide">
                                    Remediation
                                </h5>
                            </div>
                            <p className="text-sm text-green-800 leading-relaxed pl-8">
                                {issue.remediation}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
