import { Download, FileCode2, FileImage, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Artifact } from './types'

function formatSize(size: string) {
    return size || 'Unknown size'
}

export function ArtifactsFilesTab({
    artifacts,
    initialSelectedId,
}: {
    artifacts: Artifact[]
    initialSelectedId?: string
}) {
    const [selectedId, setSelectedId] = useState(initialSelectedId || artifacts[0]?.id)
    const selected = artifacts.find(artifact => artifact.id === selectedId) || artifacts[0]
    const [content, setContent] = useState<string>()
    const [pdfUrl, setPdfUrl] = useState<string>()

    useEffect(() => {
        setContent(undefined)
        setPdfUrl(undefined)
        if (!selected?.url || selected.type === 'image') return
        const controller = new AbortController()
        let objectUrl: string | undefined
        fetch(selected.url, { signal: controller.signal })
            .then(response => (response.ok ? response : Promise.reject(response)))
            .then(response => (selected.type === 'pdf' ? response.blob() : response.text()))
            .then(value => {
                if (value instanceof Blob) {
                    objectUrl = URL.createObjectURL(value)
                    setPdfUrl(objectUrl)
                } else {
                    setContent(value)
                }
            })
            .catch(error => {
                if (error?.name !== 'AbortError') setContent('Unable to preview this artifact.')
            })
        return () => {
            controller.abort()
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [selected?.id, selected?.type, selected?.url])

    if (!selected) return null

    return (
        <div className="grid h-full min-h-0 grid-cols-[280px_1fr]">
            <ScrollArea className="border-r">
                <div className="space-y-1 p-2">
                    {artifacts.map(artifact => (
                        <button
                            key={artifact.id}
                            type="button"
                            onClick={() => setSelectedId(artifact.id)}
                            className={cn(
                                'flex w-full items-start gap-2 p-3 text-left hover:bg-muted',
                                selected.id === artifact.id && 'bg-muted',
                            )}
                        >
                            {artifact.type === 'image' ? (
                                <FileImage className="mt-0.5 h-4 w-4 shrink-0" />
                            ) : artifact.type === 'script' ? (
                                <FileCode2 className="mt-0.5 h-4 w-4 shrink-0" />
                            ) : (
                                <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                            )}
                            <span className="min-w-0">
                                <span className="block break-all text-sm font-medium">
                                    {artifact.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatSize(artifact.size)}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            </ScrollArea>
            <div className="flex min-h-0 flex-col">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{selected.name}</p>
                        <p className="text-xs text-muted-foreground">{selected.timestamp}</p>
                    </div>
                    {selected.url && (
                        <Button asChild variant="outline" size="sm">
                            <a href={selected.url} download>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                    )}
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4">
                        {selected.type === 'image' && selected.url ? (
                            <img src={selected.url} alt={selected.name} className="max-w-full border" />
                        ) : selected.type === 'pdf' && pdfUrl ? (
                            <iframe src={pdfUrl} title={selected.name} className="h-[65vh] w-full border" />
                        ) : selected.content || content ? (
                            <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                                {selected.content || content}
                            </pre>
                        ) : (
                            <div className="py-16 text-center text-sm text-muted-foreground">
                                Download the artifact to inspect its contents.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
