import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIssueReview } from "@/hooks/useIssueReview";
import { IssueCard } from "./issues/Card";
import { IssueDetailView, type SectionUpdate } from "./issues/Details";
import type {
	Issue,
	IssueVerificationStatus,
	RemediationSession,
	ReproductionSession,
	ReviewHistoryEntry,
} from "./types";

export interface ArtifactsIssuesTabProps {
	issues: Issue[];
	scanId?: string;
	onIssueUpdate?: (issueId: string, updates: Partial<Issue>) => void;
	onStartReproduction?: (
		issueId: string,
		type: "scriptreplay" | "browser" | "manual",
	) => void;
	onStartRemediation?: (issueId: string, type: "automated" | "manual") => void;
}

export function ArtifactsIssuesTab({
	issues: issuesProp,
	scanId,
	onIssueUpdate,
	onStartReproduction,
	onStartRemediation,
}: ArtifactsIssuesTabProps) {
	// Local state for issues - allows optimistic updates
	const [localIssues, setLocalIssues] = useState<Issue[]>(issuesProp);
	const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
	const [isReproducing, setIsReproducing] = useState(false);
	const [isRemediating, setIsRemediating] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [severityFilter, setSeverityFilter] = useState<string>("all");
	const { toast } = useToast();

	// Sync local state when prop changes (e.g., from parent refetch)
	useEffect(() => {
		setLocalIssues(issuesProp);
	}, [issuesProp]);

	// Helper to update a specific issue in local state
	const updateLocalIssue = (issueId: string, updates: Partial<Issue>) => {
		setLocalIssues((prev) =>
			prev.map((issue) =>
				issue.id === issueId ? { ...issue, ...updates } : issue,
			),
		);
	};

	// Issue review mutation hook
	const reviewMutation = useIssueReview(scanId || "", {
		onSuccess: () => {
			toast({
				title: "Review saved",
				description: "Issue status has been updated.",
			});
		},
		onError: (error) => {
			toast({
				title: "Failed to save review",
				description: error.message || "Please try again.",
				variant: "destructive",
			});
		},
	});

	const handleSelectIssue = (id: string) => {
		setSelectedIssueId(id);
	};

	const handleBack = () => {
		setSelectedIssueId(null);
	};

	const handleSaveNotes = (issueId: string, notes: string) => {
		// Create a new history entry for the note
		const issue = localIssues.find((i) => i.id === issueId);
		const newHistoryEntry: ReviewHistoryEntry = {
			id: `note-${Date.now()}`,
			timestamp: new Date().toISOString(),
			type: "note",
			note: notes,
			reviewer: "Current User",
		};

		const updates: Partial<Issue> = {
			reviewer_notes: notes,
			review_history: [...(issue?.review_history || []), newHistoryEntry],
		};

		updateLocalIssue(issueId, updates);
		onIssueUpdate?.(issueId, updates);

		// Persist to backend
		if (scanId) {
			reviewMutation.mutate({
				issueId,
				status: issue?.verification_status || "pending",
				notes,
				reviewer: "Current User",
			});
		}
	};

	const handleStatusChange = (
		issueId: string,
		status: IssueVerificationStatus,
		notes?: string,
	) => {
		const issue = localIssues.find((i) => i.id === issueId);
		const previousStatus = issue?.verification_status || "pending";

		// Create a new history entry for the status change
		const newHistoryEntry: ReviewHistoryEntry = {
			id: `status-${Date.now()}`,
			timestamp: new Date().toISOString(),
			type: "status_change",
			status: status,
			previous_status: previousStatus,
			reviewer: "Current User",
		};

		// Optimistic update for immediate UI feedback
		const updates: Partial<Issue> = {
			verification_status: status,
			review_history: [...(issue?.review_history || []), newHistoryEntry],
			...(status === "confirmed" && {
				confirmed_at: new Date().toISOString(),
				confirmed_by: "Current User",
			}),
		};

		// Update local state immediately
		updateLocalIssue(issueId, updates);

		// Notify parent if callback provided
		onIssueUpdate?.(issueId, updates);

		// Persist to backend if scanId is available
		if (scanId) {
			reviewMutation.mutate({
				issueId,
				status,
				notes,
				reviewer: "Current User", // TODO: Get from auth context
			});
		}
	};

	const handleStartReproduction = async (
		issueId: string,
		type: "scriptreplay" | "browser" | "manual",
	) => {
		setIsReproducing(true);

		updateLocalIssue(issueId, {
			verification_status: "reproducing" as IssueVerificationStatus,
		});

		try {
			await onStartReproduction?.(issueId, type);

			const newSession: ReproductionSession = {
				id: `session-${Date.now()}`,
				timestamp: new Date().toISOString(),
				status: "completed",
				type,
				notes: `Reproduction attempted using ${type}`,
			};

			const issue = localIssues.find((i) => i.id === issueId);
			updateLocalIssue(issueId, {
				verification_status: "pending" as IssueVerificationStatus,
				reproduction_sessions: [
					...(issue?.reproduction_sessions || []),
					newSession,
				],
			});
		} catch (error) {
			console.error("Reproduction failed:", error);
			updateLocalIssue(issueId, {
				verification_status: "pending" as IssueVerificationStatus,
			});
		} finally {
			setIsReproducing(false);
		}
	};

	const handleStartRemediation = async (
		issueId: string,
		type: "automated" | "manual",
	) => {
		setIsRemediating(true);

		updateLocalIssue(issueId, {
			remediation_status: "in_progress",
		});

		try {
			await onStartRemediation?.(issueId, type);

			const newSession: RemediationSession = {
				id: `remediation-${Date.now()}`,
				timestamp: new Date().toISOString(),
				status: "completed",
				type,
				notes: `Remediation applied using ${type} method`,
			};

			const issue = localIssues.find((i) => i.id === issueId);
			updateLocalIssue(issueId, {
				remediation_status: "applied",
				remediation_sessions: [
					...(issue?.remediation_sessions || []),
					newSession,
				],
				remediated_at: new Date().toISOString(),
				remediated_by: "Current User",
			});
		} catch (error) {
			console.error("Remediation failed:", error);
			updateLocalIssue(issueId, {
				remediation_status: "failed",
			});
		} finally {
			setIsRemediating(false);
		}
	};

	const handleSaveSection = (issueId: string, updates: SectionUpdate) => {
		// Update local state immediately (optimistic update)
		updateLocalIssue(issueId, updates);

		// Notify parent if callback provided
		onIssueUpdate?.(issueId, updates);

		// Show success toast
		toast({
			title: "Changes saved",
			description: "The section has been updated.",
		});

		// TODO: Persist to backend when API endpoint is available
		// if (scanId) {
		//   updateIssueMutation.mutate({ issueId, ...updates });
		// }
	};

	const normalizedIssues = useMemo(
		() =>
			localIssues.map((issue, index) => ({
				...issue,
				id: issue.id || `issue-${index}`,
			})),
		[localIssues],
	);

	const filteredIssues = useMemo(() => {
		return normalizedIssues.filter((issue) => {
			const matchesSearch =
				searchQuery === "" ||
				issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				issue.id?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesSeverity =
				severityFilter === "all" || issue.severity === severityFilter;
			return matchesSearch && matchesSeverity;
		});
	}, [normalizedIssues, searchQuery, severityFilter]);

	const selectedIssue = selectedIssueId
		? normalizedIssues.find((i) => i.id === selectedIssueId)
		: null;

	if (!localIssues.length) return null;

	if (selectedIssue) {
		return (
			<IssueDetailView
				issue={selectedIssue}
				onBack={handleBack}
				onStatusChange={handleStatusChange}
				onSaveNotes={handleSaveNotes}
				onStartReproduction={handleStartReproduction}
				onStartRemediation={handleStartRemediation}
				onSaveSection={handleSaveSection}
				isReproducing={isReproducing}
				isRemediating={isRemediating}
				isReviewPending={reviewMutation.isPending}
			/>
		);
	}

	// Default: show list of issue cards
	return (
		<div className="flex flex-col h-full min-h-0 bg-background text-foreground">
			{/* Compact header — matches details panel header density */}
			<div className="flex-shrink-0 border-b border-border bg-gradient-subtle px-6 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<h3 className="font-bold text-base text-foreground">Issues</h3>
						<Badge
							variant="secondary"
							className="text-xs font-mono px-2 py-0 h-5"
						>
							{filteredIssues.length}
						</Badge>
					</div>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Search..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="h-7 w-36 pl-7 pr-2 text-xs"
							/>
						</div>
						<Select value={severityFilter} onValueChange={setSeverityFilter}>
							<SelectTrigger className="h-7 w-24 text-xs">
								<SelectValue placeholder="Severity" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="critical">Critical</SelectItem>
								<SelectItem value="high">High</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="low">Low</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Issues list */}
			<ScrollArea className="flex-1">
				<div className="px-6 py-4 pb-10 space-y-3">
					{filteredIssues.map((issue) => (
						<IssueCard
							key={issue.id}
							issue={issue}
							onClick={() => handleSelectIssue(issue.id)}
						/>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
