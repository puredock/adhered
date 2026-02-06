import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IssueCard } from './issues/Card'
import { IssueDetailView } from './issues/Details'
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
        <div className="flex-1 min-h-0 flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b flex-shrink-0 bg-gradient-subtle">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">Security Issues</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    Detailed vulnerability findings and remediation guidance. Click on an issue to view
                    details.
                </p>
            </div>

            {/* Issues list */}
            <ScrollArea className="flex-1 p-6 bg-background">
                <div className="space-y-5">
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
