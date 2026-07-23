import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    AlertTriangle,
    ArrowLeft,
    Bot,
    CheckCircle2,
    ChevronDown,
    CircleDashed,
    FileCheck2,
    Loader2,
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
import { type AssessmentAnswer, api, type ChecklistItem } from '@/lib/api'
import { cn } from '@/lib/utils'

const complianceLabels: Record<string, string> = {
    compliant: 'Compliant',
    partial: 'Partially compliant',
    non_compliant: 'Non-compliant',
    not_applicable: 'Not applicable',
    unknown: 'Unknown',
}

function ReviewItem({
    item,
    answer,
    assessmentId,
}: {
    item: ChecklistItem
    answer?: AssessmentAnswer
    assessmentId: string
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
                            <Textarea
                                id={`${item.id}-answer`}
                                value={text}
                                onChange={event => setText(event.target.value)}
                                rows={4}
                                placeholder="Enter the operator or vendor response"
                            />
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
                                    {answer.evidence.map((evidence, index) => (
                                        <div
                                            key={`${evidence.source}-${index}`}
                                            className="border-l-2 border-primary pl-3 text-sm"
                                        >
                                            <p>{evidence.summary}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {evidence.source}
                                            </p>
                                        </div>
                                    ))}
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
    const checklistQuery = useQuery({
        queryKey: ['risk-assessment-checklist'],
        queryFn: api.riskAssessments.checklist,
    })
    const assessment = assessmentQuery.data
    const answers = useMemo(
        () => new Map(assessment?.answers_data.map(answer => [answer.question_id, answer]) || []),
        [assessment],
    )
    const sections = useMemo(() => {
        const grouped = new Map<string, ChecklistItem[]>()
        for (const item of checklistQuery.data?.items || []) {
            const key = `${item.source} · ${item.section}`
            grouped.set(key, [...(grouped.get(key) || []), item])
        }
        return grouped
    }, [checklistQuery.data])
    const approved = assessment?.answers_data.filter(answer => answer.status === 'approved').length || 0
    const populated = assessment?.answers_data.filter(answer => answer.answer?.trim()).length || 0
    const total = checklistQuery.data?.items.length || 0
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
        if (
            assessment?.status === 'needs_review' &&
            populated === 0 &&
            !recoveryAttempted.current
        ) {
            recoveryAttempted.current = true
            recoveryMutation.mutate()
        }
    }, [assessment?.status, populated, recoveryMutation])

    if (assessmentQuery.isLoading || checklistQuery.isLoading)
        return (
            <div className="flex min-h-screen flex-1 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        )
    if (!assessment || !checklistQuery.data)
        return (
            <div className="flex min-h-screen flex-1 items-center justify-center">
                Risk assessment not found.
            </div>
        )

    return (
        <main className="min-h-screen flex-1 bg-background">
            <header className="sticky top-0 z-30 border-b bg-card">
                <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
                    <Link to={`/networks`}>
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
                            {assessment.id} · Checklist {assessment.checklist_version}
                        </p>
                    </div>
                    <Badge variant="outline">{assessment.access_mode}</Badge>
                </div>
            </header>
            <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_300px]">
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
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
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
