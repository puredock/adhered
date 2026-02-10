import { Check, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface InlineEditableTextProps {
    value: string
    onSave: (value: string) => void
    isEditing: boolean
    onEditStart: () => void
    onEditEnd: () => void
    placeholder?: string
    className?: string
}

export function InlineEditableText({
    value,
    onSave,
    isEditing,
    onEditStart,
    onEditEnd,
    placeholder = 'No content yet.',
    className,
}: InlineEditableTextProps) {
    const [editValue, setEditValue] = useState(value)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing) {
            setEditValue(value)
            // Focus and select all text when entering edit mode
            setTimeout(() => {
                textareaRef.current?.focus()
                textareaRef.current?.select()
            }, 0)
        }
    }, [isEditing, value])

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current && isEditing) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [isEditing])

    const handleSave = useCallback(() => {
        onSave(editValue.trim())
        onEditEnd()
    }, [editValue, onSave, onEditEnd])

    const handleCancel = useCallback(() => {
        setEditValue(value)
        onEditEnd()
    }, [value, onEditEnd])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleCancel()
            } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSave()
            }
        },
        [handleCancel, handleSave],
    )

    if (isEditing) {
        return (
            <div className="space-y-2">
                <Textarea
                    ref={textareaRef}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        'min-h-[80px] text-sm resize-y bg-background border-primary/50 focus:border-primary shadow-sm transition-colors',
                        className,
                    )}
                    placeholder={placeholder}
                />
                <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs text-muted-foreground mr-2">
                        <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">Esc</kbd>{' '}
                        cancel
                        <span className="mx-2">·</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">⌘</kbd>
                        <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border ml-0.5">
                            Enter
                        </kbd>{' '}
                        save
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} className="h-7 px-2 text-xs">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Save
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <button
            type="button"
            className={cn(
                'w-full text-left text-sm text-foreground/85 leading-relaxed cursor-pointer rounded-md transition-colors hover:bg-muted/50 px-2 py-1 -mx-2 -my-1 focus:outline-none focus:ring-2 focus:ring-primary/30',
                !value && 'text-muted-foreground italic',
                className,
            )}
            onClick={onEditStart}
        >
            {value ? <span className="whitespace-pre-wrap">{value}</span> : placeholder}
        </button>
    )
}

interface InlineEditableListProps {
    items: string[]
    onSave: (items: string[]) => void
    isEditing: boolean
    onEditStart: () => void
    onEditEnd: () => void
    placeholder?: string
    className?: string
}

