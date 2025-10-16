import {
    Ban,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Info,
    Loader2,
    RotateCw,
    XCircle,
} from 'lucide-react'
import { useState } from 'react'
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

interface AttackVectorStepProps {
    stepIndex: number
    stepName: string
    status: 'pending' | 'running' | 'success' | 'error'
    logs: LogEntry[]
    severity?: 'high' | 'medium' | 'critical' | 'low'
    scanId?: string
    onCancel?: () => void
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
}: AttackVectorStepProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)

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

    const getLevelIcon = (level: LogEntry['level']) => {
        switch (level) {
            case 'success':
                return <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
            case 'error':
                return <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
            case 'info':
                return <Info className="h-3 w-3 text-blue-500 flex-shrink-0" />
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

    const handleCancel = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!scanId) return

        try {
            await fetch(`${API_BASE_URL}/api/v1/scans/${scanId}`, {
                method: 'DELETE',
            })
            onCancel?.()
        } catch (error) {
            console.error('Failed to cancel scan:', error)
        }
    }

    const handleRetry = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!scanId) return

        setIsRetrying(true)
        try {
            await fetch(`${API_BASE_URL}/api/v1/scans/${scanId}/retry`, {
                method: 'POST',
            })
            // Refresh or redirect to new scan
        } catch (error) {
            console.error('Failed to retry scan:', error)
        } finally {
            setIsRetrying(false)
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
                        <Badge variant="outline" className={cn('font-medium', getSeverityColor())}>
                            {severity}
                        </Badge>

                        {/* Action buttons */}
                        {status === 'running' && scanId && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                                className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Ban className="h-3.5 w-3.5 mr-1" />
                                Cancel
                            </Button>
                        )}

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

                {isExpanded && logs.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="bg-slate-950 rounded-md p-3 max-h-[300px] overflow-y-auto">
                            <div className="font-mono text-xs space-y-1">
                                {logs.map((log, index) => (
                                    <div key={index} className="flex items-start gap-2 text-slate-200">
                                        <span className="text-slate-500 min-w-[80px] text-[10px]">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                        {getLevelIcon(log.level)}
                                        <span className="flex-1 break-words">{log.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    )
}
