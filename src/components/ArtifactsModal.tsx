import { CheckCircle2, Code2, Info, ListTodo, ScrollText, Terminal, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface Artifact {
    id: string
    name: string
    type: 'report' | 'image' | 'graph' | 'script'
    size: string
    timestamp: string
    content?: string
    url?: string
    language?: 'bash' | 'python' | 'javascript' | 'other'
}

interface LogEntry {
    timestamp: string
    level: 'info' | 'error' | 'success'
    message: string
}

interface TodoItem {
    id: string
    content: string
    status: 'todo' | 'in-progress' | 'in_progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    order?: number
}

interface BashCommand {
    id: string
    timestamp: string
    command: string
    output?: string
}

interface ArtifactsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    artifacts: Artifact[]
    stepName: string
    logs?: LogEntry[]
}

export function ArtifactsModal({
    open,
    onOpenChange,
    artifacts,
    stepName,
    logs = [],
}: ArtifactsModalProps) {
    // Extract TodoWrite and Bash tool uses from logs
    // Maintain a live, merged view of todos (not snapshots)
    const { liveTodos, bashCommands } = useMemo(() => {
        const todoMap = new Map<string, TodoItem>()
        const bashCommandMap = new Map<string, BashCommand>()

        console.log('[ARTIFACTS] Processing logs, total count:', logs.length)

        for (const log of logs) {
            // Debug: log all events with 'tool' in type
            if ((log as any).type?.includes('tool')) {
                console.log('[ARTIFACTS] Found tool-related event:', log)
            }

            // Check if this is a tool_use event (from new Redis pub/sub system)
            if ((log as any).type === 'tool_use' && (log as any).data) {
                console.log('[ARTIFACTS] Found tool_use event:', log)
                const toolData = (log as any).data

                if (toolData.name === 'TodoWrite' && toolData.input?.todos) {
                    // Merge todos into the live map (update existing or add new)
                    // Clear map to use latest ordering from most recent TodoWrite
                    todoMap.clear()

                    for (let i = 0; i < toolData.input.todos.length; i++) {
                        const todo = toolData.input.todos[i]
                        // Use content as the unique key since todos don't have IDs
                        const todoKey = todo.content || todo.activeForm || JSON.stringify(todo)
                        todoMap.set(todoKey, {
                            id: todoKey,
                            content: todo.content || todo.activeForm,
                            status: todo.status,
                            priority: todo.priority || 'medium',
                            order: i, // Preserve order from TodoWrite
                        })
                    }
                } else if (
                    toolData.name === 'Bash' &&
                    (toolData.input?.cmd || toolData.input?.command)
                ) {
                    bashCommandMap.set(toolData.id, {
                        id: toolData.id,
                        timestamp: toolData.timestamp || log.timestamp,
                        command: toolData.input.cmd || toolData.input.command,
                        output: toolData.output || undefined,
                    })
                }
            } else if ((log as any).type === 'tool_use_updated' && (log as any).data) {
                // Handle tool output updates
                console.log('[ARTIFACTS] Found tool_use_updated event:', log)
                const toolData = (log as any).data

                // Update the output for existing Bash command
                if (bashCommandMap.has(toolData.id)) {
                    const cmd = bashCommandMap.get(toolData.id)!
                    cmd.output = toolData.output
                }
            }
        }

        // Convert maps to arrays
        const liveTodos = Array.from(todoMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0))
        const bashCommands = Array.from(bashCommandMap.values())

        console.log('[ARTIFACTS] Extracted data:', {
            liveTodosCount: liveTodos.length,
            bashCommandsCount: bashCommands.length,
            liveTodos,
            bashCommands,
        })

        return { liveTodos, bashCommands }
    }, [logs])

    const [activeTab, setActiveTab] = useState<string>(() => {
        // Auto-select the first available view
        if (liveTodos.length > 0) return 'plan'
        if (bashCommands.length > 0) return 'commands'
        if (logs.length > 0) return 'logs'
        return 'plan'
    })

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
                                    {bashCommands.length > 0 && (
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
                                                        Shell Commands
                                                    </p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {bashCommands.length} commands
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                    {logs.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('logs')}
                                            className={cn(
                                                'w-full text-left p-3 rounded-lg transition-colors hover:bg-background',
                                                activeTab === 'logs' &&
                                                    'bg-background shadow-sm ring-1 ring-primary/20',
                                            )}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="mt-0.5">
                                                    <ScrollText className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        Execution Logs
                                                    </p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {logs.filter(log => log.message).length} entries
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Content Viewer */}
                        <div className="flex-1 flex flex-col min-w-0">
                            {activeTab === 'plan' && liveTodos.length > 0 ? (
                                <>
                                    <div className="px-6 py-4 border-b flex-shrink-0">
                                        <h3 className="font-semibold">Task Plan</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Live task list with current status
                                        </p>
                                    </div>
                                    <ScrollArea className="flex-1 p-6">
                                        <div className="space-y-2">
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
                                    </ScrollArea>
                                </>
                            ) : activeTab === 'commands' && bashCommands.length > 0 ? (
                                <>
                                    <div className="px-6 py-4 border-b flex-shrink-0">
                                        <h3 className="font-semibold">Shell Commands</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Commands executed and their outputs
                                        </p>
                                    </div>
                                    <ScrollArea className="flex-1 p-6">
                                        <div className="space-y-4">
                                            {bashCommands.map(cmd => (
                                                <div
                                                    key={cmd.id}
                                                    className="border rounded-lg overflow-hidden"
                                                >
                                                    <div className="bg-slate-950 p-3 border-b border-slate-800">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Terminal className="h-4 w-4 text-green-400" />
                                                            <span className="text-xs text-slate-400">
                                                                {new Date(
                                                                    cmd.timestamp,
                                                                ).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        <code className="text-sm text-slate-200 font-mono">
                                                            $ {cmd.command}
                                                        </code>
                                                    </div>
                                                    {cmd.output && (
                                                        <div className="bg-slate-900 p-3">
                                                            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                                                                {cmd.output}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </>
                            ) : activeTab === 'logs' && logs.length > 0 ? (
                                <>
                                    <div className="px-6 py-4 border-b flex-shrink-0">
                                        <h3 className="font-semibold">Execution Logs</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Complete step execution timeline
                                        </p>
                                    </div>
                                    <div className="flex-1 overflow-auto p-6">
                                        <div className="bg-slate-950 rounded-md p-4 overflow-x-auto">
                                            <div className="font-mono text-xs space-y-1">
                                                {logs
                                                    .filter(log => log.message) // Filter out empty messages (tool_use events)
                                                    .map((log, index) => (
                                                        <div
                                                            key={`${log.timestamp}-${index}`}
                                                            className="flex items-start gap-2 text-slate-200 whitespace-nowrap"
                                                        >
                                                            <span className="text-slate-500 min-w-[100px] text-[10px] flex-shrink-0">
                                                                {new Date(
                                                                    log.timestamp,
                                                                ).toLocaleTimeString()}
                                                            </span>
                                                            <span className="flex-shrink-0">
                                                                {getLevelIcon(log.level)}
                                                            </span>
                                                            <span className="text-slate-200">
                                                                {log.message}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
