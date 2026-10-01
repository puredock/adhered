import { useQuery } from '@tanstack/react-query'
import { FileText, Info, Loader2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/lib/api'

export function TemplatePreviewDialog({
    templateId,
    trigger,
}: {
    templateId: string
    trigger: ReactNode
}) {
    const [open, setOpen] = useState(false)
    const { data: template, isLoading } = useQuery({
        queryKey: ['risk-assessment-template', templateId],
        queryFn: () => api.riskAssessments.template(templateId),
        enabled: open,
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>{template?.name || 'Template preview'}</DialogTitle>
                    <DialogDescription>
                        Review the extracted controls and their source documents before use.
                    </DialogDescription>
                </DialogHeader>
                {isLoading || !template ? (
                    <Loader2 className="m-10 h-6 w-6 animate-spin text-primary" />
                ) : (
                    <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Source documents
                            </p>
                            {template.documents.map(document => (
                                <div
                                    key={document.sha256}
                                    className="flex items-start gap-2 border border-border p-2 text-sm"
                                >
                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <span className="break-all">{document.name}</span>
                                </div>
                            ))}
                        </div>
                        <ScrollArea className="h-[560px] pr-4">
                            <div className="space-y-2">
                                {template.items.map(item => (
                                    <div key={item.id} className="space-y-2 border border-border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="font-medium">{item.title}</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {item.requirement}
                                                </p>
                                            </div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        aria-label={`View extraction confidence and source excerpt: ${Math.round(item.extraction_confidence * 100)} percent`}
                                                        title="Confidence and source details"
                                                        className="group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    >
                                                        <svg
                                                            aria-hidden="true"
                                                            className="absolute inset-0 -rotate-90"
                                                            viewBox="0 0 32 32"
                                                        >
                                                            <circle
                                                                cx="16"
                                                                cy="16"
                                                                r="13"
                                                                fill="none"
                                                                className="stroke-muted"
                                                                strokeWidth="2.5"
                                                            />
                                                            <circle
                                                                cx="16"
                                                                cy="16"
                                                                r="13"
                                                                fill="none"
                                                                strokeWidth="2.5"
                                                                strokeLinecap="round"
                                                                strokeDasharray={`${Math.max(0, Math.min(1, item.extraction_confidence)) * 81.68} 81.68`}
                                                                style={{
                                                                    stroke: `hsl(${Math.round(Math.max(0, Math.min(1, item.extraction_confidence)) * 120)} 65% 42%)`,
                                                                }}
                                                            />
                                                        </svg>
                                                        <Info className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent align="end" className="w-80 space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-sm font-medium">Extraction confidence</p>
                                                        <span className={`text-sm font-semibold tabular-nums ${item.extraction_confidence < 0.75 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                                            {Math.round(item.extraction_confidence * 100)}%
                                                        </span>
                                                    </div>
                                                    {item.extraction_confidence < 0.75 && (
                                                        <p className="text-xs text-amber-700">
                                                            Review this extracted control before use.
                                                        </p>
                                                    )}
                                                    <div className="border-t pt-2">
                                                        <p className="mb-1 text-xs font-medium text-muted-foreground">Source excerpt</p>
                                                        {item.provenance ? (
                                                            <p className="text-sm text-muted-foreground">
                                                                “{item.provenance.excerpt}”
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">No source excerpt available.</p>
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span className="inline-flex min-w-0 items-center gap-1.5">
                                                <FileText className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{item.source}</span>
                                            </span>
                                            {item.response_type !== 'text' && (
                                                <span className="capitalize">
                                                    Response: {item.response_type.replace('_', ' ')}
                                                </span>
                                            )}
                                            <span className="font-mono">{item.id}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
