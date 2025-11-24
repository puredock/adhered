import { AlertCircle, Code2, ListTodo } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ArtifactsIssuesTab } from './ArtifactsIssuesTab'
import { ArtifactsPlanTab } from './ArtifactsPlanTab'
import { ArtifactsTimelineTab } from './ArtifactsTimelineTab'
import type { Artifact, BashCommand, Issue, LogEntry, TimelineItem, TodoItem } from './types'

interface ArtifactsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    artifacts: Artifact[]
    stepName: string
    logs?: LogEntry[]
    issues?: Issue[]
}

export function ArtifactsModal({
    open,
    onOpenChange,
    artifacts,
    stepName,
    logs = [],
    issues = [],
}: ArtifactsModalProps) {
    // Extract TodoWrite and Bash tool uses from logs
    const { liveTodos, timeline } = useMemo(() => {
        const todoMap = new Map<string, TodoItem>()
        const bashCommandMap = new Map<string, BashCommand>()
        const timelineItems: TimelineItem[] = []

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
                } else if (
                    toolData.name === 'Bash' &&
                    (toolData.input?.cmd || toolData.input?.command)
                ) {
                    const bashCommand: BashCommand = {
                        id: toolData.id,
                        timestamp: toolData.timestamp || log.timestamp,
                        command: toolData.input.cmd || toolData.input.command,
                        output: toolData.output || undefined,
                    }
                    bashCommandMap.set(toolData.id, bashCommand)
                }
            } else if ((log as any).type === 'tool_use_updated' && (log as any).data) {
                const toolData = (log as any).data
                if (bashCommandMap.has(toolData.id)) {
                    const cmd = bashCommandMap.get(toolData.id)!
                    cmd.output = toolData.output
                }
            } else if (log.message && log.message.trim()) {
                timelineItems.push({
                    type: 'message',
                    timestamp: log.timestamp,
                    data: log,
                })
            }
        }

        for (const cmd of bashCommandMap.values()) {
            timelineItems.push({
                type: 'command',
                timestamp: cmd.timestamp,
                data: cmd,
            })
        }

        timelineItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        const liveTodos = Array.from(todoMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0))

        return { liveTodos, timeline: timelineItems }
    }, [logs])

    const [activeTab, setActiveTab] = useState<string>(() => {
        if (liveTodos.length > 0) return 'plan'
        if (timeline.length > 0) return 'commands'
        if (issues.length > 0) return 'issues'
        return 'plan'
    })

    const [showContextInTimeline, setShowContextInTimeline] = useState(true)

    const filteredTimeline = useMemo(() => {
        if (showContextInTimeline) return timeline
        return timeline.filter(item => item.type === 'command')
    }, [timeline, showContextInTimeline])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                    <DialogTitle>Summary</DialogTitle>
                    <DialogDescription>Execution details for "{stepName}"</DialogDescription>
                </DialogHeader>

                {artifacts.length === 0 && logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                        <p>No data available for this step</p>
                    </div>
                ) : (
                    <div className="flex flex-1 min-h-0">
                        {/* Sidebar */}
                        <div className="w-80 border-r bg-muted/30">
                            <ScrollArea className="h-full">
                                <div className="p-2 space-y-1">
                                    {liveTodos.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('plan')}
                                            className={cn(
                                                'w-full text-left p-3 rounded-lg transition-colors hover:bg-background',
                                                activeTab === 'plan' &&
                                                    'bg-background shadow-sm ring-1 ring-primary/20',
                                            )}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="mt-0.5">
                                                    <ListTodo className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0 relative z-10">
                                                    <p className="text-sm font-medium truncate">
                                                        Task Plan
                                                    </p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {liveTodos.length} items
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                    {timeline.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('commands')}
                                            className={cn(
                                                'w-full text-left p-3 rounded-lg transition-colors hover:bg-background',
                                                activeTab === 'commands' &&
                                                    'bg-background shadow-sm ring-1 ring-primary/20',
                                            )}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="mt-0.5">
                                                    <Code2 className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        Execution Timeline
                                                    </p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {timeline.length} entries
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                    {issues.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('issues')}
                                            className={cn(
                                                'w-full text-left p-3 rounded-lg transition-colors hover:bg-background',
                                                activeTab === 'issues' &&
                                                    'bg-background shadow-sm ring-1 ring-primary/20',
                                            )}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="mt-0.5">
                                                    <AlertCircle className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        Issues
                                                    </p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {issues.length} found
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Content Viewer */}
                        <div className="flex-1 min-w-0 flex flex-col">
                            {activeTab === 'plan' && <ArtifactsPlanTab todos={liveTodos} />}

                            {activeTab === 'commands' && (
                                <ArtifactsTimelineTab
                                    timeline={filteredTimeline}
                                    showContext={showContextInTimeline}
                                    onToggleContext={setShowContextInTimeline}
                                />
                            )}

                            {activeTab === 'issues' && issues.length > 0 && (
                                <ArtifactsIssuesTab issues={issues} />
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

// Re-export types for convenience
export type { Artifact, Issue } from './types'
