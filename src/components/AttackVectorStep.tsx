import {
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Copy,
    FileStack,
    Info,
    Loader2,
    RotateCw,
    ShieldCheck,
    XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { type Artifact, ArtifactsModal, type Issue } from '@/components/ArtifactsModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LogEntry {
    timestamp: string
    level: 'info' | 'error' | 'success'
    message: string
    source?: string
}

interface TodoItem {
    id: string
    content: string
    status: 'todo' | 'in-progress' | 'in_progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    order?: number
}

interface AttackVectorStepProps {
    stepIndex: number
    stepName: string
    status: 'pending' | 'running' | 'success' | 'error'
    logs: LogEntry[]
    severity?: 'high' | 'medium' | 'critical' | 'low'
    scanId?: string
    onCancel?: () => void
    artifacts?: Artifact[]
    issues?: Issue[]
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function AttackVectorStep({
    stepIndex,
    stepName,
    status,
    logs,
    severity = 'medium',
    scanId,
    onCancel,
    artifacts = [],
    issues = [],
}: AttackVectorStepProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)
    const [artifactsOpen, setArtifactsOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    // Extract todos from logs
    const liveTodos = useMemo(() => {
        const todoMap = new Map<string, TodoItem>()

        for (const log of logs) {
            if ((log as any).type === 'tool_use' && (log as any).data) {
                const toolData = (log as any).data

                if (toolData.name === 'TodoWrite' && toolData.input?.todos) {
                    todoMap.clear()

                    for (let i = 0; i < toolData.input.todos.length; i++) {
                        const todo = toolData.input.todos[i]
                        const todoKey = todo.content || todo.activeForm || JSON.stringify(todo)
                        todoMap.set(todoKey, {
                            id: todoKey,
                            content: todo.content || todo.activeForm,
                            status: todo.status,
                            priority: todo.priority || 'medium',
                            order: i,
                        })
                    }
                }
            }
        }

        return Array.from(todoMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0))
    }, [logs])

    const getStatusIcon = () => {
        switch (status) {
            case 'running':
                return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            case 'success':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />
            case 'pending':
                return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'running':
                return 'Running'
            case 'success':
                return 'Passed'
            case 'error':
                return 'Failed'
            case 'pending':
                return 'Pending'
        }
    }

    const getSeverityColor = () => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-700 border-red-200'
            case 'high':
                return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'medium':
                return 'bg-teal-100 text-teal-700 border-teal-200'
            case 'low':
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const formatStepName = (name: string) => {
        return name
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const handleRetry = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!scanId) return

        setIsRetrying(true)
        try {
            const response = await fetch(`${API_BASE_URL}/scans/${scanId}/retry`, {
                method: 'POST',
            })
            const data = await response.json()

            if (response.ok && data.scan_id) {
                window.location.reload()
            } else {
                throw new Error(data.message || 'Failed to retry scan')
            }
        } catch (error) {
            console.error('Failed to retry scan:', error)
            alert('Failed to retry scan. Please try again.')
        } finally {
            setIsRetrying(false)
        }
    }

    const handleCopyLogs = async (e: React.MouseEvent) => {
        e.stopPropagation()
        const logsText = logs
            .map(
                log =>
                    `${new Date(
                        log.timestamp,
                    ).toLocaleTimeString()} [${log.level.toUpperCase()}] ${log.message}`,
            )
            .join('\n')

        try {
            await navigator.clipboard.writeText(logsText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy logs:', error)
        }
    }

    return (
        <Card
            className={cn(
                'transition-all duration-200 hover:shadow-md cursor-pointer border',
                isExpanded && 'ring-2 ring-primary/20',
            )}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon()}
                        <div className="flex-1">
                            <h3 className="font-semibold text-base">{formatStepName(stepName)}</h3>
                            <p className="text-sm text-muted-foreground">{getStatusText()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {status === 'success' ? (
                            <Badge
                                variant="outline"
                                className="font-medium bg-green-50 text-green-700 border-green-200"
                            >
                                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                                Validated
                            </Badge>
                        ) : (
                            <Badge variant="outline" className={cn('font-medium', getSeverityColor())}>
                                {severity}
                            </Badge>
                        )}

                        {/* Action buttons */}
                        {status === 'error' && scanId && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRetry}
                                disabled={isRetrying}
                                className="h-8 px-2"
                            >
                                {isRetrying ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                ) : (
                                    <RotateCw className="h-3.5 w-3.5 mr-1" />
                                )}
                                Retry
                            </Button>
                        )}

                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-4 pt-4 border-t">
                        {liveTodos.length > 0 ? (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {liveTodos.map(todo => (
                                    <div
                                        key={todo.id}
                                        className={cn(
                                            'flex items-start gap-3 p-3 rounded-lg border transition-all relative',
                                            todo.status === 'in-progress' ||
                                                todo.status === 'in_progress'
                                                ? 'bg-blue-50 border-blue-400 shadow-lg animate-pulse ring-2 ring-blue-300 ring-opacity-50'
                                                : todo.status === 'completed'
                                                  ? 'bg-green-50 border-green-200'
                                                  : 'bg-card hover:bg-accent/50',
                                        )}
                                    >
                                        <div className="flex-shrink-0 mt-0.5 relative z-10">
                                            {todo.status === 'completed' ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : todo.status === 'in-progress' ||
                                              todo.status === 'in_progress' ? (
                                                <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                            ) : (
                                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <p
                                                className={cn(
                                                    'text-sm',
                                                    todo.status === 'completed' &&
                                                        'line-through text-muted-foreground',
                                                )}
                                            >
                                                {todo.content}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'text-xs mt-1',
                                                    todo.status === 'completed' &&
                                                        'bg-green-100 text-green-700 border-green-200',
                                                    (todo.status === 'in-progress' ||
                                                        todo.status === 'in_progress') &&
                                                        'bg-blue-100 text-blue-700 border-blue-200',
                                                    todo.status === 'todo' &&
                                                        'bg-gray-100 text-gray-700 border-gray-200',
                                                )}
                                            >
                                                {todo.status.replace('_', '-')}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : logs.length === 0 && artifacts.length === 0 ? (
                            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                                <Info className="h-4 w-4" />
                                <p>No logs or artifacts available for this step.</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                                <Info className="h-4 w-4" />
                                <p>
                                    {logs.length > 0
                                        ? `${logs.length} log ${logs.length === 1 ? 'entry' : 'entries'}`
                                        : 'No logs'}
                                    {logs.length > 0 && artifacts.length > 0 && ' and '}
                                    {artifacts.length > 0
                                        ? `${artifacts.length} ${
                                              artifacts.length === 1 ? 'artifact' : 'artifacts'
                                          }`
                                        : ''}
                                    {' available. Expand to see more.'}
                                </p>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-2">
                            {logs.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyLogs}
                                    className="h-8 px-3"
                                >
                                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={e => {
                                    e.stopPropagation()
                                    setArtifactsOpen(true)
                                }}
                                className="h-8 px-3"
                            >
                                <FileStack className="h-3.5 w-3.5 mr-1.5" />
                                {artifacts.length > 0 ? `More (${artifacts.length})` : 'More'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <ArtifactsModal
                open={artifactsOpen}
                onOpenChange={setArtifactsOpen}
                artifacts={artifacts}
                stepName={formatStepName(stepName)}
                logs={logs}
                issues={issues}
                scanId={scanId}
                scanStatus={status}
            />
        </Card>
    )
}
