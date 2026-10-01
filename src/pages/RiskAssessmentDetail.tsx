import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    AlertTriangle,
    Archive,
    ArrowLeft,
    Bot,
    CheckCircle2,
    ChevronDown,
    CircleDashed,
    CircleHelp,
    CircleMinus,
    CircleX,
    Contrast,
    ExternalLink,
    FileStack,
    FileText,
    Loader2,
    MessageSquare,
    MessageSquareText,
    MoreHorizontal,
    Save,
    Search,
    ShieldCheck,
    Trash2,
    UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArtifactsModal } from '@/components/ArtifactsModal'
import { AssessmentRunLog } from '@/components/AssessmentRunLog'
import type { Artifact } from '@/components/artifacts/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { type AssessmentAnswer, type AssessmentArtifact, api, type ChecklistItem } from '@/lib/api'
import { cn } from '@/lib/utils'

const complianceLabels: Record<string, string> = {
    compliant: 'Compliant',
    partial: 'Partially compliant',
    non_compliant: 'Non-compliant',
    not_applicable: 'Not applicable',
    unknown: 'Unknown',
}

const conclusionOptions = [
    {
        value: 'compliant',
        icon: CheckCircle2,
        className: 'data-[state=on]:bg-success/15 data-[state=on]:text-success',
    },
    {
        value: 'partial',
        icon: Contrast,
        className: 'data-[state=on]:bg-warning/15 data-[state=on]:text-warning',
    },
    {
        value: 'non_compliant',
        icon: CircleX,
        className: 'data-[state=on]:bg-destructive/15 data-[state=on]:text-destructive',
    },
    {
        value: 'not_applicable',
        icon: CircleMinus,
        className: 'data-[state=on]:bg-muted data-[state=on]:text-foreground',
    },
    {
        value: 'unknown',
        icon: CircleHelp,
        className: 'data-[state=on]:bg-muted data-[state=on]:text-foreground',
    },
]

const CURRENT_REVIEWER = 'Harish Navnit <hrajasek@ic.ac.uk>'

