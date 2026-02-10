import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'

export interface EditSectionModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (content: string | string[]) => void
    section: 'overview' | 'reproduce' | 'remediate' | null
    title: string
    description: string
    currentContent: string | string[] | undefined
    isMultiline?: boolean
    isList?: boolean
}

export function EditSectionModal({
    isOpen,
    onClose,
    onSave,
    section,
    title,
    description,
    currentContent,
    isMultiline = true,
    isList = false,
}: EditSectionModalProps) {
    const [content, setContent] = useState<string>('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (currentContent) {
            if (Array.isArray(currentContent)) {
                // For lists, join with newlines
                setContent(currentContent.join('\n'))
            } else {
                setContent(currentContent)
            }
        } else {
            setContent('')
        }
    }, [currentContent, isOpen])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            if (isList) {
                // Split by newlines and filter empty lines
                const items = content
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                onSave(items)
            } else {
                onSave(content)
            }
            onClose()
        } finally {
            setIsSaving(false)
        }
    }

    const getSectionLabel = () => {
        switch (section) {
            case 'overview':
                return 'Description'
            case 'reproduce':
                return 'Reproduction Steps'
            case 'remediate':
                return 'Remediation Guidance'
            default:
                return 'Content'
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit {getSectionLabel()}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder={
                            isList ? 'Enter each item on a new line...' : 'Enter content here...'
                        }
                        className="min-h-[300px] font-mono text-sm"
                    />
                    {isList && (
                        <p className="text-xs text-muted-foreground">
                            Each line will be treated as a separate item
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
