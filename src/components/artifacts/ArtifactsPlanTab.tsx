import { CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { TodoItem } from './types'

export interface ArtifactsPlanTabProps {
    todos: TodoItem[]
}

export function ArtifactsPlanTab({ todos }: ArtifactsPlanTabProps) {
    if (!todos.length) return null

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <div className="px-6 py-4 border-b flex-shrink-0 bg-white">
                <h3 className="font-semibold">Task Plan</h3>
                <p className="text-sm text-muted-foreground">Live task list with current status</p>
            </div>
            <ScrollArea className="flex-1 p-6 bg-white">
                <div className="space-y-2">
                    {todos.map(todo => (
                        <div
                            key={todo.id}
                            className={cn(
                                'flex items-start gap-3 p-3 rounded-lg border transition-all relative',
                                todo.status === 'in-progress' || todo.status === 'in_progress'
                                    ? 'bg-blue-50 border-blue-400 shadow-lg animate-pulse ring-2 ring-blue-300 ring-opacity-50'
                                    : todo.status === 'completed'
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-card hover:bg-accent/50',
                            )}
                        >
                            <div className="flex-shrink-0 mt-0.5 relative z-10">
                                {todo.status === 'completed' ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : todo.status === 'in-progress' || todo.status === 'in_progress' ? (
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
        </div>
    )
}
