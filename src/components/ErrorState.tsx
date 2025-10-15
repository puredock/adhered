import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorStateProps {
    title?: string
    message?: string
    showRetry?: boolean
    showBackButton?: boolean
    backUrl?: string
    backLabel?: string
    variant?: 'fullpage' | 'inline'
}

export function ErrorState({
    title = 'Unable to Connect',
    message = "We couldn't reach the API server. Please make sure the backend service is running and try again.",
    showRetry = true,
    showBackButton = true,
    backUrl = '/networks',
    backLabel = 'Go Back',
    variant = 'fullpage',
}: ErrorStateProps) {
    if (variant === 'inline') {
        return (
            <div className="py-12 px-6">
                <div className="relative max-w-lg mx-auto">
                    {/* Decorative background layers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl transform -rotate-1"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-100/50 to-emerald-100/50 rounded-2xl transform rotate-1"></div>

                    {/* Main content */}
                    <div className="relative bg-white/80 backdrop-blur-sm border border-teal-200/50 rounded-xl shadow-lg p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            {/* Icon */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-teal-100 rounded-full blur-xl opacity-50"></div>
                                <div className="relative bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-xl">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-1">
                                <h3 className="font-semibold text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground">{message}</p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -top-2 -right-2 w-16 h-16 bg-teal-200/20 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-emerald-200/20 rounded-full blur-xl"></div>
                </div>
            </div>
        )
    }

    // Fullpage variant
    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
            <div className="relative max-w-md w-full">
                {/* Decorative background */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl transform -rotate-1"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-100/50 to-emerald-100/50 rounded-3xl transform rotate-1"></div>

                {/* Main content */}
                <Card className="relative shadow-xl border-teal-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Icon with decorative circles */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-teal-100 rounded-full blur-2xl opacity-50"></div>
                                <div className="relative bg-gradient-to-br from-teal-500 to-emerald-500 p-6 rounded-2xl shadow-lg">
                                    <svg
                                        className="w-12 h-12 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Error message */}
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                                <p className="text-muted-foreground">{message}</p>
                            </div>

                            {/* Action buttons */}
                            {(showRetry || showBackButton) && (
                                <div className="flex gap-3 w-full">
                                    {showRetry && (
                                        <Button
                                            onClick={() => window.location.reload()}
                                            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                />
                                            </svg>
                                            Retry
                                        </Button>
                                    )}
                                    {showBackButton && (
                                        <Button asChild variant="outline" className="flex-1">
                                            <Link to={backUrl}>
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                                    />
                                                </svg>
                                                {backLabel}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Help text */}
                            <div className="pt-4 border-t border-border w-full">
                                <details className="text-sm text-muted-foreground">
                                    <summary className="cursor-pointer hover:text-foreground transition-colors">
                                        Troubleshooting tips
                                    </summary>
                                    <ul className="mt-3 space-y-2 text-left list-disc list-inside">
                                        <li>Check if the API server is running on port 8000</li>
                                        <li>Verify your network connection</li>
                                        <li>Ensure CORS is properly configured</li>
                                        <li>Check the browser console for error details</li>
                                    </ul>
                                </details>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-200/30 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl"></div>
            </div>
        </div>
    )
}
