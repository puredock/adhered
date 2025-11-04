import type { ReactNode } from 'react'

interface PageHeaderProps {
    icon?: ReactNode
    title: string
    description?: string
    right?: ReactNode
    className?: string
}

export function PageHeader({ icon, title, description, right, className = '' }: PageHeaderProps) {
    return (
        <div className={`mb-6 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                </div>
                {right && <div className="flex items-center gap-3">{right}</div>}
            </div>
        </div>
    )
}
