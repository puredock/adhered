import { useQuery } from '@tanstack/react-query'
import { FileStack, FileText, Loader2, Paperclip, Plus, Radar, ShieldCheck, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { TemplateUploadDialog } from '@/components/TemplateUploadDialog'
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
import { Switch } from '@/components/ui/switch'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

type AssessmentSourceMode = 'live' | 'manual' | 'disclosure_only' | 'disclosure_and_live'

export function AssessmentStartDialog({
    isStarting,
    onStart,
}: {
    isStarting: boolean
    onStart: (
        templateIds: string[],
        sourceMode: AssessmentSourceMode,
        disclosure?: File,
    ) => Promise<void>
}) {
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<string[]>([])
    const [disclosure, setDisclosure] = useState<File>()
    const disclosureInput = useRef<HTMLInputElement>(null)
    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['risk-assessment-templates'],
        queryFn: api.riskAssessments.templates,
    })
    const active = templates.filter(template => template.status === 'active')

    const [live, setLive] = useState(true)
    const sourceMode: AssessmentSourceMode = disclosure
        ? live
            ? 'disclosure_and_live'
            : 'disclosure_only'
        : live
          ? 'live'
          : 'manual'
    const clearDisclosure = () => {
        setDisclosure(undefined)
        if (disclosureInput.current) disclosureInput.current.value = ''
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start hover:bg-secondary">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Risk Assessment
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-xl gap-6 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Start risk assessment</DialogTitle>
                    <DialogDescription>
                        Pick the checklists to assess against and where answers come from.
                    </DialogDescription>
                </DialogHeader>

                <section className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Templates</h3>
                        <TemplateUploadDialog
                            trigger={
                                <Button size="sm" variant="ghost" className="h-8 text-muted-foreground">
                                    <Plus className="mr-1.5 h-4 w-4" /> Upload
                                </Button>
                            }
                            onImported={template => setSelected(value => [...value, template.id])}
                        />
                    </div>
                    <ScrollArea className="max-h-[280px]">
                        {isLoading ? (
                            <Loader2 className="m-6 h-5 w-5 animate-spin text-primary" />
                        ) : active.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-8 text-center">
                                <FileStack className="h-6 w-6 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Upload checklist documents to create a template.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y rounded-md border">
                                {active.map(template => {
                                    const checked = selected.includes(template.id)
                                    return (
                                        <label
                                            key={template.id}
                                            title={`Version ${template.version}`}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors first:rounded-t-md last:rounded-b-md hover:bg-muted/40',
                                                checked && 'bg-primary/5 hover:bg-primary/10',
                                            )}
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={value =>
                                                    setSelected(current =>
                                                        value
                                                            ? [...current, template.id]
                                                            : current.filter(id => id !== template.id),
                                                    )
                                                }
                                            />
                                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                                {template.name}
                                            </span>
                                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                                {template.item_count} items
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </section>

                <section className="space-y-2">
                    <h3 className="text-sm font-medium">Answer sources</h3>
                    <div className="divide-y rounded-md border">
                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5">
                            <Radar className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="flex-1 text-sm">Probe the device live</span>
                            <Switch
                                checked={live}
                                onCheckedChange={setLive}
                                aria-label="Probe the device live"
                            />
                        </label>
                        <div className="flex items-center gap-3 px-3 py-2.5">
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            {disclosure ? (
                                <>
                                    <span
                                        className="min-w-0 flex-1 truncate text-sm"
                                        title={disclosure.name}
                                    >
                                        {disclosure.name}
                                    </span>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-muted-foreground"
                                        aria-label="Remove disclosure"
                                        onClick={clearDisclosure}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1 text-sm">Manufacturer MDS2 disclosure</span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-7"
                                        onClick={() => disclosureInput.current?.click()}
                                    >
                                        <Paperclip className="mr-1.5 h-3.5 w-3.5" /> Attach
                                    </Button>
                                </>
                            )}
                            <input
                                ref={disclosureInput}
                                type="file"
                                hidden
                                accept=".pdf,.docx,.xlsx,.pptx,.html,.htm,.md,.txt"
                                onChange={event => setDisclosure(event.target.files?.[0])}
                            />
                        </div>
                    </div>
                    {sourceMode === 'manual' && (
                        <p className="text-xs text-muted-foreground">
                            With neither source, you'll fill in the checklist yourself.
                        </p>
                    )}
                </section>

                <DialogFooter>
                    <Button
                        disabled={selected.length === 0 || isStarting}
                        onClick={async () => {
                            await onStart(selected, sourceMode, disclosure)
                            clearDisclosure()
                            setLive(true)
                            setOpen(false)
                        }}
                    >
                        {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {sourceMode === 'manual'
                            ? 'Open checklist'
                            : sourceMode === 'disclosure_only'
                              ? 'Autofill from disclosure'
                              : sourceMode === 'disclosure_and_live'
                                ? 'Autofill and run live assessment'
                                : 'Run live assessment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
