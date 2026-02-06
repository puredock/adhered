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

export type IssueVerificationStatus =
    | 'pending'
    | 'confirmed'
    | 'dismissed'
    | 'needs_info'
    | 'reproducing'

export type RemediationStatus = 'not_started' | 'in_progress' | 'applied' | 'failed' | 'verified'

export interface ReproductionSession {
    id: string
    timestamp: string
    status: 'running' | 'completed' | 'failed'
    type: 'scriptreplay' | 'browser' | 'manual'
    artifacts?: {
        screenshots?: string[]
        recording?: string
        logs?: string
    }
    notes?: string
}

export interface RemediationSession {
    id: string
    timestamp: string
    status: 'running' | 'completed' | 'failed'
    type: 'automated' | 'manual'
    artifacts?: {
        screenshots?: string[]
        recording?: string
        logs?: string
        patch_file?: string
    }
    notes?: string
    changes_made?: string[]
}

export interface Issue {
    id: string
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
    category?: string
    impact?: string
    reproduction_steps?: string[]
    remediation?: string
    remediation_steps?: string[]
    affected_component?: string
    cvss_score?: number
    cve_id?: string
    verification_status?: IssueVerificationStatus
    remediation_status?: RemediationStatus
    reproduction_sessions?: ReproductionSession[]
    remediation_sessions?: RemediationSession[]
    reviewer_notes?: string
    confirmed_at?: string
    confirmed_by?: string
    remediated_at?: string
    remediated_by?: string
}

export interface LogEntry {
    timestamp: string
    level: 'info' | 'error' | 'success'
    message?: string
    type?: 'tool_use' | 'tool_use_updated'
    data?: ToolUseData
}

export interface ToolUseData {
    id: string
    name: string
    timestamp?: string
    input?: {
        todos?: Array<{
            content?: string
            activeForm?: string
            status: string
            priority?: string
        }>
        cmd?: string
        command?: string
    }
    output?: string
}

export interface TodoItem {
    id: string
    content: string
    status: 'todo' | 'in-progress' | 'in_progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    order?: number
}

export interface BashCommand {
    id: string
    timestamp: string
    command: string
    output?: string
}

export interface TimelineItem {
    type: 'command' | 'message'
    timestamp: string
    data: BashCommand | LogEntry
}
