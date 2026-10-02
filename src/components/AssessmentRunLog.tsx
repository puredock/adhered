import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ChevronRight, Loader2, XCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AttackVectorStep } from '@/components/AttackVectorStep'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { type AssessmentArtifact, type AssessmentEvent, api } from '@/lib/api'
import type { Artifact } from './artifacts/types'

interface AssessmentRunLogProps {
    assessmentId: string
    status: 'pending' | 'active' | 'needs_review' | 'approved' | 'failed'
    artifacts: AssessmentArtifact[]
    sourceMode?: 'live' | 'manual' | 'disclosure_only' | 'disclosure_and_live'
}

interface StepLog {
    timestamp: string
    level: 'info' | 'error' | 'success'
    message: string
    type?: 'tool_use' | 'tool_use_updated'
    data?: {
        id: string
        name: string
        timestamp?: string
        input?: {
            todos?: { content?: string; activeForm?: string; status: string; priority?: string }[]
            cmd?: string
            command?: string
        }
        output?: string
    }
}

interface RunStep {
    index: number
    name: string
    status: 'pending' | 'running' | 'success' | 'error'
    logs: StepLog[]
}

function value(event: AssessmentEvent, key: string): unknown {
    return event.payload?.[key]
}

function toLog(event: AssessmentEvent): StepLog | null {
    if (event.type === 'tool_use' && event.data) {
        return {
            timestamp: event.timestamp || event.data.timestamp || new Date().toISOString(),
            level: 'info',
            message: `${event.data.name || 'Tool'} invoked`,
            type: 'tool_use',
            data: {
                id: event.data.id || `${event.timestamp}-${event.data.name}`,
                name: event.data.name || 'Tool',
                timestamp: event.data.timestamp,
                input: event.data.input as StepLog['data']['input'],
                output:
                    typeof event.data.output === 'string'
                        ? event.data.output
                        : event.data.output == null
                          ? undefined
                          : JSON.stringify(event.data.output, null, 2),
            },
        }
    }
    if (event.type !== 'log' && event.type !== 'step_error') return null
    return {
        timestamp: event.timestamp || new Date().toISOString(),
        level: event.level === 'error' ? 'error' : event.level === 'success' ? 'success' : 'info',
        message: String(value(event, event.type === 'log' ? 'message' : 'error') || ''),
    }
}

function buildSteps(events: AssessmentEvent[]): RunStep[] {
    const initialized = events.find(event => event.type === 'step_init')
    const names = (value(initialized || { type: '' }, 'step_names') as string[]) || []
    const steps: RunStep[] = names.map((name, index) => ({
        index: index + 1,
        name,
        status: 'pending',
        logs: [],
    }))
    let current = 0
    for (const event of events) {
        const stepIndex = Number(value(event, 'step_index'))
        if (event.type === 'step_start' && stepIndex) {
            current = stepIndex
            if (steps[current - 1]) steps[current - 1].status = 'running'
        }
        if (event.type === 'step_success' && stepIndex && steps[stepIndex - 1]) {
            steps[stepIndex - 1].status = 'success'
        }
        if (event.type === 'step_error' && stepIndex && steps[stepIndex - 1]) {
            steps[stepIndex - 1].status = 'error'
        }
        const log = toLog(event)
        if (log && current && steps[current - 1]) steps[current - 1].logs.push(log)
    }

    // Claude's TodoWrite tool is the closest representation of its live plan.
    // Prefer that plan when available; keep the backend milestones as fallback.
    const latestTodos = [...events]
        .reverse()
        .find(event => event.type === 'tool_use' && event.data?.name === 'TodoWrite')?.data?.input
        ?.todos as { content?: string; activeForm?: string; status?: string }[] | undefined
    if (latestTodos?.length) {
        const todoSteps = latestTodos.map((todo, index) => {
            const todoStatus = todo.status?.toLowerCase()
            return {
                index: index + 1,
                name: todo.content || todo.activeForm || 'Untitled task',
                status: (todoStatus === 'completed' || todoStatus === 'complete'
                    ? 'success'
                    : todoStatus === 'in_progress' || todoStatus === 'in progress'
                      ? 'running'
                      : 'pending') as RunStep['status'],
                logs: [],
            }
        })
        const agentLogs = steps[1]?.logs || []
        const activeIndex = todoSteps.findIndex(step => step.status === 'running')
        todoSteps[activeIndex < 0 ? 0 : activeIndex].logs = agentLogs
        return todoSteps
    }
    return steps
}

