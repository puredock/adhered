import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, Eye, FileStack, FileText, Loader2, Plus, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { TemplateUploadDialog } from '@/components/TemplateUploadDialog'
import { TemplatePreviewDialog } from '@/components/TemplatePreviewDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

const identifierColors = [
    { name: 'teal', className: 'bg-teal-100 text-teal-700' },
    { name: 'blue', className: 'bg-blue-100 text-blue-700' },
    { name: 'violet', className: 'bg-violet-100 text-violet-700' },
    { name: 'amber', className: 'bg-amber-100 text-amber-700' },
    { name: 'rose', className: 'bg-rose-100 text-rose-700' },
    { name: 'cyan', className: 'bg-cyan-100 text-cyan-700' },
]

function templateIdentifier(name: string) {
    const hash = [...name].reduce((value, character) => value * 31 + character.charCodeAt(0), 0)
    return identifierColors[Math.abs(hash) % identifierColors.length]
}

export default function RiskTemplates() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['risk-assessment-templates'],
        queryFn: api.riskAssessments.templates,
    })
    const archive = useMutation({
        mutationFn: api.riskAssessments.archiveTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['risk-assessment-templates'] })
            toast.success('Template archived')
        },
    })
    const visible = templates.filter(template =>
        template.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    )

    return (
        <main className="min-h-screen flex-1 bg-background">
            <header className="border-b bg-card">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <h1 className="text-xl font-semibold">Assessment templates</h1>
                        <p className="text-sm text-muted-foreground">
                            Reusable checklists generated from your source documents
                        </p>
                    </div>
                    <TemplateUploadDialog
                        trigger={
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New template
                            </Button>
                        }
                    />
                </div>
            </header>
            <div className="mx-auto max-w-7xl space-y-5 px-6 py-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search templates"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                    />
                </div>
                {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : visible.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                            <FileStack className="h-9 w-9 text-muted-foreground" />
                            <div>
                                <p className="font-medium">No templates yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Upload one or more checklist documents to create one.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {visible.map(template => (
                            <Card
                                key={template.id}
                                className={template.status === 'archived' ? 'opacity-60' : ''}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span
                                                aria-label={`${templateIdentifier(template.name).name} template identifier`}
                                                title={`${templateIdentifier(template.name).name} identifier`}
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${templateIdentifier(template.name).className}`}
                                            >
                                                <ShieldCheck className="h-4 w-4" />
                                            </span>
                                            <CardTitle className="truncate text-base">
                                                {template.name}
                                            </CardTitle>
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {template.status}
                                        </Badge>
                                    </div>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        v{template.version}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-5 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <FileText className="h-4 w-4" /> {template.document_count}{' '}
                                            documents
                                        </span>
                                        <span>{template.item_count} items</span>
                                    </div>
                                    {template.status === 'active' && (
                                        <div className="flex gap-2">
                                            <TemplatePreviewDialog
                                                templateId={template.id}
                                                trigger={
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="mr-2 h-4 w-4" /> Review
                                                    </Button>
                                                }
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={archive.isPending}
                                                onClick={() => archive.mutate(template.id)}
                                            >
                                                <Archive className="mr-2 h-4 w-4" /> Archive
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