export function InlineEditableList({
    items,
    onSave,
    isEditing,
    onEditStart,
    onEditEnd,
    placeholder = 'No items yet.',
    className,
}: InlineEditableListProps) {
    const [editValue, setEditValue] = useState(items.join('\n'))
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing) {
            setEditValue(items.join('\n'))
            setTimeout(() => {
                textareaRef.current?.focus()
            }, 0)
        }
    }, [isEditing, items])

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current && isEditing) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 120)}px`
        }
    }, [isEditing])

    const handleSave = useCallback(() => {
        const newItems = editValue
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
        onSave(newItems)
        onEditEnd()
    }, [editValue, onSave, onEditEnd])

    const handleCancel = useCallback(() => {
        setEditValue(items.join('\n'))
        onEditEnd()
    }, [items, onEditEnd])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleCancel()
            } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSave()
            }
        },
        [handleCancel, handleSave],
    )

    if (isEditing) {
        return (
            <div className="space-y-2">
                <Textarea
                    ref={textareaRef}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        'min-h-[120px] text-sm resize-y bg-background border-primary/50 focus:border-primary shadow-sm transition-colors font-normal',
                        className,
                    )}
                    placeholder="Enter each step on a new line..."
                />
                <div className="flex items-center gap-2 justify-between">
                    <span className="text-xs text-muted-foreground">
                        Each line becomes a numbered step
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground mr-2">
                            <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">Esc</kbd>{' '}
                            cancel
                            <span className="mx-2">·</span>
                            <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border ml-0.5">
                                Enter
                            </kbd>{' '}
                            save
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} className="h-7 px-2 text-xs">
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (!items || items.length === 0) {
        return (
            <button
                type="button"
                className={cn(
                    'w-full text-left text-sm text-muted-foreground italic cursor-pointer rounded-md transition-colors hover:bg-muted/50 px-2 py-1 -mx-2 -my-1 focus:outline-none focus:ring-2 focus:ring-primary/30',
                    className,
                )}
                onClick={onEditStart}
            >
                {placeholder}
            </button>
        )
    }

    return (
        <button
            type="button"
            className={cn(
                'w-full text-left cursor-pointer rounded-md transition-colors hover:bg-muted/30 px-2 py-2 -mx-2 -my-2 focus:outline-none focus:ring-2 focus:ring-primary/30',
                className,
            )}
            onClick={onEditStart}
        >
            <ol className="space-y-3">
                {items.map((step, idx) => (
                    <li key={`step-${step.slice(0, 20)}-${idx}`} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-secondary text-secondary-foreground font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                        </span>
                        <span className="flex-1 text-foreground/80 leading-relaxed pt-0.5 whitespace-pre-wrap">
                            {step}
                        </span>
                    </li>
                ))}
            </ol>
        </button>
    )
}

/** Combined remediation component - shows summary text followed by steps */
interface InlineEditableRemediationProps {
    summary: string
    steps: string[]
    onSave: (summary: string, steps: string[]) => void
    isEditing: boolean
    onEditStart: () => void
    onEditEnd: () => void
    className?: string
}

export function InlineEditableRemediation({
    summary,
    steps,
    onSave,
    isEditing,
    onEditStart,
    onEditEnd,
    className,
}: InlineEditableRemediationProps) {
    const [editSummary, setEditSummary] = useState(summary)
    const [editSteps, setEditSteps] = useState(steps.join('\n'))
    const summaryRef = useRef<HTMLTextAreaElement>(null)
    const stepsRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing) {
            setEditSummary(summary)
            setEditSteps(steps.join('\n'))
            setTimeout(() => {
                summaryRef.current?.focus()
            }, 0)
        }
    }, [isEditing, summary, steps])

    const handleSave = useCallback(() => {
        const newSteps = editSteps
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
        onSave(editSummary.trim(), newSteps)
        onEditEnd()
    }, [editSummary, editSteps, onSave, onEditEnd])

    const handleCancel = useCallback(() => {
        setEditSummary(summary)
        setEditSteps(steps.join('\n'))
        onEditEnd()
    }, [summary, steps, onEditEnd])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleCancel()
            } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSave()
            }
        },
        [handleCancel, handleSave],
    )

    const hasContent = summary || steps.length > 0

    if (isEditing) {
        return (
            <div className={cn('space-y-4', className)}>
                {/* Summary input */}
                <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                        Summary
                    </span>
                    <Textarea
                        ref={summaryRef}
                        value={editSummary}
                        onChange={e => setEditSummary(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[60px] text-sm resize-y bg-background border-primary/50 focus:border-primary shadow-sm transition-colors"
                        placeholder="Brief description of the remediation approach..."
                        aria-label="Remediation summary"
                    />
                </div>

                {/* Steps input */}
                <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                        Steps to Fix
                    </span>
                    <Textarea
                        ref={stepsRef}
                        value={editSteps}
                        onChange={e => setEditSteps(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[100px] text-sm resize-y bg-background border-primary/50 focus:border-primary shadow-sm transition-colors"
                        placeholder="Enter each step on a new line..."
                        aria-label="Remediation steps"
                    />
                    <p className="text-xs text-muted-foreground">Each line becomes a numbered step</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 justify-end pt-2">
                    <span className="text-xs text-muted-foreground mr-2">
                        <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">Esc</kbd>{' '}
                        cancel
                        <span className="mx-2">·</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">⌘</kbd>
                        <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border ml-0.5">
                            Enter
                        </kbd>{' '}
                        save
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} className="h-7 px-2 text-xs">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Save
                    </Button>
                </div>
            </div>
        )
    }

    // Display mode
    if (!hasContent) {
        return (
            <button
                type="button"
                className={cn(
                    'w-full text-left text-sm text-muted-foreground italic cursor-pointer rounded-md transition-colors hover:bg-muted/50 px-2 py-1 -mx-2 -my-1 focus:outline-none focus:ring-2 focus:ring-primary/30',
                    className,
                )}
                onClick={onEditStart}
            >
                No remediation guidance documented yet. Click to add.
            </button>
        )
    }

    return (
        <button
            type="button"
            className={cn(
                'w-full text-left cursor-pointer rounded-md transition-colors hover:bg-muted/30 px-2 py-2 -mx-2 -my-2 focus:outline-none focus:ring-2 focus:ring-primary/30',
                className,
            )}
            onClick={onEditStart}
        >
            <div className="space-y-4">
                {/* Summary */}
                {summary && (
                    <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                        {summary}
                    </p>
                )}

                {/* Steps */}
                {steps.length > 0 && (
                    <ol className="space-y-3">
                        {steps.map((step, idx) => (
                            <li
                                key={`rem-step-${step.slice(0, 20)}-${idx}`}
                                className="flex gap-3 text-sm"
                            >
                                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-secondary text-secondary-foreground font-bold text-xs flex items-center justify-center">
                                    {idx + 1}
                                </span>
                                <span className="flex-1 text-foreground/80 leading-relaxed pt-0.5 whitespace-pre-wrap">
                                    {step}
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </button>
    )
}
