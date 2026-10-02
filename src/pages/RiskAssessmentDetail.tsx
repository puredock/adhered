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
    FolderOpen,
    Loader2,
    MessageSquare,
    MessageSquareText,
    MoreHorizontal,
    Paperclip,
    PenLine,
    Radar,
    RefreshCw,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
    type AssessmentAnswer,
    type AssessmentArtifact,
    api,
    type ChecklistItem,
    type RiskAssessment,
} from '@/lib/api'
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

const sourceChannels = [
    { key: 'disclosure', label: 'Manufacturer disclosure', icon: FileText },
    { key: 'live', label: 'Live probe', icon: Radar },
] as const

const sourceModeLabels: Record<RiskAssessment['source_mode'], string> = {
    disclosure_only: 'MDS2 only',
    live: 'Live probe',
    disclosure_and_live: 'MDS2 + live probe',
    manual: 'Manual',
}

/** Shows which answer sources fed this assessment; used sources light up and ping while a run is active. */
function SourceIndicator({ mode, running }: { mode: RiskAssessment['source_mode']; running: boolean }) {
    const used = {
        disclosure: mode === 'disclosure_only' || mode === 'disclosure_and_live',
        live: mode === 'live' || mode === 'disclosure_and_live',
    }
    return (
        <div className="flex items-center gap-2.5 rounded-full border bg-background py-1 pl-1 pr-3">
            <div className="flex items-center">
                {mode === 'manual' ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground">
                        <PenLine className="h-3.5 w-3.5" />
                    </span>
                ) : (
                    sourceChannels.map(({ key, label, icon: Icon }, index) => (
                        <Tooltip key={key}>
                            <TooltipTrigger asChild>
                                <span
                                    className={cn(
                                        'relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-background',
                                        index > 0 && '-ml-1.5',
                                        used[key]
                                            ? 'bg-primary/15 text-primary'
                                            : 'bg-muted text-muted-foreground/40',
                                    )}
                                >
                                    {used[key] && running && (
                                        <span className="absolute inset-0 rounded-full bg-primary/30 motion-safe:animate-ping" />
                                    )}
                                    <Icon className="relative h-3.5 w-3.5" />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {label}
                                {used[key] ? '' : ' not used'}
                            </TooltipContent>
                        </Tooltip>
                    ))
                )}
            </div>
            <span className="text-sm font-medium">{sourceModeLabels[mode]}</span>
        </div>
    )
}

