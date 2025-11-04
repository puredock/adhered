/**
 * Format a date string as relative time (e.g., "2 hours ago", "Active now")
 */
export function formatTimeAgo(
    dateString: string | null,
    options?: { short?: boolean; nowText?: string },
): string {
    if (!dateString) return 'Never'

    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return options?.nowText || 'Active now'

    if (options?.short) {
        if (diffInMinutes < 60) return `${diffInMinutes}m`
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}h`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}d`
    }

    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
}
