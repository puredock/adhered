import { FileText, Image, BarChart3, Terminal, Download, X, CheckCircle2, XCircle, Info, ScrollText } from 'lucide-react'
import { useState } from 'react'
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

interface ArtifactsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    artifacts: Artifact[]
    stepName: string
    logs?: LogEntry[]
}

export function ArtifactsModal({ open, onOpenChange, artifacts, stepName, logs = [] }: ArtifactsModalProps) {
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
        artifacts.length > 0 ? artifacts[0] : null,
    )
    const [activeTab, setActiveTab] = useState<string>('all')

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
            <DialogContent className="max-w-5xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
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
                    <div className="flex h-[600px]">
                        {/* Sidebar */}
                        <div className="w-80 border-r bg-muted/30">
                            <Tabs 
                                defaultValue="all" 
                                value={activeTab}
                                onValueChange={(value) => {
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
                                            All ({artifacts.length + (logs.length > 0 ? 1 : 0)})
                                        </TabsTrigger>
                                        {logs.length > 0 && (
                                            <TabsTrigger value="logs" className="whitespace-nowrap">
                                                Logs ({logs.length})
                                            </TabsTrigger>
                                        )}
                                        {Object.keys(groupedArtifacts).map(type => (
                                            <TabsTrigger key={type} value={type} className="whitespace-nowrap">
                                                {type}s ({groupedArtifacts[type as Artifact['type']].length})
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <ScrollArea className="flex-1">
                                    <TabsContent value="all" className="m-0 p-2">
                                        <div className="space-y-1">
                                            {logs.length > 0 && (
                                                <button
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
                                                    key={artifact.id}
                                                    onClick={() => setSelectedArtifact(artifact)}
                                                    className={cn(
                                                        'w-full text-left p-3 rounded-lg transition-colors hover:bg-background',
                                                        selectedArtifact?.id === artifact.id &&
                                                            'bg-background shadow-sm ring-1 ring-primary/20',
                                                    )}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className="mt-0.5">{getTypeIcon(artifact.type)}</div>
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
                                                        key={artifact.id}
                                                        onClick={() => setSelectedArtifact(artifact)}
                                                        className={cn(
                                                            'w-full text-left p-3 rounded-lg transition-colors hover:bg-background',
                                                            selectedArtifact?.id === artifact.id &&
                                                                'bg-background shadow-sm ring-1 ring-primary/20',
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <div className="mt-0.5">{getTypeIcon(artifact.type)}</div>
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
                        <div className="flex-1 flex flex-col">
                            {selectedArtifact ? (
                                <>
                                    <div className="px-6 py-4 border-b flex items-center justify-between">
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
                            ) : logs.length > 0 ? (
                                <>
                                    <div className="px-6 py-4 border-b">
                                        <h3 className="font-semibold">Execution Logs</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Complete step execution timeline
                                        </p>
                                    </div>
                                    <ScrollArea className="flex-1 p-6">
                                        <div className="bg-slate-950 rounded-md p-4">
                                            <div className="font-mono text-xs space-y-1">
                                                {logs.map((log, index) => (
                                                    <div key={index} className="flex items-start gap-2 text-slate-200">
                                                        <span className="text-slate-500 min-w-[100px] text-[10px]">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </span>
                                                        {getLevelIcon(log.level)}
                                                        <span className="flex-1 break-words">{log.message}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </>
                            ) : null}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
