import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    AlertTriangle,
    ArrowLeft,
    Bot,
    CheckCircle2,
    ChevronDown,
    CircleDashed,
    ExternalLink,
    FileCheck2,
    FileStack,
    Loader2,
    Search,
    ShieldCheck,
    UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AssessmentRunLog } from '@/components/AssessmentRunLog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { type AssessmentAnswer, type AssessmentArtifact, api, type ChecklistItem } from '@/lib/api'
import { cn } from '@/lib/utils'

const complianceLabels: Record<string, string> = {
    compliant: 'Compliant',
    partial: 'Partially compliant',
    non_compliant: 'Non-compliant',
    not_applicable: 'Not applicable',
    unknown: 'Unknown',
}

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
    const [compliance, setCompliance] = useState(answer?.compliance || 'unknown')
    const [reviewer, setReviewer] = useState(answer?.reviewer || '')
    const mutation = useMutation({
        mutationFn: () =>
            api.riskAssessments.reviewAnswer(assessmentId, item.id, {
                answer: text,
                compliance,
                operator_comment: comment,
                reviewer,
                approve: true,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['risk-assessment', assessmentId] })
            toast.success(`${item.id} confirmed`)
        },
        onError: error => toast.error(error instanceof Error ? error.message : 'Review failed'),
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
                        <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
                        <span className="font-medium">{item.title}</span>
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
                <div className="grid gap-4 border-t bg-background px-4 py-4 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">Requirement</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.requirement}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`${item.id}-answer`}>Assessment response</Label>
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
                        <div className="space-y-2">
                            <Label htmlFor={`${item.id}-comment`}>Review comment</Label>
                            <Textarea
                                id={`${item.id}-comment`}
                                value={comment}
                                onChange={event => setComment(event.target.value)}
                                rows={2}
                                placeholder="Add review context"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Conclusion</Label>
                            <Select value={compliance} onValueChange={setCompliance}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(complianceLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                                        <a
                                                            href={api.riskAssessments.artifactUrl(
                                                                assessmentId,
                                                                artifact.id,
                                                            )}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-1 inline-flex items-center gap-1 break-all font-mono text-xs text-primary hover:underline"
                                                        >
                                                            {evidence.reference}
                                                            <ExternalLink className="h-3 w-3 shrink-0" />
                                                        </a>
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
                        <div className="space-y-2">
                            <Label htmlFor={`${item.id}-reviewer`}>Reviewer</Label>
                            <Input
                                id={`${item.id}-reviewer`}
                                value={reviewer}
                                onChange={event => setReviewer(event.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full"
                            disabled={!reviewer.trim() || mutation.isPending}
                            onClick={() => mutation.mutate()}
                        >
                            {mutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <ShieldCheck className="mr-2 h-4 w-4" />
                            )}
                            Confirm answer
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function RiskAssessmentDetail() {
    const { id } = useParams()
    const queryClient = useQueryClient()
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

    useEffect(() => {
        if (assessment?.status === 'needs_review' && populated === 0 && !recoveryAttempted.current) {
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
                    <Link
                        to={
                            deviceQuery.data
                                ? `/networks/${deviceQuery.data.network_id}/devices/${deviceQuery.data.id}`
                                : '/networks'
                        }
                    >
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
                            {assessment.id} · Template {assessment.template_version}
                        </p>
                    </div>
                    <Badge variant="outline">{assessment.access_mode}</Badge>
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
                        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Sources
                        </p>
                        <Button
                            variant={sourceFilter === 'all' ? 'secondary' : 'ghost'}
                            className="w-full justify-between"
                            onClick={() => setSourceFilter('all')}
                        >
                            All documents <Badge variant="outline">{total}</Badge>
                        </Button>
                        {sources.map(source => (
                            <Button
                                key={source}
                                variant={sourceFilter === source ? 'secondary' : 'ghost'}
                                className="h-auto w-full justify-between gap-2 py-2 text-left"
                                onClick={() => setSourceFilter(source)}
                            >
                                <span className="min-w-0 truncate">{source}</span>
                                <Badge variant="outline">
                                    {
                                        assessment.checklist_data.filter(item => item.source === source)
                                            .length
                                    }
                                </Badge>
                            </Button>
                        ))}
                    </aside>
                )}
                <div className="space-y-5">
                    <AssessmentRunLog
                        assessmentId={assessment.id}
                        status={assessment.status}
                        artifacts={assessment.artifacts_data || []}
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
                <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileCheck2 className="h-5 w-5 text-primary" />
                                Review progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="mb-2 flex justify-between text-sm">
                                    <span>Confirmed</span>
                                    <span>
                                        {approved} / {total}
                                    </span>
                                </div>
                                <Progress value={total ? (approved / total) * 100 : 0} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="approver">Final approver</Label>
                                <Input
                                    id="approver"
                                    value={approver}
                                    onChange={event => setApprover(event.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                disabled={
                                    !approver.trim() ||
                                    approved !== total ||
                                    approveMutation.isPending ||
                                    assessment.status === 'approved'
                                }
                                onClick={() => approveMutation.mutate()}
                            >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Approve assessment
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                All items must be confirmed before final approval. EAM synchronization
                                will be added at this approval boundary.
                            </p>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </main>
    )
}