function formatBytes(size: number) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function AssessmentRunLog({
    assessmentId,
    status,
    artifacts,
    sourceMode = 'live',
}: AssessmentRunLogProps) {
    const isRunning = status === 'pending' || status === 'active'
    const [expanded, setExpanded] = useState(isRunning)
    const eventsQuery = useQuery({
        queryKey: ['risk-assessment-events', assessmentId],
        queryFn: () => api.riskAssessments.events(assessmentId),
        refetchInterval: isRunning ? 1000 : false,
    })
    const allEvents = useMemo(() => eventsQuery.data?.events || [], [eventsQuery.data?.events])
    // Attaching a disclosure later starts a new run on the same event stream; show only the latest run.
    const events = useMemo(() => {
        let start = 0
        allEvents.forEach((event, index) => {
            if (event.type === 'run_start') start = index
        })
        return allEvents.slice(start)
    }, [allEvents])
    const steps = useMemo(() => buildSteps(events), [events])
    const hasAgentTodos = events.some(
        event =>
            event.type === 'tool_use' &&
            event.data?.name === 'TodoWrite' &&
            Array.isArray(event.data.input?.todos) &&
            event.data.input.todos.length > 0,
    )
    const completedSteps = steps.filter(step => step.status === 'success').length
    const failedSteps = steps.filter(step => step.status === 'error').length
    const progress = steps.length ? ((completedSteps + failedSteps) / steps.length) * 100 : 0
    const modalArtifacts: Artifact[] = artifacts.map(artifact => ({
        id: artifact.id,
        name: artifact.name,
        type: artifact.type,
        size: formatBytes(artifact.size),
        timestamp: artifact.timestamp,
        url: api.riskAssessments.artifactUrl(assessmentId, artifact.id),
    }))

    const wasRunning = useRef(isRunning)
    useEffect(() => {
        if (isRunning) setExpanded(true)
        // Polling stops with the run; fetch once more so the final step and run_end events are shown.
        else if (wasRunning.current) eventsQuery.refetch()
        wasRunning.current = isRunning
    }, [isRunning, eventsQuery])

    return (
        <div>
            <Card className="overflow-hidden">
                <button
                    type="button"
                    onClick={() => setExpanded(value => !value)}
                    className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/40"
                    aria-expanded={expanded}
                >
                    {isRunning ? (
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                    ) : failedSteps || status === 'failed' ? (
                        <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                    ) : (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                            <p className="font-medium">Assessment execution</p>
                            <span className="text-xs text-muted-foreground">
                                {completedSteps}/{steps.length || 4} steps
                            </span>
                        </div>
                        <Progress value={progress} className="mt-2 h-1.5" />
                        <p className="mt-2 text-sm text-muted-foreground">
                            {events.length} retained events · {modalArtifacts.length} artifacts
                        </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                        {isRunning ? 'Live' : status.replace('_', ' ')}
                    </Badge>
                    <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
                    />
                </button>
                {expanded && (
                    <div className="space-y-3 border-t bg-muted/20 p-3">
                        {steps.length ? (
                            steps.map(step => (
                                <AttackVectorStep
                                    key={step.index}
                                    stepIndex={step.index}
                                    stepName={step.name}
                                    status={step.status}
                                    logs={step.logs}
                                    severity="medium"
                                    artifacts={
                                        step.index ===
                                        (hasAgentTodos
                                            ? Math.max(
                                                  1,
                                                  steps.find(item => item.status === 'running')?.index ||
                                                      1,
                                              )
                                            : 2)
                                            ? modalArtifacts
                                            : []
                                    }
                                />
                            ))
                        ) : (
                            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                                {sourceMode === 'manual' ? (
                                    'Manual assessment: no automated run was started.'
                                ) : sourceMode === 'disclosure_only' ? (
                                    'Assessment findings are based on the uploaded manufacturer disclosure.'
                                ) : (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Preparing the assessment plan...
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    )
}
