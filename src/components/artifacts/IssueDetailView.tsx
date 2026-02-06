import {
    AlertCircle,
    ArrowLeft,
    Camera,
    CheckCircle2,
    Clock,
    ExternalLink,
    HelpCircle,
    Loader2,
    MessageSquareText,
    Play,
    Save,
    ShieldCheck,
    Terminal,
    TestTubeDiagonal,
    User,
    Video,
    Wrench,
    X,
    XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Issue, IssueVerificationStatus, RemediationStatus } from './types'

export interface IssueDetailViewProps {
    issue: Issue
    onBack: () => void
    onStatusChange?: (issueId: string, status: IssueVerificationStatus, notes?: string) => void
    onSaveNotes?: (issueId: string, notes: string) => void
    onStartReproduction?: (issueId: string, type: 'scriptreplay' | 'browser' | 'manual') => void
    onStartRemediation?: (issueId: string, type: 'automated' | 'manual') => void
    isReproducing?: boolean
    isRemediating?: boolean
}

const severityStyles: Record<Issue['severity'], string> = {
    critical: 'bg-destructive text-destructive-foreground border-destructive/30',
    high: 'bg-destructive/85 text-destructive-foreground border-destructive/25',
    medium: 'bg-warning text-warning-foreground border-warning/30',
    low: 'bg-info text-info-foreground border-info/30',
    info: 'bg-secondary text-secondary-foreground border-border',
}

const verificationStyles: Record<string, string> = {
    confirmed: 'bg-success/15 text-success border-success/25',
    dismissed: 'bg-muted text-muted-foreground border-border',
    needs_info: 'bg-warning/15 text-warning border-warning/25',
    reproducing: 'bg-info/15 text-info border-info/25',
    pending: 'bg-secondary text-muted-foreground border-border',
}

const verificationIcons: Record<string, React.ReactNode> = {
    confirmed: <CheckCircle2 className="h-3.5 w-3.5" />,
    dismissed: <X className="h-3.5 w-3.5" />,
    needs_info: <HelpCircle className="h-3.5 w-3.5" />,
    reproducing: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    pending: <Clock className="h-3.5 w-3.5" />,
}

const verificationLabels: Record<string, string> = {
    confirmed: 'Confirmed',
    dismissed: 'Dismissed',
    needs_info: 'Needs Info',
    reproducing: 'Reproducing',
    pending: 'Pending Review',
}

