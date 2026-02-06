import { Camera } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RemediationSession, ReproductionSession } from '../types'
import { formatIssueDate } from './Ui'

interface SessionRowProps {
    session: ReproductionSession | RemediationSession
}

export function SessionRow({ session }: SessionRowProps) {
    return (
        <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={cn(
                            'text-xs',
                            session.status === 'completed' &&
                                'bg-success/15 text-success border-success/25',
                            session.status === 'failed' &&
                                'bg-destructive/15 text-destructive border-destructive/25',
                            session.status === 'running' && 'bg-info/15 text-info border-info/25',
                        )}
                    >
                        {session.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        {session.type}
                    </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                    {formatIssueDate(session.timestamp)}
                </span>
            </div>
            {session.notes && <p className="text-sm text-foreground/70">{session.notes}</p>}
            {session.artifacts?.screenshots && session.artifacts.screenshots.length > 0 && (
                <div className="flex gap-2 mt-1">
                    {session.artifacts.screenshots.map((url, idx) => (
                        <a
                            key={`${session.id}-screenshot-${url}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            <Camera className="h-3 w-3" />
                            Screenshot {idx + 1}
                        </a>
                    ))}
                </div>
            )}
            {'changes_made' in session && session.changes_made && session.changes_made.length > 0 && (
                <ul className="text-sm text-foreground/70 list-disc list-inside">
                    {session.changes_made.map((change, idx) => (
                        <li key={`${session.id}-change-${idx}`}>{change}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}
