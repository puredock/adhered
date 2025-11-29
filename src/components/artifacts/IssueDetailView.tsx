import {
    AlertCircle,
    ArrowLeft,
    Camera,
    CheckCircle2,
    ChevronDown,
    Clock,
    Code2,
    ExternalLink,
    HelpCircle,
    Loader2,
    Play,
    ShieldCheck,
    Terminal,
    User,
    Video,
    X,
    XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Issue, IssueVerificationStatus, ReproductionSession } from './types'

export interface IssueDetailViewProps {
    issue: Issue
    onBack: () => void
    onStatusChange?: (issueId: string, status: IssueVerificationStatus, notes?: string) => void
    onStartReproduction?: (issueId: string, type: 'scriptreplay' | 'browser' | 'manual') => void
    isReproducing?: boolean
}

export function IssueDetailView({
    issue,
    onBack,
    onStatusChange,
    onStartReproduction,
    isReproducing = false,
}: IssueDetailViewProps) {
    const [reviewerNotes, setReviewerNotes] = useState(issue.reviewer_notes || '')
    const [showReproductionOptions, setShowReproductionOptions] = useState(false)
    const [expandedSections, setExpandedSections] = useState({
        description: true,
        reproduction: true,
        remediation: true,
        sessions: false,
    })

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const getVerificationStatusBadge = (status?: IssueVerificationStatus) => {
        switch (status) {
            case 'confirmed':
                return (
                    <Badge className="bg-green-500 text-white border-green-600 gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmed
                    </Badge>
                )
            case 'dismissed':
                return (
                    <Badge className="bg-slate-500 text-white border-slate-600 gap-1.5">
                        <X className="h-3.5 w-3.5" />
                        Dismissed
                    </Badge>
                )
            case 'needs_info':
                return (
                    <Badge className="bg-purple-500 text-white border-purple-600 gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5" />
                        Needs Info
                    </Badge>
                )
            case 'reproducing':
                return (
                    <Badge className="bg-blue-500 text-white border-blue-600 gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Reproducing
                    </Badge>
                )
            default:
                return (
                    <Badge
                        variant="outline"
                        className="gap-1.5 text-amber-600 border-amber-300 bg-amber-50"
                    >
                        <Clock className="h-3.5 w-3.5" />
                        Pending Review
                    </Badge>
                )
        }
    }

    const getSeverityBadge = (severity: Issue['severity']) => {
        const styles = {
            critical: 'bg-red-500 text-white border-red-600',
            high: 'bg-orange-500 text-white border-orange-600',
            medium: 'bg-yellow-500 text-white border-yellow-600',
            low: 'bg-blue-500 text-white border-blue-600',
            info: 'bg-gray-500 text-white border-gray-600',
        }
        return (
            <Badge className={cn('text-xs font-bold px-3 py-1', styles[severity])}>
                {severity.toUpperCase()}
            </Badge>
        )
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex-shrink-0 border-b bg-gradient-to-r from-slate-50 via-white to-slate-50">
                <div className="px-6 py-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="mb-3 -ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Issues
                    </Button>

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="font-bold text-xl text-slate-900 leading-tight">
                                    {issue.title}
                                </h2>
                                {getSeverityBadge(issue.severity)}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                {issue.cve_id && (
                                    <a
                                        href={`https://nvd.nist.gov/vuln/detail/${issue.cve_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-blue-600 hover:underline font-mono"
                                    >
                                        {issue.cve_id}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {issue.cvss_score && (
                                    <span className="font-medium">
                                        CVSS: {issue.cvss_score.toFixed(1)}
                                    </span>
                                )}
                                {issue.category && (
                                    <Badge variant="outline" className="font-normal">
                                        {issue.category}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Verification Status */}
                        <div className="flex-shrink-0">
                            {getVerificationStatusBadge(issue.verification_status)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Two Column Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Column - Main Content */}
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6 pr-4">
                        {/* Description Section */}
                        <Card className="overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleSection('description')}
                                className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold text-sm">Description</span>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 text-slate-500 transition-transform',
                                        expandedSections.description && 'rotate-180',
                                    )}
                                />
                            </button>
                            {expandedSections.description && (
                                <div className="px-4 py-4 space-y-4">
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {issue.description}
                                    </p>

                                    {issue.affected_component && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                                Affected Component
                                            </label>
                                            <code className="block mt-1 text-sm text-purple-700 font-mono bg-purple-50 px-3 py-2 rounded-md border border-purple-200">
                                                {issue.affected_component}
                                            </code>
                                        </div>
                                    )}

                                    {issue.impact && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                                Impact
                                            </label>
                                            <p className="mt-1 text-sm text-slate-700">{issue.impact}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Reproduction Steps Section */}
                        <Card className="overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleSection('reproduction')}
                                className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Code2 className="h-4 w-4 text-cyan-600" />
                                    <span className="font-semibold text-sm">Steps to Reproduce</span>
                                    {issue.reproduction_steps && issue.reproduction_steps.length > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                            {issue.reproduction_steps.length} steps
                                        </Badge>
                                    )}
                                </div>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 text-slate-500 transition-transform',
                                        expandedSections.reproduction && 'rotate-180',
                                    )}
                                />
                            </button>
                            {expandedSections.reproduction && (
                                <div className="px-4 py-4">
                                    {issue.reproduction_steps && issue.reproduction_steps.length > 0 ? (
                                        <ol className="space-y-3 mb-4">
                                            {issue.reproduction_steps.map((step, idx) => (
                                                <li key={`step-${idx}`} className="flex gap-3 text-sm">
                                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs flex items-center justify-center">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="flex-1 text-slate-700 leading-relaxed pt-0.5">
                                                        {step}
                                                    </span>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <p className="text-sm text-muted-foreground mb-4">
                                            No specific reproduction steps documented. Use the reproduce
                                            button below to attempt automatic reproduction.
                                        </p>
                                    )}

                                    {/* Reproduce Issue Button */}
                                    <div className="pt-4 border-t">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-700">
                                                    Recreate Issue
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Automatically attempt to reproduce this issue and record
                                                the session for verification.
                                            </p>
                                            {showReproductionOptions ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            onStartReproduction?.(
                                                                issue.id,
                                                                'scriptreplay',
                                                            )
                                                        }
                                                        disabled={isReproducing}
                                                        className="gap-1.5 flex-1"
                                                    >
                                                        <Terminal className="h-3.5 w-3.5" />
                                                        Terminal (scriptreplay)
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            onStartReproduction?.(issue.id, 'browser')
                                                        }
                                                        disabled={isReproducing}
                                                        className="gap-1.5 flex-1"
                                                    >
                                                        <Video className="h-3.5 w-3.5" />
                                                        Browser (playwright)
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setShowReproductionOptions(false)}
                                                        className="w-full"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => setShowReproductionOptions(true)}
                                                    disabled={isReproducing}
                                                    className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 w-full"
                                                >
                                                    {isReproducing ? (
                                                        <>
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            Reproducing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-3.5 w-3.5" />
                                                            Reproduce Issue
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Remediation Section */}
                        {issue.remediation && (
                            <Card className="overflow-hidden border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                                <button
                                    type="button"
                                    onClick={() => toggleSection('remediation')}
                                    className="w-full px-4 py-3 flex items-center justify-between bg-green-50 hover:bg-green-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-green-600" />
                                        <span className="font-semibold text-sm text-green-900">
                                            Remediation
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 text-green-600 transition-transform',
                                            expandedSections.remediation && 'rotate-180',
                                        )}
                                    />
                                </button>
                                {expandedSections.remediation && (
                                    <div className="px-4 py-4">
                                        <p className="text-sm text-green-800 leading-relaxed">
                                            {issue.remediation}
                                        </p>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Past Reproduction Sessions */}
                        {issue.reproduction_sessions && issue.reproduction_sessions.length > 0 && (
                            <Card className="overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => toggleSection('sessions')}
                                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Camera className="h-4 w-4 text-purple-600" />
                                        <span className="font-semibold text-sm">
                                            Reproduction Sessions
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                            {issue.reproduction_sessions.length}
                                        </Badge>
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 text-slate-500 transition-transform',
                                            expandedSections.sessions && 'rotate-180',
                                        )}
                                    />
                                </button>
                                {expandedSections.sessions && (
                                    <div className="px-4 py-4 space-y-3">
                                        {issue.reproduction_sessions.map(session => (
                                            <div
                                                key={session.id}
                                                className="p-3 rounded-lg border bg-slate-50/50 space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'text-xs',
                                                                session.status === 'completed' &&
                                                                    'bg-green-50 text-green-700 border-green-200',
                                                                session.status === 'failed' &&
                                                                    'bg-red-50 text-red-700 border-red-200',
                                                                session.status === 'running' &&
                                                                    'bg-blue-50 text-blue-700 border-blue-200',
                                                            )}
                                                        >
                                                            {session.status}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {session.type}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(session.timestamp)}
                                                    </span>
                                                </div>
                                                {session.notes && (
                                                    <p className="text-sm text-slate-600">
                                                        {session.notes}
                                                    </p>
                                                )}
                                                {session.artifacts?.screenshots &&
                                                    session.artifacts.screenshots.length > 0 && (
                                                        <div className="flex gap-2 mt-2">
                                                            {session.artifacts.screenshots.map(
                                                                (url, idx) => (
                                                                    <a
                                                                        key={idx}
                                                                        href={url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                                    >
                                                                        <Camera className="h-3 w-3" />
                                                                        Screenshot {idx + 1}
                                                                    </a>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>
                </ScrollArea>

                {/* Right Column - Details Panel */}
                <div className="w-80 border-l bg-slate-50/50 flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-6">
                            {/* Details Section */}
                            <div>
                                <h4 className="font-semibold text-sm text-slate-700 mb-3">Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Status</span>
                                        {getVerificationStatusBadge(issue.verification_status)}
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Severity</span>
                                        {getSeverityBadge(issue.severity)}
                                    </div>
                                    {issue.category && (
                                        <>
                                            <Separator />
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Category</span>
                                                <span className="text-slate-700">{issue.category}</span>
                                            </div>
                                        </>
                                    )}
                                    {issue.confirmed_by && (
                                        <>
                                            <Separator />
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-slate-500">Confirmed by</span>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-slate-700">
                                                        {issue.confirmed_by}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {issue.confirmed_at && (
                                        <>
                                            <Separator />
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Confirmed</span>
                                                <span className="text-slate-700">
                                                    {formatDate(issue.confirmed_at)}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Reviewer Notes */}
                            <div>
                                <h4 className="font-semibold text-sm text-slate-700 mb-3">
                                    Reviewer Notes
                                </h4>
                                <Textarea
                                    placeholder="Add notes about this issue..."
                                    value={reviewerNotes}
                                    onChange={e => setReviewerNotes(e.target.value)}
                                    className="min-h-[100px] text-sm resize-none"
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Action Buttons */}
                    <div className="p-4 border-t bg-white">
                        {/* Show status message if already actioned */}
                        {issue.verification_status === 'confirmed' && (
                            <div className="text-center py-3 text-sm text-green-600 flex items-center justify-center gap-2 bg-green-50 rounded-lg mb-3">
                                <CheckCircle2 className="h-4 w-4" />
                                Issue confirmed
                            </div>
                        )}
                        {issue.verification_status === 'dismissed' && (
                            <div className="text-center py-3 text-sm text-slate-500 flex items-center justify-center gap-2 bg-slate-100 rounded-lg mb-3">
                                <X className="h-4 w-4" />
                                Issue dismissed
                            </div>
                        )}
                        {issue.verification_status === 'needs_info' && (
                            <div className="text-center py-3 text-sm text-purple-600 flex items-center justify-center gap-2 bg-purple-50 rounded-lg mb-3">
                                <HelpCircle className="h-4 w-4" />
                                Needs more information
                            </div>
                        )}

                        {/* Action buttons - show when pending or allow changing status */}
                        <div className="space-y-2">
                            {issue.verification_status !== 'confirmed' && (
                                <Button
                                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                                    onClick={() =>
                                        onStatusChange?.(issue.id, 'confirmed', reviewerNotes)
                                    }
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Confirm
                                </Button>
                            )}

                            <div className="flex gap-2">
                                {issue.verification_status !== 'dismissed' && (
                                    <Button
                                        variant="outline"
                                        className="flex-1 gap-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                                        onClick={() =>
                                            onStatusChange?.(issue.id, 'dismissed', reviewerNotes)
                                        }
                                    >
                                        <X className="h-4 w-4" />
                                        Dismiss
                                    </Button>
                                )}
                                {issue.verification_status !== 'needs_info' && (
                                    <Button
                                        variant="outline"
                                        className="flex-1 gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                                        onClick={() =>
                                            onStatusChange?.(issue.id, 'needs_info', reviewerNotes)
                                        }
                                    >
                                        <HelpCircle className="h-4 w-4" />
                                        Needs Info
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
