import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WorkflowStep {
    number: number
    title: string
    description: string
    screenshot: string
    linkText: string
    onButtonClick: () => void
}

interface WorkflowCarouselProps {
    steps: WorkflowStep[]
}

export function WorkflowCarousel({ steps }: WorkflowCarouselProps) {
    const [activeStep, setActiveStep] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(prev => (prev + 1) % steps.length)
        }, 6000)

        return () => clearInterval(interval)
    }, [steps.length])

    return (
        <div className="relative">
            {/* Integrated Content */}
            <div className="relative min-h-[500px] sm:min-h-[500px] md:min-h-[600px]">
                {steps.map((step, idx) => (
                    <div
                        key={step.number}
                        className={`transition-all duration-1000 ${
                            activeStep === idx
                                ? 'opacity-100 relative z-10'
                                : 'opacity-0 absolute inset-0 pointer-events-none z-0'
                        }`}
                    >
                        {/* Blended Layout */}
                        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border/30 sm:border-2 shadow-2xl bg-background">
                            {/* Screenshot as background */}
                            <div className="relative w-full min-h-[500px] sm:min-h-0">
                                <img
                                    src={step.screenshot}
                                    alt={`${step.title} Screenshot`}
                                    className="w-full h-full min-h-[500px] sm:min-h-0 object-cover object-top sm:object-contain"
                                />
                                {/* Gradient overlays for blending - minimal fade on edges only */}
                                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background/50 to-transparent" />
                                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background/50 to-transparent" />
                            </div>

                            {/* Text overlay - responsive positioning */}
                            <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-auto sm:right-4 md:bottom-8 md:right-8 sm:max-w-sm md:max-w-md">
                                <div className="backdrop-blur-xl bg-background/90 p-3 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-border/40 sm:border-2 shadow-2xl">
                                    <div className="flex items-center gap-2 mb-2 sm:mb-3 md:mb-4">
                                        <div
                                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-lg md:text-xl font-black shadow-lg flex-shrink-0"
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)',
                                                color: 'white',
                                            }}
                                        >
                                            {step.number}
                                        </div>
                                        <h3 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="text-xs sm:text-sm md:text-base text-foreground/80 leading-relaxed mb-3 sm:mb-4 md:mb-6 line-clamp-2 sm:line-clamp-3 md:line-clamp-none">
                                        {step.description}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={step.onButtonClick}
                                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-bold transition-all hover:scale-105 group/link shadow-lg w-full justify-center"
                                        style={{
                                            backgroundColor: 'hsl(var(--sidebar-background))',
                                            color: 'hsl(var(--sidebar-foreground))',
                                        }}
                                    >
                                        {step.linkText}
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/link:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-4 mt-12">
                {steps.map((step, idx) => (
                    <button
                        key={step.number}
                        type="button"
                        onClick={() => setActiveStep(idx)}
                        className="group flex flex-col items-center gap-2 transition-all"
                    >
                        <div
                            className={`transition-all duration-500 rounded-full ${
                                activeStep === idx ? 'w-16 h-3' : 'w-3 h-3 group-hover:w-4'
                            }`}
                            style={{
                                background:
                                    activeStep === idx
                                        ? 'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)'
                                        : 'hsl(var(--border))',
                            }}
                        />
                        <span
                            className={`text-xs font-semibold transition-all duration-300 ${
                                activeStep === idx
                                    ? 'text-primary opacity-100'
                                    : 'text-muted-foreground opacity-0 group-hover:opacity-70'
                            }`}
                        >
                            {step.title}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}