function SourceRow({
    label,
    title,
    count,
    icon: Icon,
    iconClassName,
    active,
    heading,
    onSelect,
}: {
    label: string
    title?: string
    count: number
    icon?: typeof FileText
    iconClassName?: string
    active: boolean
    heading?: boolean
    onSelect?: () => void
}) {
    return (
        <button
            type="button"
            title={title || label}
            disabled={!onSelect}
            aria-current={active ? 'true' : undefined}
            onClick={onSelect}
            className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors disabled:cursor-default',
                heading ? 'font-medium text-foreground' : 'text-muted-foreground',
                onSelect && 'hover:bg-muted/50 hover:text-foreground',
                active && 'bg-primary/10 text-foreground hover:bg-primary/10',
            )}
        >
            {Icon && (
                <Icon
                    className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        heading ? 'text-primary' : active ? 'text-primary' : 'text-muted-foreground/70',
                        iconClassName,
                    )}
                />
            )}
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <span className="shrink-0 text-xs font-normal tabular-nums text-muted-foreground">
                {count}
            </span>
        </button>
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
    const disclosureInput = useRef<HTMLInputElement>(null)
    const [previewDisclosure, setPreviewDisclosure] = useState(false)
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
    const counts = useMemo(() => {
        const result = new Map<string, number>()
        for (const item of assessment?.checklist_data || []) {
            result.set(item.source, (result.get(item.source) || 0) + 1)
        }
        return result
    }, [assessment?.checklist_data])
    // Group documents under the template they came from; documents with no known template go under "Other".
    const sourceTree = useMemo(() => {
        const templates = (assessment?.templates_data || [])
            .map(template => ({
                ...template,
                sources: template.sources.filter(source => counts.has(source)),
            }))
            .filter(template => template.sources.length)
        const claimed = new Set(templates.flatMap(template => template.sources))
        const orphans = [...counts.keys()].filter(source => !claimed.has(source))
        return orphans.length
            ? [...templates, { id: 'other', name: 'Other', sources: orphans }]
            : templates
    }, [assessment?.templates_data, counts])
    const sections = useMemo(() => {
        const visibleSources =
            sourceFilter === 'all'
                ? null
                : new Set(
                      sourceFilter.startsWith('template:')
                          ? sourceTree.find(template => `template:${template.id}` === sourceFilter)
                                ?.sources
                          : [sourceFilter],
                  )
        const grouped = new Map<string, ChecklistItem[]>()
        for (const item of assessment?.checklist_data || []) {
            const answer = answers.get(item.id)
            if (visibleSources && !visibleSources.has(item.source)) continue
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
    }, [assessment?.checklist_data, answers, reviewFilter, search, sourceFilter, sourceTree])
    const approved = assessment?.answers_data.filter(answer => answer.status === 'approved').length || 0
    const needsReview =
        assessment?.answers_data.filter(answer => answer.status === 'needs_review').length || 0
    const populated = assessment?.answers_data.filter(answer => answer.answer?.trim()).length || 0
    const total = assessment?.checklist_data.length || 0
    const unanswered = total - populated
    const toggleReviewFilter = (value: string) =>
        setReviewFilter(current => (current === value ? 'all' : value))
    const disclosureArtifact = assessment?.artifacts_data?.find(
        artifact => artifact.id === 'mds2-disclosure',
    )
    const citedItems = assessment?.answers_data.filter(answer => answer.disclosures?.length).length || 0
    const canAttachDisclosure =
        !!assessment && !['pending', 'active', 'approved'].includes(assessment.status)
    const isRunning = assessment?.status === 'pending' || assessment?.status === 'active'
    const canStartLiveProbe = !!assessment && !isRunning && assessment.status !== 'approved'
    const hasLiveEvidence =
        assessment?.source_mode === 'live' || assessment?.source_mode === 'disclosure_and_live'
    const approveMutation = useMutation({
        mutationFn: () => api.riskAssessments.approve(id!, approver),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['risk-assessment', id] })
            toast.success('Risk assessment approved')
        },
        onError: error => toast.error(error instanceof Error ? error.message : 'Approval failed'),
    })
    const disclosureMutation = useMutation({
        mutationFn: (file: File) => api.riskAssessments.attachDisclosure(id!, file),
        onSuccess: result => {
            queryClient.invalidateQueries({ queryKey: ['risk-assessment', id] })
            queryClient.invalidateQueries({ queryKey: ['risk-assessment-events', id] })
            toast.success(`Autofilling from ${result.disclosure_name}`, {
                description: 'Existing answers are kept; only empty items are filled.',
            })
        },
        onError: error =>
            toast.error(error instanceof Error ? error.message : 'Unable to attach disclosure'),
    })
    const liveProbeMutation = useMutation({
        mutationFn: () => api.riskAssessments.startLiveProbe(id!),
        onSuccess: result => {
            // Seed the pending state immediately so the action stays disabled until polling takes over.
            queryClient.setQueryData(['risk-assessment', id], result)
            queryClient.invalidateQueries({ queryKey: ['risk-assessment-events', id] })
            queryClient.invalidateQueries({ queryKey: ['risk-assessments'] })
            toast.success('Live probe started')
        },
        onError: error =>
            toast.error(error instanceof Error ? error.message : 'Unable to start live probe'),
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
                            <span className="font-mono text-xs">{assessment.id}</span>
                            <span className="mx-2 text-border">|</span>
                            Started{' '}
                            {new Date(assessment.created_at).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </p>
                    </div>
                    <SourceIndicator
                        mode={assessment.source_mode}
                        running={assessment.status === 'pending' || assessment.status === 'active'}
                    />
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
                        <nav className="rounded-md border bg-card p-1 text-sm">
                            <SourceRow
                                label="All documents"
                                count={total}
                                active={sourceFilter === 'all'}
                                onSelect={() => setSourceFilter('all')}
                            />
                            <div aria-hidden className="mx-2 my-1 h-px bg-border" />
                            {sourceTree.map(template => (
                                <div key={template.id} className="py-0.5">
                                    <SourceRow
                                        label={template.name}
                                        count={template.sources.reduce(
                                            (sum, source) => sum + (counts.get(source) || 0),
                                            0,
                                        )}
                                        icon={FolderOpen}
                                        active={sourceFilter === `template:${template.id}`}
                                        onSelect={() =>
                                            setSourceFilter(
                                                template.sources.length === 1
                                                    ? template.sources[0]
                                                    : `template:${template.id}`,
                                            )
                                        }
                                        heading
                                    />
                                    <div className="relative ml-[1.15rem] border-l pl-1.5">
                                        {template.sources.map(source => (
                                            <SourceRow
                                                key={source}
                                                label={source.replace(/_/g, ' ')}
                                                title={source}
                                                count={counts.get(source) || 0}
                                                icon={FileText}
                                                active={sourceFilter === source}
                                                onSelect={() => setSourceFilter(source)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                        <div aria-hidden className="mx-1 !my-5 h-px bg-border" />
                        <h3 className="px-1 text-sm font-medium">Manufacturer disclosure</h3>
                        <div className="rounded-md border bg-card">
                            {disclosureArtifact ? (
                                <div className="flex items-center gap-2 py-1.5 pl-3 pr-1.5">
                                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <button
                                        type="button"
                                        title={assessment.disclosure_name || disclosureArtifact.name}
                                        onClick={() => setPreviewDisclosure(true)}
                                        className="min-w-0 flex-1 truncate py-1 text-left text-sm hover:text-primary hover:underline"
                                    >
                                        {assessment.disclosure_name || disclosureArtifact.name}
                                    </button>
                                    {canAttachDisclosure && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 shrink-0 text-muted-foreground"
                                                    aria-label="Replace disclosure"
                                                    disabled={disclosureMutation.isPending}
                                                    onClick={() => disclosureInput.current?.click()}
                                                >
                                                    {disclosureMutation.isPending ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Replace and autofill again</TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2.5 px-3 py-3">
                                    <p className="text-xs text-muted-foreground">
                                        Attach an MDS2 to cite manufacturer statements and fill empty
                                        answers.
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-full"
                                        disabled={!canAttachDisclosure || disclosureMutation.isPending}
                                        onClick={() => disclosureInput.current?.click()}
                                    >
                                        {disclosureMutation.isPending ? (
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                                        )}
                                        Attach
                                    </Button>
                                </div>
                            )}
                            {disclosureArtifact && citedItems > 0 && (
                                <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                                    Cited on {citedItems} of {total} items
                                </p>
                            )}
                        </div>
                        <h3 className="px-1 pt-3 text-sm font-medium">Live probe</h3>
                        <div className="space-y-2.5 rounded-md border bg-card px-3 py-3">
                            <p className="text-xs text-muted-foreground">
                                {isRunning
                                    ? 'A run is in progress. Follow it in the execution log.'
                                    : assessment.status === 'approved'
                                      ? 'Approved assessments cannot be probed again.'
                                      : 'Probe the device for every item. Confirmed answers are kept; others are refreshed from new findings.'}
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 w-full"
                                disabled={!canStartLiveProbe || liveProbeMutation.isPending}
                                onClick={() => liveProbeMutation.mutate()}
                            >
                                {liveProbeMutation.isPending || isRunning ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Radar className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                {hasLiveEvidence ? 'Relaunch' : 'Launch'}
                            </Button>
                        </div>
                        <input
                            ref={disclosureInput}
                            type="file"
                            hidden
                            accept=".pdf,.docx,.xlsx,.pptx,.html,.htm,.md,.txt"
                            onChange={event => {
                                const file = event.target.files?.[0]
                                if (file) disclosureMutation.mutate(file)
                                event.target.value = ''
                            }}
                        />
                        {disclosureArtifact && (
                            <ArtifactsModal
                                open={previewDisclosure}
                                onOpenChange={setPreviewDisclosure}
                                artifacts={[
                                    {
                                        id: disclosureArtifact.id,
                                        name: disclosureArtifact.name,
                                        type: disclosureArtifact.type,
                                        size:
                                            disclosureArtifact.size < 1024
                                                ? `${disclosureArtifact.size} B`
                                                : `${(disclosureArtifact.size / 1024).toFixed(1)} KB`,
                                        timestamp: disclosureArtifact.timestamp,
                                        url: api.riskAssessments.artifactUrl(
                                            assessment.id,
                                            disclosureArtifact.id,
                                        ),
                                    },
                                ]}
                                initialSelectedArtifactId={disclosureArtifact.id}
                                stepName="Manufacturer disclosure"
                            />
                        )}
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
                                        key={`${item.id}-${assessment.completed_at}`}
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
                    <div className="rounded-md border bg-card p-1 text-sm">
                        <div className="space-y-2 px-2 pb-2.5 pt-1.5">
                            <div className="flex items-baseline justify-between tabular-nums">
                                <span className="text-muted-foreground">
                                    <span className="font-medium text-foreground">{approved}</span> of{' '}
                                    {total} confirmed
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {total ? Math.floor((approved / total) * 100) : 0}%
                                </span>
                            </div>
                            {/* Confirmed and awaiting review share one track, so the gap still to cover is visible at a glance. */}
                            <div
                                role="progressbar"
                                aria-label="Confirmed items"
                                aria-valuemin={0}
                                aria-valuemax={total}
                                aria-valuenow={approved}
                                className="flex h-1.5 gap-px overflow-hidden rounded-full bg-muted"
                            >
                                <div
                                    className="bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                                    style={{ width: `${total ? (approved / total) * 100 : 0}%` }}
                                />
                                <div
                                    className="bg-warning/45 transition-[width] duration-500 motion-reduce:transition-none"
                                    style={{ width: `${total ? (needsReview / total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div aria-hidden className="mx-2 my-1 h-px bg-border" />
                        <SourceRow
                            label="Confirmed"
                            count={approved}
                            icon={CheckCircle2}
                            iconClassName="text-primary"
                            active={reviewFilter === 'approved'}
                            onSelect={() => toggleReviewFilter('approved')}
                        />
                        <SourceRow
                            label="Needs review"
                            count={needsReview}
                            icon={AlertTriangle}
                            iconClassName="text-warning"
                            active={reviewFilter === 'needs_review'}
                            onSelect={() => toggleReviewFilter('needs_review')}
                        />
                        <SourceRow
                            label="Unanswered"
                            count={unanswered}
                            icon={CircleDashed}
                            active={reviewFilter === 'unanswered'}
                            onSelect={() => toggleReviewFilter('unanswered')}
                        />
                    </div>
                    <div aria-hidden className="mx-1 !my-5 h-px bg-border" />
                    <h3 className="px-1 text-sm font-medium">Approval</h3>
                    {assessment.status === 'approved' ? (
                        <div className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 px-3 py-3">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            <div className="min-w-0 space-y-0.5">
                                <p className="truncate text-sm font-medium">
                                    Approved
                                    {assessment.approved_by ? ` by ${assessment.approved_by}` : ''}
                                </p>
                                {assessment.approved_at && (
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(assessment.approved_at).toLocaleString(undefined, {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2.5 rounded-md border bg-card px-3 py-3">
                            <p className="text-xs text-muted-foreground">
                                {isRunning
                                    ? 'Approval opens once the current run finishes.'
                                    : approved === total
                                      ? 'Every item is confirmed. Sign off as the final approver.'
                                      : `Confirm the remaining ${total - approved} item${total - approved === 1 ? '' : 's'} to approve.`}
                            </p>
                            <Input
                                id="approver"
                                aria-label="Final approver"
                                placeholder="Final approver"
                                className="h-8 text-sm"
                                value={approver}
                                onChange={event => setApprover(event.target.value)}
                            />
                            <Button
                                type="button"
                                size="sm"
                                className="h-8 w-full"
                                disabled={
                                    !approver.trim() ||
                                    approved !== total ||
                                    isRunning ||
                                    approveMutation.isPending
                                }
                                onClick={() => approveMutation.mutate()}
                            >
                                {approveMutation.isPending ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                Submit
                            </Button>
                        </div>
                    )}
                </aside>
            </div>
        </main>
    )
}
