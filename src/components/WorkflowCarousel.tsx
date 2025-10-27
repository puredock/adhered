import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface WorkflowStep {
    number: number
    title: string
    description: string
    screenshot: string
    link: string
    linkText: string
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
            <div className="relative min-h-[600px]">
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
                        <div className="relative rounded-3xl overflow-hidden border-2 border-border/30 shadow-2xl bg-background">
                            {/* Screenshot as background */}
                            <div className="relative w-full">
                                <img
                                    src={step.screenshot}
                                    alt={`${step.title} Screenshot`}
                                    className="w-full h-auto"
                                />
                                {/* Gradient overlays for blending - minimal fade on edges only */}
                                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background/50 to-transparent" />
                                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background/50 to-transparent" />
                            </div>

                            {/* Text overlay - bottom right corner */}
                            <div className="absolute bottom-8 right-8 max-w-md">
                                <div className="backdrop-blur-xl bg-background/85 p-8 rounded-3xl border-2 border-border/40 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-lg flex-shrink-0"
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)',
                                                color: 'white',
                                            }}
                                        >
                                            {step.number}
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tight text-foreground">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="text-base text-foreground/80 leading-relaxed mb-6">
                                        {step.description}
                                    </p>
                                    <Link
                                        to={step.link}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold transition-all hover:scale-105 group/link shadow-lg w-full justify-center"
                                        style={{
                                            backgroundColor: 'hsl(var(--sidebar-background))',
                                            color: 'hsl(var(--sidebar-foreground))',
                                        }}
                                    >
                                        {step.linkText}
                                        <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
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
                        key={idx}
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
                                activeStep === idx ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-70'
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
