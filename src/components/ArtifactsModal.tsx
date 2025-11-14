import {
    BarChart3,
    CheckCircle2,
    Code2,
    Download,
    FileText,
    Image,
    Info,
    ListTodo,
    ScrollText,
    Terminal,
    XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
        artifacts.length > 0 ? artifacts[0] : null,
    )

    const [activeTab, setActiveTab] = useState<string>(() => {
        // Auto-select the first available view when there are no artifacts
        if (artifacts.length > 0) return 'all'
        // If no artifacts, check what's available and auto-select
        if (logs.length > 0) return 'logs'
        return 'all'
    })

    // Extract TodoWrite and Bash tool uses from logs
    // Maintain a live, merged view of todos (not snapshots)
    const { liveTodos, bashCommands } = useMemo(() => {
        const todoMap = new Map<string, TodoItem>()
        const bashCommands: BashCommand[] = []

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
                } else if (toolData.name === 'Bash' && toolData.input?.cmd) {
                    bashCommands.push({
                        id: toolData.id,
                        timestamp: toolData.timestamp || log.timestamp,
                        command: toolData.input.cmd,
                        output: toolData.output || undefined,
                    })
                }
            }
        }

        // Convert map to array, sorted by order from most recent TodoWrite
        const liveTodos = Array.from(todoMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0))

        console.log('[ARTIFACTS] Extracted data:', {
            liveTodosCount: liveTodos.length,
            bashCommandsCount: bashCommands.length,
            liveTodos,
            bashCommands,
        })

        return { liveTodos, bashCommands }
    }, [logs])

    const getTypeIcon = (type: Artifact['type']) => {
        switch (type) {
            case 'report':
                return <FileText className="h-4 w-4" />
            case 'image':
                return <Image className="h-4 w-4" />
            case 'graph':
                return <BarChart3 className="h-4 w-4" />
            case 'script':
                return <Terminal className="h-4 w-4" />
        }
    }

    const getTypeColor = (type: Artifact['type']) => {
        switch (type) {
            case 'report':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'image':
                return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'graph':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'script':
                return 'bg-orange-100 text-orange-700 border-orange-200'
        }
    }

    const renderArtifactContent = (artifact: Artifact) => {
        switch (artifact.type) {
            case 'image':
                return (
                    <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
                        <img
                            src={artifact.url || '/placeholder.svg'}
                            alt={artifact.name}
                            className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
                        />
                    </div>
                )
            case 'script':
                return (
                    <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                            <Badge variant="secondary" className="font-mono text-xs">
                                {artifact.language || 'script'}
                            </Badge>
                        </div>
                        <ScrollArea className="h-[500px] w-full rounded-lg border bg-slate-950">
                            <pre className="p-4 text-sm font-mono text-slate-200">
                                <code>{artifact.content || '# Script content would appear here'}</code>
                            </pre>
                        </ScrollArea>
                    </div>
                )
            case 'report':
                return (
                    <ScrollArea className="h-[500px] w-full rounded-lg border bg-background">
                        <div className="p-6 prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-sm">
                                {artifact.content || 'Report content would appear here...'}
                            </div>
                        </div>
                    </ScrollArea>
                )
            case 'graph':
                return (
                    <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
                        <div className="text-center text-muted-foreground">
                            <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                            <p>Graph visualization would appear here</p>
                        </div>
                    </div>
                )
        }
    }

    const groupedArtifacts = artifacts.reduce(
        (acc, artifact) => {
            if (!acc[artifact.type]) {
                acc[artifact.type] = []
            }
            acc[artifact.type].push(artifact)
            return acc
        },
        {} as Record<Artifact['type'], Artifact[]>,
    )

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
                    <DialogTitle>Artifacts - {stepName}</DialogTitle>
                    <DialogDescription>
                        View reports, images, graphs, and exploit scripts generated during this step
                    </DialogDescription>
                </DialogHeader>

                {artifacts.length === 0 && logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mb-4" />
                        <p>No artifacts available for this step</p>
                    </div>
                ) : (
                    <div className="flex flex-1 min-h-0">
                        {/* Sidebar */}
                        <div className="w-80 border-r bg-muted/30">
                            <Tabs
                                defaultValue="all"
                                value={activeTab}
                                onValueChange={value => {
                                    setActiveTab(value)
                                    if (value === 'logs') {
                                        setSelectedArtifact(null)
                                    }
                                }}
                                className="h-full flex flex-col"
                            >
                                <div className="overflow-x-auto border-b">
                                    <TabsList className="w-full justify-start rounded-none px-4 pt-2 h-auto">
                                        <TabsTrigger value="all" className="whitespace-nowrap">
                                            All (
                                            {artifacts.length +
                                                (logs.length > 0 ? 1 : 0) +
                                                (liveTodos.length > 0 ? 1 : 0) +
                                                (bashCommands.length > 0 ? 1 : 0)}
                                            )
                                        </TabsTrigger>
                                        {liveTodos.length > 0 && (
                                            <TabsTrigger value="plan" className="whitespace-nowrap">
                                                Plan
                                            </TabsTrigger>
                                        )}
                                        {bashCommands.length > 0 && (
                                            <TabsTrigger value="commands" className="whitespace-nowrap">
                                                Commands ({bashCommands.length})
                                            </TabsTrigger>
                                        )}
                                        {logs.length > 0 && (
                                            <TabsTrigger value="logs" className="whitespace-nowrap">
                                                Logs ({logs.length})
                                            </TabsTrigger>
                                        )}
                                        {Object.keys(groupedArtifacts).map(type => (
                                            <TabsTrigger
                                                key={type}
                                                value={type}
                                                className="whitespace-nowrap"
                                            >
                                                {type}s (
                                                {groupedArtifacts[type as Artifact['type']].length})
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <ScrollArea className="flex-1">
                                    <TabsContent value="all" className="m-0 p-2">
                                        <div className="space-y-1">
                                            {liveTodos.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveTab('plan')
                                                        setSelectedArtifact(null)
                                                    }}
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
                                                    onClick={() => {
                                                        setActiveTab('commands')
                                                        setSelectedArtifact(null)
                                                    }}
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
                                                    onClick={() => {
                                                        setActiveTab('logs')
                                                        setSelectedArtifact(null)
                                                    }}
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
                                                                {logs.length} entries
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            )}
                                            {artifacts.map(artifact => (
                                                <button
                                                    type="button"
                                                    key={artifact.id}
                                                    onClick={() => setSelectedArtifact(artifact)}
                                                    className={cn(
                                                        'w-full text-left p-3 rounded-lg transition-colors hover:bg-background',
                                                        selectedArtifact?.id === artifact.id &&
                                                            'bg-background shadow-sm ring-1 ring-primary/20',
                                                    )}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className="mt-0.5">
                                                            {getTypeIcon(artifact.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {artifact.name}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'text-xs',
                                                                        getTypeColor(artifact.type),
                                                                    )}
                                                                >
                                                                    {artifact.type}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {artifact.size}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    {liveTodos.length > 0 && (
                                        <TabsContent value="plan" className="m-0 p-2">
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
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            Task Plan
                                                        </p>
                                                        <span className="text-xs text-muted-foreground">
                                                            {liveTodos.length} items
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        </TabsContent>
                                    )}

                                    {bashCommands.length > 0 && (
                                        <TabsContent value="commands" className="m-0 p-2">
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
                                        </TabsContent>
                                    )}

                                    {logs.length > 0 && (
                                        <TabsContent value="logs" className="m-0 p-2">
                                            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                                                <ScrollText className="h-4 w-4" />
                                                <span>Step execution logs</span>
                                            </div>
                                        </TabsContent>
                                    )}

                                    {Object.entries(groupedArtifacts).map(([type, items]) => (
                                        <TabsContent key={type} value={type} className="m-0 p-2">
                                            <div className="space-y-1">
                                                {items.map(artifact => (
                                                    <button
                                                        type="button"
                                                        key={artifact.id}
                                                        onClick={() => setSelectedArtifact(artifact)}
                                                        className={cn(
                                                            'w-full text-left p-3 rounded-lg transition-colors hover:bg-background',
                                                            selectedArtifact?.id === artifact.id &&
                                                                'bg-background shadow-sm ring-1 ring-primary/20',
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <div className="mt-0.5">
                                                                {getTypeIcon(artifact.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">
                                                                    {artifact.name}
                                                                </p>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {artifact.size}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </TabsContent>
                                    ))}
                                </ScrollArea>
                            </Tabs>
                        </div>

                        {/* Content Viewer */}
                        <div className="flex-1 flex flex-col min-w-0">
                            {selectedArtifact ? (
                                <>
                                    <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
                                        <div>
                                            <h3 className="font-semibold">{selectedArtifact.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedArtifact.timestamp} • {selectedArtifact.size}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                    <ScrollArea className="flex-1 p-6">
                                        {renderArtifactContent(selectedArtifact)}
                                    </ScrollArea>
                                </>
                            ) : (activeTab === 'plan' ||
                                  (activeTab === 'all' && !selectedArtifact && liveTodos.length > 0)) &&
                              liveTodos.length > 0 ? (
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
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    'text-xs',
                                                                    todo.status === 'completed' &&
                                                                        'bg-green-100 text-green-700 border-green-200',
                                                                    (todo.status === 'in-progress' ||
                                                                        todo.status === 'in_progress') &&
                                                                        'bg-blue-100 text-blue-700 border-blue-200',
                                                                    todo.status === 'todo' &&
                                                                        'bg-gray-100 text-gray-700 border-gray-200',
                                                                )}
                                                            >
                                                                {todo.status}
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    'text-xs',
                                                                    todo.priority === 'high' &&
                                                                        'bg-red-100 text-red-700 border-red-200',
                                                                    todo.priority === 'medium' &&
                                                                        'bg-yellow-100 text-yellow-700 border-yellow-200',
                                                                    todo.priority === 'low' &&
                                                                        'bg-slate-100 text-slate-700 border-slate-200',
                                                                )}
                                                            >
                                                                {todo.priority}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </>
                            ) : (activeTab === 'commands' ||
                                  (activeTab === 'all' &&
                                      !selectedArtifact &&
                                      bashCommands.length > 0 &&
                                      liveTodos.length === 0)) &&
                              bashCommands.length > 0 ? (
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
                            ) : (activeTab === 'logs' ||
                                  (activeTab === 'all' &&
                                      !selectedArtifact &&
                                      logs.length > 0 &&
                                      liveTodos.length === 0 &&
                                      bashCommands.length === 0)) &&
                              logs.length > 0 ? (
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
                                                {logs.map(log => (
                                                    <div
                                                        key={`${log.timestamp}-${log.message.slice(0, 20)}`}
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
