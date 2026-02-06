import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { IssueCard } from './issues/Card'
import { IssueDetailView } from './issues/Details'
import { severityBadgeStyles } from './issues/Ui'
import type { Issue, IssueVerificationStatus, RemediationSession, ReproductionSession } from './types'

export interface ArtifactsIssuesTabProps {
    issues: Issue[]
    onIssueUpdate?: (issueId: string, updates: Partial<Issue>) => void
    onStartReproduction?: (issueId: string, type: 'scriptreplay' | 'browser' | 'manual') => void
    onStartRemediation?: (issueId: string, type: 'automated' | 'manual') => void
}

export function ArtifactsIssuesTab({
    issues,
    onIssueUpdate,
    onStartReproduction,
    onStartRemediation,
}: ArtifactsIssuesTabProps) {
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
    const [isReproducing, setIsReproducing] = useState(false)
    const [isRemediating, setIsRemediating] = useState(false)

    const handleSelectIssue = (id: string) => {
        setSelectedIssueId(id)
    }

    const handleBack = () => {
        setSelectedIssueId(null)
    }

    const handleSaveNotes = (issueId: string, notes: string) => {
        onIssueUpdate?.(issueId, { reviewer_notes: notes })
    }

    const handleStatusChange = (issueId: string, status: IssueVerificationStatus, notes?: string) => {
        onIssueUpdate?.(issueId, {
            verification_status: status,
            reviewer_notes: notes,
            ...(status === 'confirmed' && {
                confirmed_at: new Date().toISOString(),
                confirmed_by: 'Current User',
            }),
        })
    }

    const handleStartReproduction = async (
        issueId: string,
        type: 'scriptreplay' | 'browser' | 'manual',
    ) => {
        setIsReproducing(true)

        onIssueUpdate?.(issueId, {
            verification_status: 'reproducing' as IssueVerificationStatus,
        })

        try {
            await onStartReproduction?.(issueId, type)

            const newSession: ReproductionSession = {
                id: `session-${Date.now()}`,
                timestamp: new Date().toISOString(),
                status: 'completed',
                type,
                notes: `Reproduction attempted using ${type}`,
            }

            const issue = issues.find(i => i.id === issueId)
            onIssueUpdate?.(issueId, {
                verification_status: 'pending' as IssueVerificationStatus,
                reproduction_sessions: [...(issue?.reproduction_sessions || []), newSession],
            })
        } catch (error) {
            console.error('Reproduction failed:', error)
            onIssueUpdate?.(issueId, {
                verification_status: 'pending' as IssueVerificationStatus,
            })
        } finally {
            setIsReproducing(false)
        }
    }

    const handleStartRemediation = async (issueId: string, type: 'automated' | 'manual') => {
        setIsRemediating(true)

        onIssueUpdate?.(issueId, {
            remediation_status: 'in_progress',
        })

        try {
            await onStartRemediation?.(issueId, type)

            const newSession: RemediationSession = {
                id: `remediation-${Date.now()}`,
                timestamp: new Date().toISOString(),
                status: 'completed',
                type,
                notes: `Remediation applied using ${type} method`,
            }

            const issue = issues.find(i => i.id === issueId)
            onIssueUpdate?.(issueId, {
                remediation_status: 'applied',
                remediation_sessions: [...(issue?.remediation_sessions || []), newSession],
                remediated_at: new Date().toISOString(),
                remediated_by: 'Current User',
            })
        } catch (error) {
            console.error('Remediation failed:', error)
            onIssueUpdate?.(issueId, {
                remediation_status: 'failed',
            })
        } finally {
            setIsRemediating(false)
        }
    }

    if (!issues.length) return null

    const normalizedIssues = issues.map((issue, index) => ({
        ...issue,
        id: issue.id || `issue-${index}`,
    }))

    const selectedIssue = selectedIssueId ? normalizedIssues.find(i => i.id === selectedIssueId) : null

    if (selectedIssue) {
        return (
            <IssueDetailView
                issue={selectedIssue}
                onBack={handleBack}
                onStatusChange={handleStatusChange}
                onSaveNotes={handleSaveNotes}
                onStartReproduction={handleStartReproduction}
                onStartRemediation={handleStartRemediation}
                isReproducing={isReproducing}
                isRemediating={isRemediating}
            />
        )
    }

    // Default: show list of issue cards
    return (
        <div className="flex flex-col h-full min-h-0 bg-background text-foreground">
            {/* Compact header — matches details panel header density */}
            <div className="flex-shrink-0 border-b border-border bg-gradient-subtle px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-base text-foreground">Issues</h3>
                        <Badge variant="secondary" className="text-xs font-mono px-2 py-0 h-5">
                            {normalizedIssues.length}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                            const count = normalizedIssues.filter(i => i.severity === sev).length
                            if (!count) return null
                            return (
                                <Badge
                                    key={sev}
                                    className={cn(
                                        'text-[10px] font-bold px-1.5 py-0 h-5',
                                        severityBadgeStyles[sev],
                                    )}
                                >
                                    {count} {sev.charAt(0).toUpperCase()}
                                </Badge>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Issues list */}
            <ScrollArea className="flex-1">
                <div className="px-6 py-4 pb-10 space-y-3">
                    {normalizedIssues.map(issue => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            onClick={() => handleSelectIssue(issue.id)}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
