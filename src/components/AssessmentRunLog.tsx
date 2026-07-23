import { useQuery } from '@tanstack/react-query'
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    CircleDashed,
    Code2,
    Loader2,
    TerminalSquare,
    Wrench,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type AssessmentEvent, api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface AssessmentRunLogProps {
    assessmentId: string
    status: 'pending' | 'active' | 'needs_review' | 'approved' | 'failed'
}

interface RunStep {
    index: number
    name: string
    status: 'pending' | 'active' | 'completed' | 'failed'
}

function payloadValue(event: AssessmentEvent, key: string): unknown {
    return event.payload?.[key]
}

function eventMessage(event: AssessmentEvent): string {
    if (event.type === 'log') return String(payloadValue(event, 'message') || '')
    if (event.type === 'tool_use') return `${event.data?.name || 'Tool'} invoked`
    if (event.type === 'step_start') return `Started ${payloadValue(event, 'step_name')}`
    if (event.type === 'step_success') return `Completed ${payloadValue(event, 'step_name')}`
    if (event.type === 'step_error') return String(payloadValue(event, 'error') || 'Step failed')
    if (event.type === 'run_start') return 'Risk assessment started'
    if (event.type === 'run_end') return `Risk assessment ${payloadValue(event, 'status')}`
    return event.type.replaceAll('_', ' ')
}

function buildSteps(events: AssessmentEvent[]): RunStep[] {
    const initialized = events.find(event => event.type === 'step_init')
    const names = (payloadValue(initialized || { type: '' }, 'step_names') as string[]) || []
    const steps = names.map((name, index) => ({
        index: index + 1,
        name,
        status: 'pending' as const,
    }))
    for (const event of events) {
        const index = Number(payloadValue(event, 'step_index'))
        if (!index || !steps[index - 1]) continue
        if (event.type === 'step_start') steps[index - 1].status = 'active'
        if (event.type === 'step_success') steps[index - 1].status = 'completed'
        if (event.type === 'step_error') steps[index - 1].status = 'failed'
    }
    return steps
}

export function AssessmentRunLog({ assessmentId, status }: AssessmentRunLogProps) {
    const isRunning = status === 'pending' || status === 'active'
    const [expanded, setExpanded] = useState(true)
    const endRef = useRef<HTMLDivElement>(null)
    const eventsQuery = useQuery({
        queryKey: ['risk-assessment-events', assessmentId],
        queryFn: () => api.riskAssessments.events(assessmentId),
        refetchInterval: isRunning ? 1000 : false,
    })
    const events = useMemo(() => eventsQuery.data?.events || [], [eventsQuery.data?.events])
    const steps = useMemo(() => buildSteps(events), [events])

    useEffect(() => {
        if (isRunning) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, [events.length, isRunning])

    return (
        <section className="border border-border bg-card">
            <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                onClick={() => setExpanded(value => !value)}
            >
                {isRunning ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : status === 'failed' ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                )}
                <div className="min-w-0 flex-1">
                    <p className="font-medium">Claude execution</p>
                    <p className="text-sm text-muted-foreground">
                        {isRunning
                            ? eventMessage(events.at(-1) || { type: 'Waiting for Claude' })
                            : `${events.length} retained events`}
                    </p>
                </div>
                <Badge variant="outline" className="capitalize">
                    {isRunning ? 'Live' : status.replace('_', ' ')}
                </Badge>
                <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
            </button>
            {expanded && (
                <div className="border-t px-4 py-4">
                    {eventsQuery.isError && (
                        <p className="mb-3 text-sm text-destructive">Unable to load execution logs.</p>
                    )}
                    <Tabs defaultValue="timeline">
                        <TabsList>
                            <TabsTrigger value="timeline">
                                <TerminalSquare className="mr-2 h-4 w-4" />
                                Timeline
                            </TabsTrigger>
                            <TabsTrigger value="raw">
                                <Code2 className="mr-2 h-4 w-4" />
                                Raw logs
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="timeline"
                            className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]"
                        >
                            <div className="space-y-2">
                                {steps.length ? (
                                    steps.map(step => (
                                        <div
                                            key={step.index}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            {step.status === 'active' ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            ) : step.status === 'completed' ? (
                                                <CheckCircle2 className="h-4 w-4 text-success" />
                                            ) : step.status === 'failed' ? (
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                            ) : (
                                                <CircleDashed className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span
                                                className={cn(
                                                    step.status === 'pending' && 'text-muted-foreground',
                                                )}
                                            >
                                                {step.name}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Waiting for the run plan...
                                    </p>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto border bg-background p-3 font-mono text-xs">
                                {events.length ? (
                                    events.map((event, index) => (
                                        <div
                                            key={`${event.id || event.timestamp}-${index}`}
                                            className="mb-3 last:mb-0"
                                        >
                                            <div className="flex items-start gap-2">
                                                {event.type === 'tool_use' && (
                                                    <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap gap-2 text-muted-foreground">
                                                        <span>
                                                            {event.timestamp
                                                                ? new Date(
                                                                      event.timestamp,
                                                                  ).toLocaleTimeString()
                                                                : '--:--:--'}
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                event.level === 'error' &&
                                                                    'text-destructive',
                                                                event.level === 'warning' &&
                                                                    'text-warning',
                                                                event.level === 'success' &&
                                                                    'text-success',
                                                            )}
                                                        >
                                                            [{event.type}]
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 whitespace-pre-wrap break-words font-sans text-sm">
                                                        {eventMessage(event)}
                                                    </p>
                                                    {event.type === 'tool_use' && event.data?.input && (
                                                        <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap break-all text-muted-foreground">
                                                            {JSON.stringify(event.data.input, null, 2)}
                                                        </pre>
                                                    )}
                                                    {event.type === 'tool_use' &&
                                                        event.data?.output != null && (
                                                            <pre className="mt-1 max-h-36 overflow-auto whitespace-pre-wrap break-all border-l-2 border-border pl-2 text-muted-foreground">
                                                                {typeof event.data.output === 'string'
                                                                    ? event.data.output
                                                                    : JSON.stringify(
                                                                          event.data.output,
                                                                          null,
                                                                          2,
                                                                      )}
                                                            </pre>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="font-sans text-sm text-muted-foreground">
                                        No events have been recorded yet.
                                    </p>
                                )}
                                <div ref={endRef} />
                            </div>
                        </TabsContent>
                        <TabsContent value="raw" className="mt-4">
                            <pre className="max-h-96 overflow-auto border bg-background p-3 text-xs whitespace-pre-wrap break-all">
                                {JSON.stringify(events, null, 2)}
                            </pre>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </section>
    )
}