export function IssueDetailView({
    issue,
    onBack,
    onStatusChange,
    onSaveNotes,
    onStartReproduction,
    onStartRemediation,
    isReproducing = false,
    isRemediating = false,
}: IssueDetailViewProps) {
    const [reviewerNotes, setReviewerNotes] = useState(issue.reviewer_notes || '')
    const [showReproductionOptions, setShowReproductionOptions] = useState(false)
    const [showRemediationOptions, setShowRemediationOptions] = useState(false)

    const statusKey =
        issue.verification_status && issue.verification_status in verificationStyles
            ? issue.verification_status
            : 'pending'

    const notesDirty = reviewerNotes !== (issue.reviewer_notes || '')

    const hasReproductionSessions = issue.reproduction_sessions && issue.reproduction_sessions.length > 0
    const hasRemediationSessions = issue.remediation_sessions && issue.remediation_sessions.length > 0
    const sessionCount =
        (issue.reproduction_sessions?.length || 0) + (issue.remediation_sessions?.length || 0)

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

    const getRemediationStatusBadge = (status?: RemediationStatus) => {
        const config: Record<string, { style: string; icon: React.ReactNode; label: string }> = {
            applied: {
                style: 'bg-success/15 text-success border-success/25',
                icon: <CheckCircle2 className="h-3 w-3" />,
                label: 'Applied',
            },
            verified: {
                style: 'bg-success text-success-foreground border-success/30',
                icon: <ShieldCheck className="h-3 w-3" />,
                label: 'Verified',
            },
            in_progress: {
                style: 'bg-info/15 text-info border-info/25',
                icon: <Loader2 className="h-3 w-3 animate-spin" />,
                label: 'In Progress',
            },
            failed: {
                style: 'bg-destructive/15 text-destructive border-destructive/25',
                icon: <XCircle className="h-3 w-3" />,
                label: 'Failed',
            },
        }
        if (!status || !config[status]) return null
        const c = config[status]
        return (
            <Badge className={cn('text-xs gap-1', c.style)}>
                {c.icon}
                {c.label}
            </Badge>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            {/* ── Header ── */}
            <div className="flex-shrink-0 border-b border-border bg-gradient-subtle">
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
                                <h2 className="font-bold text-xl text-foreground leading-tight">
                                    {issue.title}
                                </h2>
                                <Badge
                                    className={cn(
                                        'text-xs font-bold px-3 py-1',
                                        severityStyles[issue.severity],
                                    )}
                                >
                                    {issue.severity.toUpperCase()}
                                </Badge>
                            </div>

                            {/* Metadata row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                {issue.cve_id && (
                                    <a
                                        href={`https://nvd.nist.gov/vuln/detail/${issue.cve_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-primary hover:text-primary/80 hover:underline font-mono"
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

                                <Separator orientation="vertical" className="h-4 bg-border" />

                                <Badge className={cn('gap-1.5', verificationStyles[statusKey])}>
                                    {verificationIcons[statusKey]}
                                    {verificationLabels[statusKey]}
                                </Badge>

                                {issue.remediation_status &&
                                    getRemediationStatusBadge(issue.remediation_status)}

                                {issue.confirmed_by && (
                                    <span className="flex items-center gap-1 text-xs">
                                        <User className="h-3 w-3" />
                                        {issue.confirmed_by}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabbed Content ── */}
            <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-shrink-0 border-b border-border px-6">
                    <TabsList className="bg-transparent h-11 p-0 gap-1">
                        <TabsTrigger
                            value="overview"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-muted-foreground data-[state=active]:text-foreground"
                        >
                            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="reproduce"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-muted-foreground data-[state=active]:text-foreground"
                        >
                            <TestTubeDiagonal className="h-3.5 w-3.5 mr-1.5" />
                            Reproduce
                            {issue.reproduction_steps && issue.reproduction_steps.length > 0 && (
                                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                                    {issue.reproduction_steps.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="remediate"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-muted-foreground data-[state=active]:text-foreground"
                        >
                            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                            Remediate
                        </TabsTrigger>
                        {sessionCount > 0 && (
                            <TabsTrigger
                                value="sessions"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-muted-foreground data-[state=active]:text-foreground"
                            >
                                <Camera className="h-3.5 w-3.5 mr-1.5" />
                                Sessions
                                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                                    {sessionCount}
                                </Badge>
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <ScrollArea className="flex-1">
                    <div className="px-6 py-5 max-w-3xl min-h-[360px]">
                        {/* ── Overview Tab ── */}
                        <TabsContent value="overview" className="mt-0 space-y-6">
                            {/* Description */}
                            <section>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Description
                                </h3>
                                <p className="text-sm text-foreground/85 leading-relaxed">
                                    {issue.description}
                                </p>
                            </section>

                            {/* Details grid — only render if there's data */}
                            {(issue.affected_component || issue.impact || issue.confirmed_at) && (
                                <Card className="shadow-card">
                                    <div className="divide-y divide-border">
                                        {issue.affected_component && (
                                            <div className="flex items-center justify-between px-5 py-3">
                                                <span className="text-sm text-muted-foreground">
                                                    Affected Component
                                                </span>
                                                <code className="text-sm text-primary font-mono bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                                                    {issue.affected_component}
                                                </code>
                                            </div>
                                        )}
                                        {issue.impact && (
                                            <div className="flex items-start justify-between gap-4 px-5 py-3">
                                                <span className="text-sm text-muted-foreground flex-shrink-0">
                                                    Impact
                                                </span>
                                                <p className="text-sm text-foreground/80 text-right">
                                                    {issue.impact}
                                                </p>
                                            </div>
                                        )}
                                        {issue.confirmed_at && (
                                            <div className="flex items-center justify-between px-5 py-3">
                                                <span className="text-sm text-muted-foreground">
                                                    Confirmed
                                                </span>
                                                <span className="text-sm text-foreground">
                                                    {formatDate(issue.confirmed_at)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </TabsContent>

                        {/* ── Reproduce Tab ── */}
                        <TabsContent value="reproduce" className="mt-0 space-y-6">
                            {/* Steps */}
                            <section>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Steps to Reproduce
                                </h3>
                                {issue.reproduction_steps && issue.reproduction_steps.length > 0 ? (
                                    <ol className="space-y-3">
                                        {issue.reproduction_steps.map((step, idx) => (
                                            <li
                                                key={`repro-step-${step.slice(0, 20)}-${idx}`}
                                                className="flex gap-3 text-sm"
                                            >
                                                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-secondary text-secondary-foreground font-bold text-xs flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                                <span className="flex-1 text-foreground/80 leading-relaxed pt-0.5">
                                                    {step}
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No specific reproduction steps documented. Use the button below
                                        to attempt automatic reproduction.
                                    </p>
                                )}
                            </section>

                            {/* Reproduce action */}
                            <Card className="shadow-card overflow-hidden">
                                <div className="px-5 py-4 space-y-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-foreground">
                                            Recreate Issue
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Automatically attempt to reproduce this issue and record the
                                            session for verification.
                                        </p>
                                    </div>

                                    {showReproductionOptions ? (
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    onStartReproduction?.(issue.id, 'scriptreplay')
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
                                            className="gap-1.5 bg-accent-foreground text-accent hover:bg-accent-foreground/90"
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
                            </Card>

                            {/* Inline reproduction sessions for context */}
                            {hasReproductionSessions && (
                                <section>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        Past Reproduction Sessions
                                    </h3>
                                    <div className="space-y-2">
                                        {issue.reproduction_sessions!.map(session => (
                                            <SessionRow
                                                key={session.id}
                                                session={session}
                                                formatDate={formatDate}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </TabsContent>

                        {/* ── Remediate Tab ── */}
                        <TabsContent value="remediate" className="mt-0 space-y-6">
                            {/* Remediation info */}
                            <section>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Remediation
                                </h3>
                                {issue.remediation ? (
                                    <p className="text-sm text-foreground/85 leading-relaxed">
                                        {issue.remediation}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No remediation guidance documented yet.
                                    </p>
                                )}
                            </section>

                            {issue.remediation_steps && issue.remediation_steps.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        Remediation Steps
                                    </h3>
                                    <ol className="space-y-2">
                                        {issue.remediation_steps.map((step, idx) => (
                                            <li
                                                key={`rem-step-${step.slice(0, 20)}-${idx}`}
                                                className="flex gap-3 text-sm"
                                            >
                                                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-secondary text-secondary-foreground font-bold text-xs flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                                <span className="flex-1 text-foreground/80 leading-relaxed">
                                                    {step}
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                </section>
                            )}

                            {/* Apply Fix action */}
                            <Card className="shadow-card overflow-hidden">
                                <div className="px-5 py-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-foreground">
                                                Apply Fix
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Automatically apply the remediation to patch this
                                                vulnerability on the target.
                                            </p>
                                        </div>
                                        {getRemediationStatusBadge(issue.remediation_status)}
                                    </div>

                                    {showRemediationOptions ? (
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    onStartRemediation?.(issue.id, 'automated')
                                                }
                                                disabled={isRemediating}
                                                className="gap-1.5 flex-1 bg-accent-foreground text-accent hover:bg-accent-foreground/90"
                                            >
                                                <Wrench className="h-3.5 w-3.5" />
                                                Auto-patch
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onStartRemediation?.(issue.id, 'manual')}
                                                disabled={isRemediating}
                                                className="gap-1.5 flex-1"
                                            >
                                                <Terminal className="h-3.5 w-3.5" />
                                                Guided Manual
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setShowRemediationOptions(false)}
                                                className="w-full"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => setShowRemediationOptions(true)}
                                            disabled={
                                                isRemediating || issue.remediation_status === 'verified'
                                            }
                                            className="gap-1.5 bg-accent-foreground text-accent hover:bg-accent-foreground/90"
                                        >
                                            {isRemediating ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Applying Fix...
                                                </>
                                            ) : issue.remediation_status === 'applied' ? (
                                                <>
                                                    <ShieldCheck className="h-3.5 w-3.5" />
                                                    Re-apply Fix
                                                </>
                                            ) : issue.remediation_status === 'verified' ? (
                                                <>
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Fix Verified
                                                </>
                                            ) : (
                                                <>
                                                    <Wrench className="h-3.5 w-3.5" />
                                                    Apply Fix
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </Card>

                            {/* Inline remediation sessions */}
                            {hasRemediationSessions && (
                                <section>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        Past Remediation Sessions
                                    </h3>
                                    <div className="space-y-2">
                                        {issue.remediation_sessions!.map(session => (
                                            <SessionRow
                                                key={session.id}
                                                session={session}
                                                formatDate={formatDate}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </TabsContent>

                        {/* ── Sessions Tab ── */}
                        {sessionCount > 0 && (
                            <TabsContent value="sessions" className="mt-0 space-y-6">
                                {hasReproductionSessions && (
                                    <section>
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                            Reproduction Sessions
                                        </h3>
                                        <div className="space-y-2">
                                            {issue.reproduction_sessions!.map(session => (
                                                <SessionRow
                                                    key={session.id}
                                                    session={session}
                                                    formatDate={formatDate}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}
                                {hasRemediationSessions && (
                                    <section>
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                            Remediation Sessions
                                        </h3>
                                        <div className="space-y-2">
                                            {issue.remediation_sessions!.map(session => (
                                                <SessionRow
                                                    key={session.id}
                                                    session={session}
                                                    formatDate={formatDate}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </TabsContent>
                        )}
                    </div>
                </ScrollArea>
            </Tabs>

            {/* ── Reviewer Notes — persistent across all tabs ── */}
            <div className="flex-shrink-0 border-t border-border bg-muted/30 px-6 py-3">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquareText className="h-3.5 w-3.5 text-muted-foreground" />
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Reviewer Notes
                        </h3>
                    </div>
                    <div className="relative">
                        <Textarea
                            placeholder="Add notes about this issue..."
                            value={reviewerNotes}
                            onChange={e => setReviewerNotes(e.target.value)}
                            className="min-h-[72px] text-sm resize-none bg-card border-border pr-16 pb-3"
                        />
                        {notesDirty && (
                            <Button
                                size="sm"
                                onClick={() => onSaveNotes?.(issue.id, reviewerNotes)}
                                className="absolute bottom-2 right-2 h-7 px-2.5 text-xs gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                            >
                                <Save className="h-3 w-3" />
                                Save
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Sticky Action Bar ── */}
            <div className="flex-shrink-0 border-t border-border bg-card px-6 py-3">
                <div className="flex items-center gap-3 max-w-3xl">
                    {/* Status banner (if already actioned) */}
                    {issue.verification_status === 'confirmed' && (
                        <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2 mr-auto">
                            <CheckCircle2 className="h-4 w-4" />
                            Issue confirmed
                        </div>
                    )}
                    {issue.verification_status === 'dismissed' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted border border-border rounded-lg px-3 py-2 mr-auto">
                            <X className="h-4 w-4" />
                            Issue dismissed
                        </div>
                    )}
                    {issue.verification_status === 'needs_info' && (
                        <div className="flex items-center gap-2 text-sm text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 mr-auto">
                            <HelpCircle className="h-4 w-4" />
                            Needs more information
                        </div>
                    )}

                    {/* Spacer when no banner */}
                    {(!issue.verification_status ||
                        issue.verification_status === 'pending' ||
                        issue.verification_status === 'reproducing') && <div className="mr-auto" />}

                    {/* Action buttons — always visible */}
                    <TooltipProvider delayDuration={200}>
                        {issue.verification_status !== 'dismissed' && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            onStatusChange?.(issue.id, 'dismissed', reviewerNotes)
                                        }
                                        className="gap-1.5"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Dismiss
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Dismiss this issue as not applicable</TooltipContent>
                            </Tooltip>
                        )}
                        {issue.verification_status !== 'needs_info' && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            onStatusChange?.(issue.id, 'needs_info', reviewerNotes)
                                        }
                                        className="gap-1.5 text-warning border-warning/30 hover:bg-warning/10 hover:text-warning"
                                    >
                                        <HelpCircle className="h-3.5 w-3.5" />
                                        Needs Info
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mark as needing more information</TooltipContent>
                            </Tooltip>
                        )}
                        {issue.verification_status !== 'confirmed' && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            onStatusChange?.(issue.id, 'confirmed', reviewerNotes)
                                        }
                                        className="gap-1.5 bg-accent-foreground text-accent hover:bg-accent-foreground/90"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Confirm
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Confirm this vulnerability finding</TooltipContent>
                            </Tooltip>
                        )}
                    </TooltipProvider>
                </div>
            </div>
        </div>
    )
}

/* ── Session Row (shared between tabs) ── */
interface SessionRowProps {
    session: {
        id: string
        timestamp: string
        status: 'running' | 'completed' | 'failed'
        type: string
        artifacts?: {
            screenshots?: string[]
            recording?: string
            logs?: string
        }
        notes?: string
        changes_made?: string[]
    }
    formatDate: (d?: string) => string | null
}

function SessionRow({ session, formatDate }: SessionRowProps) {
    return (
        <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={cn(
                            'text-xs',
                            session.status === 'completed' &&
                                'bg-success/15 text-success border-success/25',
                            session.status === 'failed' &&
                                'bg-destructive/15 text-destructive border-destructive/25',
                            session.status === 'running' && 'bg-info/15 text-info border-info/25',
                        )}
                    >
                        {session.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        {session.type}
                    </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(session.timestamp)}</span>
            </div>
            {session.notes && <p className="text-sm text-foreground/70">{session.notes}</p>}
            {session.artifacts?.screenshots && session.artifacts.screenshots.length > 0 && (
                <div className="flex gap-2 mt-1">
                    {session.artifacts.screenshots.map((url, idx) => (
                        <a
                            key={`${session.id}-screenshot-${url}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            <Camera className="h-3 w-3" />
                            Screenshot {idx + 1}
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}
