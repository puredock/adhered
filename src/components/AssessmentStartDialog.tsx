import { useQuery } from '@tanstack/react-query'
import { FileStack, Loader2, Plus, ShieldCheck } from 'lucide-react'
import { useRef, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/lib/api'

type AssessmentSourceMode = 'live' | 'manual' | 'disclosure_only' | 'disclosure_and_live'

export function AssessmentStartDialog({
    isStarting,
    onStart,
}: {
    isStarting: boolean
    onStart: (templateIds: string[], sourceMode: AssessmentSourceMode, disclosure?: File) => Promise<void>
}) {
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<string[]>([])
    const [disclosure, setDisclosure] = useState<File>()
    const [sourceMode, setSourceMode] = useState<AssessmentSourceMode>('live')
    const disclosureInput = useRef<HTMLInputElement>(null)
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
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Start risk assessment</DialogTitle>
                    <DialogDescription>
                        Select one or more reusable templates. Their checklists will be combined into a
                        source-linked snapshot. Autofill from a manufacturer's MDS2 disclosure, run an
                        authorized live assessment, or fill in the checklist manually.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 rounded-md border p-4">
                    <div>
                        <p className="text-sm font-medium">Manufacturer disclosure (optional)</p>
                        <p className="text-xs text-muted-foreground">
                            Attach an MDS2 disclosure to suggest answers from manufacturer statements.
                        </p>
                    </div>
                    <Input
                        ref={disclosureInput}
                        type="file"
                        accept=".pdf,.docx,.xlsx,.pptx,.html,.htm,.md,.txt"
                        onChange={event => {
                            const file = event.target.files?.[0]
                            setDisclosure(file)
                            setSourceMode(file ? 'disclosure_only' : 'live')
                        }}
                    />
                    {disclosure ? (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="break-all text-xs text-muted-foreground">Selected: {disclosure.name}</p>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setDisclosure(undefined)
                                        setSourceMode('live')
                                        if (disclosureInput.current) disclosureInput.current.value = ''
                                    }}
                                >
                                    Remove disclosure
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Autofill uses only statements that support a checklist item. It does not verify
                                the device's current configuration; unsupported items remain for review.
                            </p>
                            <RadioGroup
                                value={sourceMode}
                                onValueChange={value => setSourceMode(value as AssessmentSourceMode)}
                                className="gap-3"
                            >
                                <div className="flex items-start gap-2 text-sm">
                                    <RadioGroupItem id="source-disclosure-only" value="disclosure_only" className="mt-0.5" />
                                    <Label htmlFor="source-disclosure-only" className="cursor-pointer font-normal">
                                        <span className="font-medium">Use disclosure only</span>
                                        <span className="block text-xs text-muted-foreground">Autofill supported items without probing the device.</span>
                                    </Label>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <RadioGroupItem id="source-disclosure-live" value="disclosure_and_live" className="mt-0.5" />
                                    <Label htmlFor="source-disclosure-live" className="cursor-pointer font-normal">
                                        <span className="font-medium">Use disclosure and run a live assessment</span>
                                        <span className="block text-xs text-muted-foreground">Also probes the device using the configured authorized access mode.</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </>
                    ) : (
                        <>
                            <div className="rounded-sm bg-muted/60 p-3 text-xs text-muted-foreground">
                                No disclosure attached. A live assessment will probe the device if selected.
                            </div>
                            <RadioGroup
                                value={sourceMode}
                                onValueChange={value => setSourceMode(value as AssessmentSourceMode)}
                                className="gap-3"
                            >
                                <div className="flex items-start gap-2 text-sm">
                                    <RadioGroupItem id="source-live" value="live" className="mt-0.5" />
                                    <Label htmlFor="source-live" className="cursor-pointer font-normal">
                                        <span className="font-medium">Run a live assessment</span>
                                        <span className="block text-xs text-muted-foreground">Collect evidence from the device for the selected checklist.</span>
                                    </Label>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <RadioGroupItem id="source-manual" value="manual" className="mt-0.5" />
                                    <Label htmlFor="source-manual" className="cursor-pointer font-normal">
                                        <span className="font-medium">Fill in manually</span>
                                        <span className="block text-xs text-muted-foreground">Open the checklist without probing the device.</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </>
                    )}
                </div>
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
                            await onStart(selected, sourceMode, disclosure)
                            setDisclosure(undefined)
                            setSourceMode('live')
                            if (disclosureInput.current) disclosureInput.current.value = ''
                            setOpen(false)
                        }}
                    >
                        {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {sourceMode === 'manual'
                            ? 'Open manual assessment'
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
