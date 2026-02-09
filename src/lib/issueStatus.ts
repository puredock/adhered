import type { IssueVerificationStatus } from '@/components/artifacts/types'

/**
 * Backend issue status values (from IssueStatus enum)
 */
export type BackendIssueStatus =
    | 'pending_review'
    | 'confirmed'
    | 'patched'
    | 'dismissed'
    | 'needs_info'

/**
 * Map frontend verification status to backend status
 */
export const statusToBackend: Record<IssueVerificationStatus, BackendIssueStatus> = {
    pending: 'pending_review',
    confirmed: 'confirmed',
    dismissed: 'dismissed',
    needs_info: 'needs_info',
    reproducing: 'pending_review', // reproducing is a transient UI state, maps to pending
}

/**
 * Map backend status to frontend verification status
 */
export const statusToFrontend: Record<BackendIssueStatus, IssueVerificationStatus> = {
    pending_review: 'pending',
    confirmed: 'confirmed',
    dismissed: 'dismissed',
    needs_info: 'needs_info',
    patched: 'confirmed', // patched issues are considered confirmed
}

/**
 * Convert frontend status to backend format for API calls
 */
export function toBackendStatus(status: IssueVerificationStatus): BackendIssueStatus {
    return statusToBackend[status]
}

/**
 * Convert backend status to frontend format for display
 */
export function toFrontendStatus(status: string): IssueVerificationStatus {
    return statusToFrontend[status as BackendIssueStatus] ?? 'pending'
}
