import { useQuery } from '@tanstack/react-query'
import { FileStack, Loader2, Plus, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { TemplateUploadDialog } from '@/components/TemplateUploadDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/lib/api'

export function AssessmentStartDialog({
    isStarting,
    onStart,
}: {
    isStarting: boolean
    onStart: (templateIds: string[]) => Promise<void>
}) {
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<string[]>([])
    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['risk-assessment-templates'],
        queryFn: api.riskAssessments.templates,
    })
    const active = templates.filter(template => template.status === 'active')

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start hover:bg-secondary">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Risk Assessment
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Start risk assessment</DialogTitle>
                    <DialogDescription>
                        Select one or more reusable templates. Their checklists will be combined into a
                        source-linked snapshot for this assessment.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Saved templates</p>
                    <TemplateUploadDialog
                        trigger={
                            <Button size="sm" variant="outline">
                                <Plus className="mr-2 h-4 w-4" /> Upload documents
                            </Button>
                        }
                        onImported={template => setSelected(value => [...value, template.id])}
                    />
                </div>
                <ScrollArea className="max-h-[360px]">
                    <div className="space-y-2 pr-3">
                        {isLoading ? (
                            <Loader2 className="m-6 h-5 w-5 animate-spin text-primary" />
                        ) : active.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 border border-dashed p-10 text-center">
                                <FileStack className="h-8 w-8 text-muted-foreground" />
                                <p className="font-medium">No saved templates</p>
                                <p className="text-sm text-muted-foreground">
                                    Upload your first checklist documents to continue.
                                </p>
                            </div>
                        ) : (
                            active.map(template => {
                                const checked = selected.includes(template.id)
                                return (
                                    <label
                                        key={template.id}
                                        className="flex cursor-pointer items-start gap-3 border border-border p-3 hover:bg-muted/40"
                                    >
                                        <Checkbox
                                            className="mt-0.5"
                                            checked={checked}
                                            onCheckedChange={value =>
                                                setSelected(current =>
                                                    value
                                                        ? [...current, template.id]
                                                        : current.filter(id => id !== template.id),
                                                )
                                            }
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{template.name}</span>
                                                <Badge variant="outline">v{template.version}</Badge>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {template.document_count} documents ·{' '}
                                                {template.item_count} checklist items
                                            </p>
                                        </div>
                                    </label>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter className="items-center sm:justify-between">
                    <span className="text-sm text-muted-foreground">
                        {selected.length} template{selected.length === 1 ? '' : 's'} selected
                    </span>
                    <Button
                        disabled={selected.length === 0 || isStarting}
                        onClick={async () => {
                            await onStart(selected)
                            setOpen(false)
                        }}
                    >
                        {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Start assessment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
