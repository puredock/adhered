import { ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface GetDemoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GetDemoDialog({ open, onOpenChange }: GetDemoDialogProps) {
    useEffect(() => {
        if (open && window.IN?.parse) {
            window.IN.parse()
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1400px] max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black mb-2">Schedule a Demo</DialogTitle>
                    <p className="text-base text-foreground/70 leading-relaxed">
                        Adhere was presented at the recently concluded{' '}
                        <span className="font-semibold text-primary">
                            Singapore International Cyber Week
                        </span>{' '}
                        hosted at the British High Commission office in Singapore. Pick your time to
                        explore the solution in greater detail.
                    </p>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                    {/* Left: LinkedIn Post Preview */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground/80">Recent Showcases</h3>
                        <a
                            href="https://www.linkedin.com/posts/imperial-global-sg_imperial-sicw2025-inabrcypher-activity-7387310309553901569-1vvw/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl border-2 border-border overflow-hidden bg-card shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group"
                        >
                            {/* Post Header */}
                            <div className="p-6 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)',
                                        }}
                                    >
                                        <svg
                                            className="w-7 h-7 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            role="img"
                                            aria-label="LinkedIn logo"
                                        >
                                            <title>LinkedIn</title>
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-bold text-base">
                                            Imperial Global Singapore
                                        </div>
                                        <div className="text-sm text-foreground/60">3 days ago</div>
                                    </div>
                                </div>
                            </div>

                            {/* Post Content */}
                            <div className="p-6">
                                <p className="text-sm text-foreground/80 leading-relaxed mb-4 line-clamp-4">
                                    Singapore International Cyber Week (SICW) is in full swing and
                                    Imperial Global Singapore is proud to be a part of it! IN-CYPHER was
                                    honoured to be invited to the UK Cyber Reception, hosted by the UK in
                                    Singapore...
                                </p>
                                <div className="flex items-center gap-4 text-xs text-foreground/60 mb-4">
                                    <span>👍 14 reactions</span>
                                    <span>•</span>
                                    <span>#SICW2025 #Cybersecurity</span>
                                </div>
                                <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                                    View full post on LinkedIn
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>

                            {/* Cover Image */}
                            <div className="relative bg-muted">
                                <img
                                    src="https://media.licdn.com/dms/image/v2/D4E3DAQEF34nQ49s41Q/image-scale_191_1128/image-scale_191_1128/0/1727432227625/imperial_global_sg_cover?e=2147483647&v=beta&t=8gATRAN6SqSZCTNQY2b49mOVnZ6KLzzJgMTWPntBuUU"
                                    alt="Imperial Global Singapore at SICW"
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                        </a>
                    </div>

                    {/* Right: Cal.com Calendar */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground/80">Select Your Time</h3>
                        <div className="rounded-xl border-2 border-border overflow-hidden shadow-lg">
                            <iframe
                                src="https://cal.com/adhere"
                                className="w-full h-[600px] border-0"
                                title="Schedule Demo"
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

declare global {
    interface Window {
        IN?: {
            parse: () => void
        }
    }
}
