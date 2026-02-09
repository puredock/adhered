import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IssueVerificationStatus } from "@/components/artifacts/types";
import { api } from "@/lib/api";
import { toBackendStatus } from "@/lib/issueStatus";

export interface ReviewIssueParams {
	issueId: string;
	status: IssueVerificationStatus;
	notes?: string;
	reviewer?: string;
}

export interface UseIssueReviewOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

/**
 * Hook for reviewing issues (confirm/dismiss/needs_info)
 * Handles API calls and cache invalidation
 */
export function useIssueReview(
	scanId: string,
	options?: UseIssueReviewOptions,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			issueId,
			status,
			notes,
			reviewer,
		}: ReviewIssueParams) => {
			const backendStatus = toBackendStatus(status);

			return api.issues.update(scanId, issueId, {
				status: backendStatus,
				comments: notes,
				reviewer: reviewer,
			});
		},
		onSuccess: () => {
			// Invalidate all scan-related queries to refresh the issues list
			// This will match any query key that starts with 'scans' (e.g., ['scans', deviceId])
			queryClient.invalidateQueries({
				predicate: (query) => {
					const key = query.queryKey[0];
					return key === "scans" || key === "scan";
				},
			});
			options?.onSuccess?.();
		},
		onError: (error: Error) => {
			console.error("Failed to update issue review:", error);
			options?.onError?.(error);
		},
	});
}
