import { AlertCircle, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AttackVectorStep } from '@/components/AttackVectorStep'
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
    issues?: any[]
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
    const historicalDataLoadedRef = useRef<boolean>(false)

    const onCompleteRef = useRef(onComplete)
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    const onStateChangeRef = useRef(onStateChange)
    useEffect(() => {
        onStateChangeRef.current = onStateChange
    }, [onStateChange])

    console.log('PenetrationTestLog render - scanId:', scanId, 'steps:', steps.length, 'status:', status)

    // Initialize cancelled scans - mark running/pending steps as error
    useEffect(() => {
        if (initialStatus === 'cancelled') {
            setSteps(prev =>
                prev.map(step =>
                    step.status === 'running' || step.status === 'pending'
                        ? { ...step, status: 'error' as const }
                        : step,
                ),
            )
        }
    }, [initialStatus])

    useEffect(() => {
        console.log(
            'PenetrationTestLog useEffect - mounting for scanId:',
            scanId,
            'initialStatus:',
            initialStatus,
        )

        // Check historical data flag FIRST before any processing
        if (initialStatus !== 'running' && historicalDataLoadedRef.current) {
            console.log('Historical data already loaded for this scan, skipping')
            return
        }

        const processEvent = (data: any) => {
            console.log('Processing event:', data.type, data)

            if (data.type === 'complete') {
                const finalStatus = data.status === 'completed' ? 'completed' : 'failed'
                setStatus(finalStatus)

                setSteps(prev =>
                    prev.map(step =>
                        step.status === 'running' || step.status === 'pending'
                            ? { ...step, status: 'error' }
                            : step,
                    ),
                )

                // Fetch scan results to get issues
                fetch(`${API_BASE_URL}/scans/${scanId}`)
                    .then(res => res.json())
                    .then(scanData => {
                        if (scanData.issues && scanData.issues.length > 0) {
                            // Add all issues to the last step
                            setSteps(prev => {
                                const lastStepIndex = prev.length - 1
                                if (lastStepIndex >= 0) {
                                    return prev.map((step, idx) =>
                                        idx === lastStepIndex
                                            ? { ...step, issues: scanData.issues }
                                            : step,
                                    )
                                }
                                return prev
                            })
                        }
                    })
                    .catch(err => console.error('Failed to fetch scan issues:', err))

                eventSourceRef.current?.close()
                onCompleteRef.current?.(data.status)
            } else if (data.type === 'step_init') {
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
                const payload = data.payload || data
                const stepIndex = payload.step_index || data.step_index

                setSteps(prev =>
                    prev.map(step => (step.index === stepIndex ? { ...step, status: 'success' } : step)),
                )
            } else if (data.type === 'step_error') {
                const payload = data.payload || data
                const stepIndex = payload.step_index || data.step_index

                setSteps(prev =>
                    prev.map(step => (step.index === stepIndex ? { ...step, status: 'error' } : step)),
                )
            } else if (data.type === 'tool_use' || data.type === 'tool_use_updated') {
                console.log('Received tool_use event:', data)
                const logEntry: LogEntry = {
                    timestamp: data.data?.timestamp || data.timestamp || new Date().toISOString(),
                    level: 'info',
                    message: '',
                    type: data.type,
                    ...data,
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
            } else if (data.type === 'log') {
                const payload = data.payload || data

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
                }
            }
        }

        if (initialStatus !== 'running') {
            console.log('Loading historical events for completed scan')
            historicalDataLoadedRef.current = true

            const loadHistoricalEvents = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/scans/${scanId}/events`)
                    if (!response.ok) {
                        throw new Error(`Failed to fetch historical events: ${response.statusText}`)
                    }
                    const data = await response.json()
                    console.log('Loaded historical events:', data.total)

                    // Process events in a single batch using React 18 automatic batching
                    // Wrap in setTimeout to ensure batching
                    setTimeout(() => {
                        for (const event of data.events) {
                            processEvent(event)
                        }
                    }, 0)

                    // Also fetch scan results to get issues and status
                    const scanResponse = await fetch(`${API_BASE_URL}/scans/${scanId}`)
                    if (scanResponse.ok) {
                        const scanData = await scanResponse.json()

                        // If scan was cancelled, mark all running/pending steps as error
                        if (scanData.status === 'cancelled') {
                            setTimeout(() => {
                                setSteps(prev =>
                                    prev.map(step =>
                                        step.status === 'running' || step.status === 'pending'
                                            ? { ...step, status: 'error' }
                                            : step,
                                    ),
                                )
                            }, 100)
                        }

                        if (scanData.issues && scanData.issues.length > 0) {
                            setTimeout(() => {
                                setSteps(prev => {
                                    const lastStepIndex = prev.length - 1
                                    if (lastStepIndex >= 0) {
                                        return prev.map((step, idx) =>
                                            idx === lastStepIndex
                                                ? { ...step, issues: scanData.issues }
                                                : step,
                                        )
                                    }
                                    return prev
                                })
                            }, 100)
                        }
                    }
                } catch (error) {
                    console.error('Error loading historical events:', error)
                    setConnectionError(
                        'Unable to load scan history. This scan may be too old or the data has expired.',
                    )

                    // Fallback: if scan is cancelled but we can't load history,
                    // make sure steps are not stuck in "Running"
                    if (initialStatus === 'cancelled') {
                        setSteps(prev =>
                            prev.map(step =>
                                step.status === 'running' || step.status === 'pending'
                                    ? { ...step, status: 'error' as const }
                                    : step,
                            ),
                        )
                    }
                }
            }

            loadHistoricalEvents()
            return
        }

        if (eventSourceRef.current) {
            const state = eventSourceRef.current.readyState
            if (state === EventSource.CONNECTING || state === EventSource.OPEN) {
                console.log('EventSource already active, skipping duplicate connection')
                return
            }
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
            console.log('[SSE] Received event:', data.type, data)
            processEvent(data)
        }

        eventSource.onerror = error => {
            console.error('SSE error for scan:', scanId, error)
            setIsConnected(false)

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
            // Reset historical data flag when unmounting
            historicalDataLoadedRef.current = false
        }
    }, [scanId]) // Only scanId - initialStatus and status should not trigger re-runs

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    })

    useEffect(() => {
        onStateChangeRef.current?.({ steps, logs })
    }, [steps, logs])

    const handleCancel = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/scans/${scanId}`, {
                method: 'DELETE',
            })

            // Handle both successful delete and 404 (scan already gone/never persisted)
            if (response.ok || response.status === 404) {
                setStatus('cancelled')
                eventSourceRef.current?.close()

                const updatedSteps = steps.map(step =>
                    step.status === 'running' || step.status === 'pending'
                        ? { ...step, status: 'error' as const }
                        : step,
                )

                setSteps(updatedSteps)

                // Immediately notify parent of the updated state
                onStateChangeRef.current?.({ steps: updatedSteps, logs })

                onComplete?.('cancelled')

                // Defer onCancel to let React flush state
                setTimeout(() => {
                    onCancel?.()
                }, 100)
            }
        } catch (error) {
            console.error('Failed to cancel scan:', error)
        }
    }

    const handleClearStaleScan = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/scans/${scanId}`, {
                method: 'DELETE',
            })
            // 404 is OK - scan was already deleted or never persisted
            if (!response.ok && response.status !== 404) {
                console.error('Failed to delete stale scan:', response.statusText)
            }
        } catch (error) {
            console.error('Failed to delete stale scan:', error)
        } finally {
            onClearStaleScan?.(scanId)
            onCancel?.()
        }
    }

    return (
        <div className="w-full space-y-3">
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
                                issues={step.issues || []}
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
