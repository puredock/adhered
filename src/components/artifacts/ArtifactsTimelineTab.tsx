import { CheckCircle2, Info, MessageSquare, Terminal, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { BashCommand, LogEntry, TimelineItem } from './types'

export interface ArtifactsTimelineTabProps {
    timeline: TimelineItem[]
    showContext: boolean
    onToggleContext: (value: boolean) => void
}

export function ArtifactsTimelineTab({
    timeline,
    showContext,
    onToggleContext,
}: ArtifactsTimelineTabProps) {
    if (!timeline.length) return null

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
        <div className="flex-1 min-h-0 flex flex-col">
            <div className="px-6 py-4 border-b flex-shrink-0 flex items-start justify-between bg-white">
                <div>
                    <h3 className="font-semibold">Execution Timeline</h3>
                    <p className="text-sm text-muted-foreground">
                        Commands and commentary in chronological order
                    </p>
                </div>
                <Button
                    variant={showContext ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onToggleContext(!showContext)}
                    className="flex-shrink-0"
                >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    {showContext ? 'Hide Context' : 'Show Context'}
                </Button>
            </div>
            <ScrollArea className="flex-1 p-6 bg-white">
                <div className="relative">
                    {timeline.length > 1 && (
                        <div className="absolute left-[30px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200" />
                    )}
                    <div className="relative space-y-6">
                        {timeline.map((item, index) => {
                            if (item.type === 'command') {
                                const cmd = item.data as BashCommand
                                return (
                                    <div key={cmd.id} className="relative pl-14">
                                        <div className="absolute left-[22px] top-3 w-4 h-4 rounded-full bg-blue-500 border-4 border-background shadow-md z-10" />
                                        <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <div className="bg-slate-950 p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Terminal className="h-4 w-4 text-green-400" />
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        {new Date(cmd.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <code className="text-sm text-slate-100 font-mono block">
                                                    <span className="text-green-400">$</span>{' '}
                                                    {cmd.command}
                                                </code>
                                            </div>
                                            {cmd.output && (
                                                <div className="bg-slate-900 p-4 border-t border-slate-800">
                                                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                                                        {cmd.output}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            } else {
                                const log = item.data as LogEntry
                                return (
                                    <div key={`${log.timestamp}-${index}`} className="relative pl-14">
                                        <div className="absolute left-[24px] top-2 w-3 h-3 rounded-full bg-blue-300 border-2 border-background z-10" />
                                        <div className="bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-400 p-4 rounded-r-lg">
                                            <div className="flex items-start gap-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-slate-500 text-[11px] font-mono flex-shrink-0">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </span>
                                                    <span className="flex-shrink-0">
                                                        {getLevelIcon(log.level)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                                                {log.message}
                                            </p>
                                        </div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
