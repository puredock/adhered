import { AlertCircle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AttackVectorStep } from '@/components/AttackVectorStep'
import { Badge } from '@/components/ui/badge'

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
    initialStatus?: 'running' | 'completed' | 'failed' | 'cancelled'
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function PenetrationTestLog({
    scanId,
    persistedState,
    onStateChange,
    onComplete,
    onCancel,
    initialStatus = 'running',
}: PenetrationTestLogProps) {
    const [logs, setLogs] = useState<LogEntry[]>(persistedState?.logs || [])
    const [steps, setSteps] = useState<Step[]>(persistedState?.steps || [])
    const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'cancelled'>(initialStatus)
    const [isConnected, setIsConnected] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const eventSourceRef = useRef<EventSource | null>(null)
    const currentStepIndexRef = useRef<number | null>(null)

    console.log('PenetrationTestLog render - scanId:', scanId, 'steps:', steps.length, 'status:', status)

    useEffect(() => {
        console.log(
            'PenetrationTestLog useEffect - mounting for scanId:',
            scanId,
            'initialStatus:',
            initialStatus,
        )

        if (initialStatus !== 'running') {
            console.log('Skipping EventSource connection - scan already completed/failed')
            return
        }

        const eventSource = new EventSource(`${API_BASE_URL}/api/v1/scans/${scanId}/stream`)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
            console.log('SSE connected for scan:', scanId)
            setIsConnected(true)
        }

        eventSource.onmessage = event => {
            const data = JSON.parse(event.data)

            if (data.type === 'complete') {
                const finalStatus = data.status === 'completed' ? 'completed' : 'failed'
                setStatus(finalStatus)

                // Mark any remaining "running" or "pending" steps as error (incomplete)
                setSteps(prev => {
                    const updated = prev.map(step =>
                        step.status === 'running' || step.status === 'pending'
                            ? { ...step, status: 'error' }
                            : step,
                    )
                    onStateChange?.({ steps: updated, logs })
                    return updated
                })

                eventSource.close()
                onComplete?.(data.status)
            } else if (data.type === 'step_init') {
                // Initialize steps
                const totalSteps = data.total_steps
                console.log('Received step_init, total steps:', totalSteps)
                const initialSteps: Step[] = []
                for (let i = 1; i <= totalSteps; i++) {
                    initialSteps.push({
                        index: i,
                        name: `Step ${i}`,
                        status: 'pending',
                        logs: [],
                        severity: 'medium',
                    })
                }
                console.log('Setting steps state to:', initialSteps)
                setSteps(initialSteps)
                onStateChange?.({ steps: initialSteps, logs })
            } else if (data.type === 'step_start') {
                currentStepIndexRef.current = data.step_index
                setSteps(prev => {
                    const updated = prev.map(step =>
                        step.index === data.step_index
                            ? { ...step, name: data.step_name, status: 'running' }
                            : step,
                    )
                    onStateChange?.({ steps: updated, logs })
                    return updated
                })
            } else if (data.type === 'step_success') {
                setSteps(prev => {
                    const updated = prev.map(step =>
                        step.index === data.step_index ? { ...step, status: 'success' } : step,
                    )
                    onStateChange?.({ steps: updated, logs })
                    return updated
                })
            } else if (data.type === 'step_error') {
                setSteps(prev => {
                    const updated = prev.map(step =>
                        step.index === data.step_index ? { ...step, status: 'error' } : step,
                    )
                    onStateChange?.({ steps: updated, logs })
                    return updated
                })
            } else {
                // Regular log entry - skip step markers themselves
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

                    setLogs(prev => {
                        const updated = [...prev, logEntry]
                        setSteps(currentSteps => {
                            onStateChange?.({ steps: currentSteps, logs: updated })
                            return currentSteps
                        })
                        return updated
                    })

                    // Add log to the corresponding step using ref
                    const stepIndex = currentStepIndexRef.current
                    if (stepIndex !== null) {
                        setSteps(prev => {
                            const updated = prev.map(step =>
                                step.index === stepIndex
                                    ? { ...step, logs: [...step.logs, logEntry] }
                                    : step,
                            )
                            setLogs(currentLogs => {
                                onStateChange?.({ steps: updated, logs: currentLogs })
                                return currentLogs
                            })
                            return updated
                        })
                    }
                }
            }
        }

        eventSource.onerror = () => {
            setIsConnected(false)
            if (status === 'running') {
                setStatus('failed')
            }
            eventSource.close()
        }

        return () => {
            eventSource.close()
        }
    }, [scanId, onComplete, initialStatus])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    const handleCancel = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/scans/${scanId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                const scanResult = await response.json()
                setStatus('cancelled')
                eventSourceRef.current?.close()

                // Mark any running or pending steps as cancelled/completed
                setSteps(prev => {
                    const updated = prev.map(step =>
                        step.status === 'running' || step.status === 'pending'
                            ? { ...step, status: 'success' as const }
                            : step,
                    )
                    onStateChange?.({ steps: updated, logs })
                    return updated
                })

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

    return (
        <div className="w-full space-y-3">
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
        </div>
    )
}
