import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Loader2, Upload, X } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { api, type ChecklistTemplate } from '@/lib/api'

const accepted = '.pdf,.docx,.xlsx,.pptx,.html,.md,.txt'

export function TemplateUploadDialog({
    trigger,
    onImported,
}: {
    trigger?: ReactNode
    onImported?: (template: ChecklistTemplate) => void
}) {
    const queryClient = useQueryClient()
    const inputRef = useRef<HTMLInputElement>(null)
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [files, setFiles] = useState<File[]>([])
    const mutation = useMutation({
        mutationFn: () => api.riskAssessments.importTemplate(name.trim(), files),
        onSuccess: template => {
            queryClient.invalidateQueries({ queryKey: ['risk-assessment-templates'] })
            toast.success(`Template created with ${template.items.length} checklist items`)
            onImported?.(template)
            setName('')
            setFiles([])
            setOpen(false)
        },
        onError: error =>
            toast.error(error instanceof Error ? error.message : 'Unable to parse documents'),
    })

    const addFiles = (incoming: File[]) => {
        setFiles(current => {
            const known = new Set(current.map(file => `${file.name}:${file.size}:${file.lastModified}`))
            return [
                ...current,
                ...incoming.filter(file => !known.has(`${file.name}:${file.size}:${file.lastModified}`)),
            ].slice(0, 10)
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger || <Button>Create template</Button>}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create checklist template</DialogTitle>
                    <DialogDescription>
                        Upload up to 10 related documents. They will be parsed into one reusable,
                        source-linked checklist.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="template-name">Template name</Label>
                        <Input
                            id="template-name"
                            placeholder="e.g. Medical device onboarding"
                            value={name}
                            onChange={event => setName(event.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="flex w-full flex-col items-center gap-2 border border-dashed border-border p-8 text-center hover:bg-muted/40"
                        onClick={() => inputRef.current?.click()}
                        onDragOver={event => event.preventDefault()}
                        onDrop={event => {
                            event.preventDefault()
                            addFiles(Array.from(event.dataTransfer.files))
                        }}
                    >
                        <Upload className="h-7 w-7 text-primary" />
                        <span className="font-medium">Drop documents here or browse</span>
                        <span className="text-xs text-muted-foreground">
                            PDF, Word, Excel, PowerPoint, HTML, Markdown or text
                        </span>
                    </button>
                    <input
                        ref={inputRef}
                        className="hidden"
                        type="file"
                        multiple
                        accept={accepted}
                        onChange={event => addFiles(Array.from(event.target.files || []))}
                    />
                    {files.length > 0 && (
                        <div className="max-h-52 space-y-2 overflow-y-auto">
                            {files.map((file, index) => (
                                <div
                                    key={`${file.name}-${file.lastModified}`}
                                    className="flex items-center gap-3 border border-border px-3 py-2"
                                >
                                    <FileText className="h-4 w-4 text-primary" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(1)} MB
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setFiles(value => value.filter((_, i) => i !== index))
                                        }
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={!name.trim() || files.length === 0 || mutation.isPending}
                        onClick={() => mutation.mutate()}
                    >
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Parse and save template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
