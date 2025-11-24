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

export interface Issue {
    id: string
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
    category?: string
    impact?: string
    reproduction_steps?: string[]
    remediation?: string
    affected_component?: string
    cvss_score?: number
    cve_id?: string
}

export interface LogEntry {
    timestamp: string
    level: 'info' | 'error' | 'success'
    message: string
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
