import { useQuery } from '@tanstack/react-query'
import { FileText, Loader2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Badge } from '@/components/ui/badge'
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
            <DialogContent className="max-w-4xl">
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
                        <ScrollArea className="h-[520px] pr-4">
                            <div className="space-y-2">
                                {template.items.map(item => (
                                    <div key={item.id} className="border border-border p-3">
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {item.id}
                                            </span>
                                            <span className="font-medium">{item.title}</span>
                                            <Badge variant="outline">{item.source}</Badge>
                                            <Badge
                                                variant={
                                                    item.extraction_confidence < 0.75
                                                        ? 'destructive'
                                                        : 'secondary'
                                                }
                                            >
                                                {Math.round(item.extraction_confidence * 100)}%
                                                confidence
                                            </Badge>
                                            <Badge variant="outline">
                                                {item.response_type.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {item.requirement}
                                        </p>
                                        {item.provenance && (
                                            <p className="mt-2 border-l-2 border-primary/40 pl-2 text-xs text-muted-foreground">
                                                “{item.provenance.excerpt}”
                                            </p>
                                        )}
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
