import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IssueCard } from './IssueCard'
import type { Issue } from './types'

export interface ArtifactsIssuesTabProps {
    issues: Issue[]
}

export function ArtifactsIssuesTab({ issues }: ArtifactsIssuesTabProps) {
    const [expandedId, setExpandedId] = useState<string | null>(issues[0]?.id ?? null)

    const handleToggle = (id: string) => {
        setExpandedId(current => (current === id ? null : id))
    }

    if (!issues.length) return null

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b flex-shrink-0 bg-gradient-to-r from-slate-50 via-white to-slate-50">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">Security Issues</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    Detailed vulnerability findings and remediation guidance
                </p>
            </div>

            {/* Issues list */}
            <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-slate-50/30 to-transparent">
                <div className="space-y-5">
                    {issues.map((issue, index) => (
                        <IssueCard
                            key={issue.id || `issue-${index}`}
                            issue={issue}
                            expanded={issue.id === expandedId}
                            onToggle={() => handleToggle(issue.id)}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
