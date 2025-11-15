import { AlertCircle, CheckCircle2, Info, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AttackVectorStep } from '@/components/AttackVectorStep'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface LogEntry {
    timestamp: string
    level: 'info' | 'error' | 'success'
    message: string
    source?: string
    type?: string
    step_index?: number
    step_name?: string
    total_steps?: number
    error?: string
}

interface Step {
    index: number
    name: string
    status: 'pending' | 'running' | 'success' | 'error'
    logs: LogEntry[]
    severity: 'high' | 'medium' | 'critical' | 'low'
    artifacts?: any[]
}

interface PenetrationTestLogProps {
    scanId: string
    persistedState?: { steps: Step[]; logs: LogEntry[] }
    onStateChange?: (state: { steps: Step[]; logs: LogEntry[] }) => void
    onComplete?: (status: string) => void
    onCancel?: () => void
    onClearStaleScan?: (scanId: string) => void
    initialStatus?: 'running' | 'completed' | 'failed' | 'cancelled'
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function PenetrationTestLog({
    scanId,
    persistedState,
    onStateChange,
    onComplete,
    onCancel,
    onClearStaleScan,
    initialStatus = 'running',
}: PenetrationTestLogProps) {
    const [logs, setLogs] = useState<LogEntry[]>(persistedState?.logs || [])
    const [steps, setSteps] = useState<Step[]>(persistedState?.steps || [])
    const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'cancelled'>(initialStatus)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const eventSourceRef = useRef<EventSource | null>(null)
    const currentStepIndexRef = useRef<number | null>(null)

    // Stabilize callbacks using refs to avoid effect re-runs
    const onCompleteRef = useRef(onComplete)
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    console.log('PenetrationTestLog render - scanId:', scanId, 'steps:', steps.length, 'status:', status)

    useEffect(() => {
        console.log(
            'PenetrationTestLog useEffect - mounting for scanId:',
            scanId,
            'initialStatus:',
            initialStatus,
        )

        // Short-circuit if scan already completed (don't include in deps)
        if (initialStatus !== 'running') {
            console.log('Skipping EventSource connection - scan already completed/failed')
            return
        }

        // Prevent duplicate connections - check if one already exists and is active
        if (eventSourceRef.current) {
            const state = eventSourceRef.current.readyState
            if (state === EventSource.CONNECTING || state === EventSource.OPEN) {
                console.log('EventSource already active, skipping duplicate connection')
                return
            }
            // If CLOSED, clean it up
            eventSourceRef.current.close()
            eventSourceRef.current = null
        }

        console.log(`Creating new EventSource for ${API_BASE_URL}/scans/${scanId}/stream`)
        const eventSource = new EventSource(`${API_BASE_URL}/scans/${scanId}/stream`)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
            console.log('SSE connected for scan:', scanId)
            setIsConnected(true)
        }

        eventSource.onmessage = event => {
            const data = JSON.parse(event.data)

            // Log all events for debugging
            console.log('[SSE] Received event:', data.type, data)

            if (data.type === 'complete') {
                const finalStatus = data.status === 'completed' ? 'completed' : 'failed'
                setStatus(finalStatus)

                // Mark any remaining "running" or "pending" steps as error (incomplete)
                setSteps(prev =>
                    prev.map(step =>
                        step.status === 'running' || step.status === 'pending'
                            ? { ...step, status: 'error' }
                            : step,
                    ),
                )

                eventSource.close()
                onCompleteRef.current?.(data.status)
            } else if (data.type === 'step_init') {
                // Handle both old and new formats
                const payload = data.payload || data
                const totalSteps = payload.total_steps || data.total_steps
                const stepNames = payload.step_names || []

                console.log('Received step_init, total steps:', totalSteps)
                const initialSteps: Step[] = []
                for (let i = 1; i <= totalSteps; i++) {
                    initialSteps.push({
                        index: i,
                        name: stepNames[i - 1] || `Step ${i}`,
                        status: 'pending',
                        logs: [],
                        severity: 'medium',
                    })
                }
                console.log('Setting steps state to:', initialSteps)
                setSteps(initialSteps)
            } else if (data.type === 'step_start') {
                // Handle both old and new formats
                const payload = data.payload || data
                const stepIndex = payload.step_index || data.step_index
                const stepName = payload.step_name || data.step_name

                currentStepIndexRef.current = stepIndex
                setSteps(prev =>
                    prev.map(step =>
                        step.index === stepIndex ? { ...step, name: stepName, status: 'running' } : step,
                    ),
                )
            } else if (data.type === 'step_success') {
                // Handle both old and new formats
                const payload = data.payload || data
                const stepIndex = payload.step_index || data.step_index

                setSteps(prev =>
                    prev.map(step => (step.index === stepIndex ? { ...step, status: 'success' } : step)),
                )
            } else if (data.type === 'step_error') {
                // Handle both old and new formats
                const payload = data.payload || data
                const stepIndex = payload.step_index || data.step_index

                setSteps(prev =>
                    prev.map(step => (step.index === stepIndex ? { ...step, status: 'error' } : step)),
                )
            } else if (data.type === 'tool_use' || data.type === 'tool_use_updated') {
                // Tool use events - don't add to execution logs, they're shown in Plan/Commands tabs
                // Just store in logs array for ArtifactsModal to consume
                console.log('Received tool_use event:', data)
                const logEntry: LogEntry = {
                    timestamp: data.data?.timestamp || data.timestamp || new Date().toISOString(),
                    level: 'info',
                    message: '', // No message needed, used for Plan/Commands tabs only
                    type: data.type,
                    ...data, // Include all data fields for ArtifactsModal parsing
                }
                setLogs(prev => [...prev, logEntry])

                // Also add to current step's logs for per-step artifact viewing
                const stepIndex = currentStepIndexRef.current
                if (stepIndex !== null) {
                    setSteps(prev =>
                        prev.map(step =>
                            step.index === stepIndex
                                ? { ...step, logs: [...step.logs, logEntry] }
                                : step,
                        ),
                    )
                }
            } else if (data.type === 'log') {
                // Structured log event from EventBus
                const payload = data.payload || data

                // Skip if no message
                if (!payload.message) return

                const logEntry: LogEntry = {
                    timestamp: data.timestamp || new Date().toISOString(),
                    level: data.level || 'info',
                    message: payload.message,
                    source: payload.source,
                    type: data.type,
                }
                setLogs(prev => [...prev, logEntry])

                const stepIndex = currentStepIndexRef.current
                if (stepIndex !== null) {
                    setSteps(prev =>
                        prev.map(step =>
                            step.index === stepIndex
                                ? { ...step, logs: [...step.logs, logEntry] }
                                : step,
                        ),
                    )
                }
            } else {
                // Legacy format: Regular log entry - skip step markers themselves
                if (data.message && !data.message.startsWith('[STEP_')) {
                    const logEntry: LogEntry = {
                        timestamp: data.timestamp,
                        level: data.message.includes('[SUCCESS]')
                            ? 'success'
                            : data.message.includes('[ERROR]')
                              ? 'error'
                              : 'info',
                        message: data.message,
                        source: data.source,
                        type: data.type,
                        step_index: data.step_index,
                        step_name: data.step_name,
                    }

                    // Update logs
                    setLogs(prev => [...prev, logEntry])

                    // Add log to the corresponding step using ref
                    const stepIndex = currentStepIndexRef.current
                    if (stepIndex !== null) {
                        setSteps(prev =>
                            prev.map(step =>
                                step.index === stepIndex
                                    ? { ...step, logs: [...step.logs, logEntry] }
                                    : step,
                            ),
                        )
                    }
                }
            }
        }

        eventSource.onerror = error => {
            console.error('SSE error for scan:', scanId, error)
            setIsConnected(false)

            // Check if it's a 404 error (stale scan)
            // EventSource doesn't give us the status code, but we can detect connection failures
            setConnectionError(
                'Unable to connect to scan stream. This scan may no longer exist on the server.',
            )

            if (status === 'running') {
                setStatus('failed')
            }
            eventSource.close()
        }

        return () => {
            console.log('PenetrationTestLog cleanup - closing EventSource')
            eventSource.close()
            eventSourceRef.current = null
        }
    }, [scanId]) // Only scanId - onComplete and initialStatus stabilized

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    // Notify parent of state changes
    // Note: onStateChange is intentionally not in deps to avoid infinite loops
    useEffect(() => {
        onStateChange?.({ steps, logs })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [steps, logs])

    const handleCancel = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/scans/${scanId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                const scanResult = await response.json()
                setStatus('cancelled')
                eventSourceRef.current?.close()

                // Mark any running or pending steps as cancelled/completed
                setSteps(prev =>
                    prev.map(step =>
                        step.status === 'running' || step.status === 'pending'
                            ? { ...step, status: 'success' as const }
                            : step,
                    ),
                )

                // Mark as completed to trigger data refresh with vulnerabilities
                onComplete?.('completed')
                onCancel?.()
            }
        } catch (error) {
            console.error('Failed to cancel scan:', error)
        }
    }

    const getStatusIcon = () => {
        switch (status) {
            case 'running':
                return <Loader2 className="h-4 w-4 animate-spin" />
            case 'completed':
                return <CheckCircle2 className="h-4 w-4" />
            case 'failed':
                return <XCircle className="h-4 w-4" />
            case 'cancelled':
                return <AlertCircle className="h-4 w-4" />
        }
    }

    const getStatusBadge = () => {
        const variants = {
            running: 'default',
            completed: 'default',
            failed: 'destructive',
            cancelled: 'secondary',
        }

        return (
            <Badge variant={variants[status] as any} className="flex items-center gap-1">
                {getStatusIcon()}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        )
    }

    const getLevelIcon = (level: LogEntry['level']) => {
        switch (level) {
            case 'success':
                return <CheckCircle2 className="h-3 w-3 text-green-500" />
            case 'error':
                return <XCircle className="h-3 w-3 text-red-500" />
            case 'info':
                return <Info className="h-3 w-3 text-blue-500" />
        }
    }

    const handleClearStaleScan = async () => {
        try {
            // Try to delete the scan from the backend
            await fetch(`${API_BASE_URL}/scans/${scanId}`, {
                method: 'DELETE',
            })
        } catch (error) {
            console.error('Failed to delete stale scan:', error)
            // Ignore errors - the scan might already be gone
        } finally {
            // Notify parent to remove from the list
            onClearStaleScan?.(scanId)
            // Close the activity item
            onCancel?.()
        }
    }

    return (
        <div className="w-full space-y-3">
            {/* Show error UI for stale/failed scans */}
            {connectionError && status === 'failed' && steps.length === 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-red-900 mb-1">Scan Not Found</h4>
                            <p className="text-sm text-red-800">{connectionError}</p>
                            <p className="text-sm text-red-700 mt-2">
                                This scan appears to be stale or was removed from the server. You can
                                clear it from the activity list.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleClearStaleScan}
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Clear
                        </Button>
                        <Button onClick={onCancel} variant="outline" size="sm">
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {/* Normal flow - show steps or loading */}
            {!(connectionError && status === 'failed' && steps.length === 0) && (
                <>
                    {steps.length === 0 && status === 'running' ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Initializing penetration test...
                        </div>
                    ) : (
                        steps.map(step => (
                            <AttackVectorStep
                                key={step.index}
                                stepIndex={step.index}
                                stepName={step.name}
                                status={step.status}
                                logs={step.logs}
                                severity={step.severity}
                                scanId={scanId}
                                onCancel={handleCancel}
                                artifacts={step.artifacts || []}
                            />
                        ))
                    )}

                    {!isConnected && status === 'running' && logs.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2 text-yellow-800">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">Connection lost. Attempting to reconnect...</span>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