/** Evidence references are run-relative paths, optionally suffixed with a location like "(lines 1-20)". */
function findArtifact(reference: string, artifacts: AssessmentArtifact[]) {
    const path = reference
        .replace(/\s*\(.*\)\s*$/, '')
        .replace(/^\.\//, '')
        .trim()
    return artifacts.find(artifact => artifact.name === path)
}

function ReviewItem({
    item,
    answer,
    assessmentId,
    artifacts,
}: {
    item: ChecklistItem
    answer?: AssessmentAnswer
    assessmentId: string
    artifacts: AssessmentArtifact[]
}) {
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(answer?.status === 'needs_review')
    const [text, setText] = useState(answer?.answer || '')
    const [comment, setComment] = useState(answer?.operator_comment || '')
    const [savedComment, setSavedComment] = useState(answer?.operator_comment || '')
    const [compliance, setCompliance] = useState<string>(answer?.compliance || 'unknown')
    const [commentOpen, setCommentOpen] = useState(Boolean(answer?.operator_comment))
    const reviewer = CURRENT_REVIEWER
    const [artifactToPreview, setArtifactToPreview] = useState<string>()
    const modalArtifacts: Artifact[] = artifacts.map(artifact => ({
        id: artifact.id,
        name: artifact.name,
        type: artifact.type,
        size: artifact.size < 1024 ? `${artifact.size} B` : `${(artifact.size / 1024).toFixed(1)} KB`,
        timestamp: artifact.timestamp,
        url: api.riskAssessments.artifactUrl(assessmentId, artifact.id),
    }))
    const mutation = useMutation({
        mutationFn: (nextCompliance: string) =>
            api.riskAssessments.reviewAnswer(assessmentId, item.id, {
                answer: text,
                compliance: nextCompliance,
                operator_comment: comment,
                reviewer,
                approve: true,
            }),
        onSuccess: () => {
            setSavedComment(comment)
            queryClient.invalidateQueries({
                queryKey: ['risk-assessment', assessmentId],
            })
            toast.success(`${item.id} confirmed`)
        },
        onError: error => toast.error(error instanceof Error ? error.message : 'Review failed'),
    })
    const commentMutation = useMutation({
        mutationFn: (value: string) =>
            api.riskAssessments.reviewAnswer(assessmentId, item.id, {
                operator_comment: value,
                reviewer,
            }),
        onSuccess: (_result, savedValue) => {
            setSavedComment(savedValue)
            queryClient.invalidateQueries({
                queryKey: ['risk-assessment', assessmentId],
            })
            toast.success('Review comment saved')
        },
        onError: error => toast.error(error instanceof Error ? error.message : 'Comment save failed'),
    })

    return (
        <div className="border-b border-border last:border-b-0">
            <button
                type="button"
                onClick={() => setOpen(value => !value)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
            >
                {answer?.status === 'approved' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                ) : answer?.status === 'needs_review' ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                ) : (
                    <CircleDashed className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium" title={item.id}>
                            {item.title}
                        </span>
                        <Badge variant="outline" className="capitalize">
                            {item.automation === 'human' ? (
                                <UserRound className="mr-1 h-3 w-3" />
                            ) : (
                                <Bot className="mr-1 h-3 w-3" />
                            )}
                            {item.automation}
                        </Badge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{item.requirement}</p>
                </div>
                {answer?.compliance && (
                    <span className="hidden text-sm text-muted-foreground sm:block">
                        {complianceLabels[answer.compliance]}
                    </span>
                )}
                <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
            </button>
            {open && (
                <div className="border-t bg-background px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-mono text-xs text-muted-foreground">{item.id}</p>
                        <div className="flex h-8 items-center gap-0.5 rounded-md border bg-card p-0.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Toggle
                                        size="sm"
                                        pressed={commentOpen}
                                        onPressedChange={setCommentOpen}
                                        aria-label="Review comment"
                                        className="relative h-7 w-7 px-0 text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
                                    >
                                        {savedComment ? (
                                            <MessageSquareText className="h-4 w-4" />
                                        ) : (
                                            <MessageSquare className="h-4 w-4" />
                                        )}
                                        {comment !== savedComment && (
                                            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
                                        )}
                                    </Toggle>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {savedComment ? 'Edit comment' : 'Add comment'}
                                </TooltipContent>
                            </Tooltip>
                            <span aria-hidden className="mx-0.5 h-4 w-px bg-border" />
                            <ToggleGroup
                                type="single"
                                value={compliance}
                                onValueChange={value => {
                                    if (!value || value === compliance) return
                                    setCompliance(value)
                                    mutation.mutate(value)
                                }}
                                disabled={mutation.isPending}
                                aria-label="Conclusion"
                                className="gap-0.5"
                            >
                                {conclusionOptions.map(({ value, icon: Icon, className }) => {
                                    const selected = compliance === value
                                    const option = (
                                        <ToggleGroupItem
                                            value={value}
                                            aria-label={complianceLabels[value]}
                                            className={cn(
                                                'h-7 gap-1.5 text-muted-foreground',
                                                selected ? 'px-2' : 'w-7 px-0',
                                                className,
                                            )}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            {selected && (
                                                <span className="text-xs font-medium">
                                                    {complianceLabels[value]}
                                                </span>
                                            )}
                                        </ToggleGroupItem>
                                    )
                                    return selected ? (
                                        <span key={value} className="contents">
                                            {option}
                                        </span>
                                    ) : (
                                        <Tooltip key={value}>
                                            <TooltipTrigger asChild>{option}</TooltipTrigger>
                                            <TooltipContent>{complianceLabels[value]}</TooltipContent>
                                        </Tooltip>
                                    )
                                })}
                            </ToggleGroup>
                        </div>
                    </div>
                    {commentOpen && (
                        <div className="relative mt-3">
                            <Textarea
                                id={`${item.id}-comment`}
                                aria-label="Review comment"
                                value={comment}
                                onChange={event => setComment(event.target.value)}
                                rows={2}
                                autoFocus={!savedComment}
                                className={comment !== savedComment ? 'pr-12' : undefined}
                                placeholder="Add review context"
                            />
                            {comment !== savedComment && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute bottom-2 right-2 h-8 w-8"
                                    aria-label="Save review comment"
                                    title="Save review comment"
                                    disabled={commentMutation.isPending}
                                    onClick={() => commentMutation.mutate(comment)}
                                >
                                    {commentMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                    <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium">Requirement</p>
                                <p className="mt-1 text-sm text-muted-foreground">{item.requirement}</p>
                            </div>
                            {answer?.disclosures?.length ? (
                                <div>
                                    <p className="text-sm font-medium">Disclosures</p>
                                    <div className="mt-2 space-y-3">
                                        {answer.disclosures.map((disclosure, index) => {
                                            const artifact = disclosure.reference
                                                ? findArtifact(disclosure.reference, artifacts)
                                                : undefined
                                            return (
                                                <figure
                                                    key={`${disclosure.source}-${index}`}
                                                    className="space-y-2"
                                                >
                                                    {disclosure.excerpts.map(excerpt => (
                                                        <blockquote
                                                            key={excerpt}
                                                            className="border-l-2 border-muted-foreground/30 pl-3 text-sm"
                                                        >
                                                            {excerpt}
                                                        </blockquote>
                                                    ))}
                                                    <figcaption className="flex items-center gap-1.5 pl-3 text-xs text-muted-foreground">
                                                        <FileText className="h-3 w-3 shrink-0" />
                                                        {artifact ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setArtifactToPreview(artifact.id)
                                                                }
                                                                className="inline-flex min-w-0 items-center gap-1 text-left hover:text-primary hover:underline"
                                                            >
                                                                <span className="truncate">
                                                                    {disclosure.source}
                                                                </span>
                                                                <ExternalLink className="h-3 w-3 shrink-0" />
                                                            </button>
                                                        ) : (
                                                            <span className="truncate">
                                                                {disclosure.source}
                                                            </span>
                                                        )}
                                                    </figcaption>
                                                </figure>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : null}
                            <div className="space-y-2">
                                <Label htmlFor={`${item.id}-answer`}>Response</Label>
                                {item.response_type === 'boolean' ||
                                item.response_type === 'single_choice' ? (
                                    <Select value={text} onValueChange={setText}>
                                        <SelectTrigger id={`${item.id}-answer`}>
                                            <SelectValue placeholder="Select a response" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(item.response_type === 'boolean'
                                                ? ['Yes', 'No', 'Not applicable']
                                                : item.response_options
                                            ).map(option => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : item.response_type === 'number' || item.response_type === 'date' ? (
                                    <Input
                                        id={`${item.id}-answer`}
                                        type={item.response_type}
                                        value={text}
                                        onChange={event => setText(event.target.value)}
                                    />
                                ) : (
                                    <Textarea
                                        id={`${item.id}-answer`}
                                        value={text}
                                        onChange={event => setText(event.target.value)}
                                        rows={item.response_type === 'table' ? 6 : 4}
                                        placeholder={
                                            item.response_type === 'attachment'
                                                ? 'Describe or reference the supplied attachment'
                                                : 'Enter the operator or vendor response'
                                        }
                                    />
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Evidence</p>
                            {answer?.evidence.length ? (
                                <div className="mt-2 space-y-2">
                                    {answer.evidence.map((evidence, index) => {
                                        const artifact = evidence.reference
                                            ? findArtifact(evidence.reference, artifacts)
                                            : undefined
                                        return (
                                            <div
                                                key={`${evidence.source}-${index}`}
                                                className="border-l-2 border-primary pl-3 text-sm"
                                            >
                                                <p>{evidence.summary}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {evidence.source}
                                                </p>
                                                {evidence.reference &&
                                                    (artifact ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setArtifactToPreview(artifact.id)
                                                            }
                                                            className="mt-1 inline-flex items-center gap-1 break-all text-left font-mono text-xs text-primary hover:underline"
                                                        >
                                                            {evidence.reference}
                                                            <ExternalLink className="h-3 w-3 shrink-0" />
                                                        </button>
                                                    ) : (
                                                        <p
                                                            className="mt-1 break-all font-mono text-xs text-muted-foreground"
                                                            title="Referenced file not found in this assessment's artifacts"
                                                        >
                                                            {evidence.reference}
                                                        </p>
                                                    ))}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    No automated evidence collected.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <ArtifactsModal
                key={artifactToPreview || 'closed'}
                open={Boolean(artifactToPreview)}
                onOpenChange={open => {
                    if (!open) setArtifactToPreview(undefined)
                }}
                artifacts={modalArtifacts}
                initialSelectedArtifactId={artifactToPreview}
                stepName="Assessment artifacts"
            />
        </div>
    )
}

export default function RiskAssessmentDetail() {
    const { id } = useParams()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [approver, setApprover] = useState('')
    const [sourceFilter, setSourceFilter] = useState('all')
    const [reviewFilter, setReviewFilter] = useState('all')
    const [search, setSearch] = useState('')
    const recoveryAttempted = useRef(false)
    const assessmentQuery = useQuery({
        queryKey: ['risk-assessment', id],
        queryFn: () => api.riskAssessments.get(id!),
        enabled: !!id,
        refetchInterval: query =>
            query.state.data?.status === 'pending' || query.state.data?.status === 'active'
                ? 2500
                : false,
    })
    const assessment = assessmentQuery.data
    const deviceQuery = useQuery({
        queryKey: ['device', assessment?.device_id],
        queryFn: () => api.devices.get(assessment!.device_id),
        enabled: !!assessment?.device_id,
    })
    const deviceDetailsPath = deviceQuery.data
        ? `/networks/${deviceQuery.data.network_id}/devices/${deviceQuery.data.id}`
        : '/networks'
    const answers = useMemo(
        () => new Map(assessment?.answers_data.map(answer => [answer.question_id, answer]) || []),
        [assessment],
    )
    const sections = useMemo(() => {
        const grouped = new Map<string, ChecklistItem[]>()
        for (const item of assessment?.checklist_data || []) {
            const answer = answers.get(item.id)
            if (sourceFilter !== 'all' && item.source !== sourceFilter) continue
            if (reviewFilter === 'unanswered' && answer?.answer?.trim()) continue
            if (reviewFilter === 'needs_review' && answer?.status !== 'needs_review') continue
            if (reviewFilter === 'approved' && answer?.status !== 'approved') continue
            const needle = search.trim().toLocaleLowerCase()
            if (
                needle &&
                !`${item.id} ${item.title} ${item.requirement}`.toLocaleLowerCase().includes(needle)
            )
                continue
            const key = `${item.source} · ${item.section}`
            grouped.set(key, [...(grouped.get(key) || []), item])
        }
        return grouped
    }, [assessment?.checklist_data, answers, reviewFilter, search, sourceFilter])
    const sources = useMemo(
        () => [...new Set((assessment?.checklist_data || []).map(item => item.source))],
        [assessment?.checklist_data],
    )
    const approved = assessment?.answers_data.filter(answer => answer.status === 'approved').length || 0
    const needsReview =
        assessment?.answers_data.filter(answer => answer.status === 'needs_review').length || 0
    const populated = assessment?.answers_data.filter(answer => answer.answer?.trim()).length || 0
    const total = assessment?.checklist_data.length || 0
    const approveMutation = useMutation({
        mutationFn: () => api.riskAssessments.approve(id!, approver),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['risk-assessment', id] })
            toast.success('Risk assessment approved')
        },
        onError: error => toast.error(error instanceof Error ? error.message : 'Approval failed'),
    })
    const recoveryMutation = useMutation({
        mutationFn: () => api.riskAssessments.reprocess(id!),
        onSuccess: result => {
            queryClient.invalidateQueries({ queryKey: ['risk-assessment', id] })
            toast.success(`Imported ${result.imported} generated findings`)
        },
        onError: error =>
            toast.error(error instanceof Error ? error.message : 'Unable to import generated findings'),
    })
    const deleteMutation = useMutation({
        mutationFn: () => api.riskAssessments.delete(id!),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['risk-assessments'] })
            toast.success('Assessment deleted', {
                description: 'The assessment has been removed from the history.',
            })
            navigate(deviceDetailsPath)
        },
        onError: error =>
            toast.error(error instanceof Error ? error.message : 'Failed to delete assessment'),
    })

    useEffect(() => {
        if (
            assessment?.status === 'needs_review' &&
            ['live', 'disclosure_and_live'].includes(assessment.source_mode) &&
            populated === 0 &&
            !recoveryAttempted.current
        ) {
            recoveryAttempted.current = true
            recoveryMutation.mutate()
        }
    }, [assessment?.status, populated, recoveryMutation])

    if (assessmentQuery.isLoading)
        return (
            <div className="flex min-h-screen flex-1 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        )
    if (!assessment)
        return (
            <div className="flex min-h-screen flex-1 items-center justify-center">
                Risk assessment not found.
            </div>
        )

    return (
        <main className="min-h-screen flex-1 bg-background">
            <header className="sticky top-0 z-30 border-b bg-card">
                <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-6 py-4">
                    <Link to={deviceDetailsPath}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-semibold">Risk Assessment</h1>
                            <Badge
                                variant={assessment.status === 'approved' ? 'default' : 'outline'}
                                className="capitalize"
                            >
                                {assessment.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {assessment.id} · Template {assessment.template_version} ·{' '}
                            {assessment.source_mode === 'manual'
                                ? 'Manual'
                                : assessment.source_mode === 'disclosure_only'
                                  ? `MDS2 only${assessment.disclosure_name ? ` · ${assessment.disclosure_name}` : ''}`
                                  : assessment.source_mode === 'disclosure_and_live'
                                    ? `MDS2 + live${assessment.disclosure_name ? ` · ${assessment.disclosure_name}` : ''}`
                                    : 'Live assessment'}
                        </p>
                    </div>
                    <Badge variant="outline">{assessment.access_mode}</Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" aria-label="Assessment actions">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                disabled={
                                    deleteMutation.isPending ||
                                    assessment.status === 'pending' ||
                                    assessment.status === 'active'
                                }
                                onSelect={event => {
                                    event.preventDefault()
                                    if (
                                        window.confirm(
                                            'Delete this risk assessment? This will permanently remove it from the history.',
                                        )
                                    ) {
                                        deleteMutation.mutate()
                                    }
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <div
                className={cn(
                    'mx-auto grid max-w-[1500px] gap-5 px-6 py-6',
                    total > 0
                        ? 'xl:grid-cols-[210px_minmax(0,1fr)_280px]'
                        : 'lg:grid-cols-[minmax(0,1fr)_280px]',
                )}
            >
                {total > 0 && (
                    <aside className="hidden space-y-2 xl:sticky xl:top-24 xl:block xl:self-start">
                        <h3 className="px-1 text-sm font-medium">Sources</h3>
                        <nav className="divide-y rounded-md border bg-card">
                            {[
                                { value: 'all', label: 'All documents', count: total },
                                ...sources.map(source => ({
                                    value: source,
                                    label: source,
                                    count: assessment.checklist_data.filter(
                                        item => item.source === source,
                                    ).length,
                                })),
                            ].map(({ value, label, count }) => (
                                <button
                                    key={value}
                                    type="button"
                                    title={label}
                                    aria-current={sourceFilter === value ? 'true' : undefined}
                                    onClick={() => setSourceFilter(value)}
                                    className={cn(
                                        'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors first:rounded-t-md last:rounded-b-md hover:bg-muted/40 hover:text-foreground',
                                        sourceFilter === value &&
                                            'bg-primary/5 font-medium text-foreground hover:bg-primary/10',
                                    )}
                                >
                                    <span className="min-w-0 flex-1 truncate">{label}</span>
                                    <span className="shrink-0 text-xs font-normal tabular-nums text-muted-foreground">
                                        {count}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </aside>
                )}
                <div className="space-y-5">
                    <AssessmentRunLog
                        assessmentId={assessment.id}
                        status={assessment.status}
                        artifacts={assessment.artifacts_data || []}
                        sourceMode={assessment.source_mode}
                    />
                    {recoveryMutation.isPending && (
                        <div className="flex items-center gap-2 border border-border bg-card p-3 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            Importing Claude's generated findings and artifacts...
                        </div>
                    )}
                    {assessment.error && (
                        <div className="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                            {assessment.error}
                        </div>
                    )}
                    {total > 0 && (
                        <div className="flex flex-col gap-2 border border-border bg-card p-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Search checklist"
                                    value={search}
                                    onChange={event => setSearch(event.target.value)}
                                />
                            </div>
                            <Select value={reviewFilter} onValueChange={setReviewFilter}>
                                <SelectTrigger className="w-full sm:w-44">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All items</SelectItem>
                                    <SelectItem value="unanswered">Unanswered</SelectItem>
                                    <SelectItem value="needs_review">Needs review</SelectItem>
                                    <SelectItem value="approved">Confirmed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {total === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                                <FileStack className="h-9 w-9 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">No template snapshot is attached</p>
                                    <p className="max-w-lg text-sm text-muted-foreground">
                                        This assessment predates document templates and cannot be
                                        reconstructed safely. Create a template and start a new
                                        assessment.
                                    </p>
                                </div>
                                <Button asChild>
                                    <Link to="/risk-templates">Open template library</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                    {[...sections.entries()].map(([section, items]) => (
                        <Card key={section} className="overflow-hidden">
                            <CardHeader className="border-b py-4">
                                <CardTitle className="text-base">{section}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {items.map(item => (
                                    <ReviewItem
                                        key={item.id}
                                        item={item}
                                        answer={answers.get(item.id)}
                                        assessmentId={assessment.id}
                                        artifacts={assessment.artifacts_data || []}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <aside className="space-y-2 xl:sticky xl:top-24 xl:self-start">
                    <h3 className="px-1 text-sm font-medium">Review progress</h3>
                    <div className="divide-y rounded-md border bg-card">
                        <div className="space-y-2.5 px-3 py-3">
                            <div className="flex items-baseline justify-between text-sm">
                                <span className="text-muted-foreground">Confirmed</span>
                                <span className="tabular-nums">
                                    <span className="font-medium">{approved}</span>
                                    <span className="text-muted-foreground"> of {total}</span>
                                </span>
                            </div>
                            <Progress value={total ? (approved / total) * 100 : 0} className="h-1.5" />
                            {needsReview > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setReviewFilter('needs_review')}
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                                    {needsReview} need{needsReview === 1 ? 's' : ''} review
                                </button>
                            )}
                        </div>
                        {assessment.status === 'approved' ? (
                            <div className="flex items-center gap-2 px-3 py-3 text-sm">
                                <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                                <span className="min-w-0 truncate">
                                    Approved
                                    {assessment.approved_by ? ` by ${assessment.approved_by}` : ''}
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-2 px-3 py-3">
                                <Input
                                    id="approver"
                                    aria-label="Final approver"
                                    placeholder="Final approver"
                                    value={approver}
                                    onChange={event => setApprover(event.target.value)}
                                />
                                <Button
                                    className="w-full"
                                    disabled={
                                        !approver.trim() ||
                                        approved !== total ||
                                        approveMutation.isPending
                                    }
                                    onClick={() => approveMutation.mutate()}
                                >
                                    {approveMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                    )}
                                    Approve assessment
                                </Button>
                                {approved !== total && (
                                    <p className="text-xs text-muted-foreground">
                                        Confirm every item to approve.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    )
}
