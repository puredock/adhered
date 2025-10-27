import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Bluetooth,
    ClipboardCheck,
    Network,
    Radio,
    ScanLine,
    Shield,
    Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { FluidBackground } from '@/components/FluidBackground'
import { InteractiveBackground } from '@/components/InteractiveBackground'
import { SimpleWaveBackground } from '@/components/SimpleWaveBackground'
import { TypewriterText } from '@/components/TypewriterText'
import { Card, CardContent } from '@/components/ui/card'

export default function Landing() {
    const features = [
        {
            title: 'Network Discovery',
            desc: 'Nmap-based scanning to map subnets, hosts, and services.',
            icon: Network,
        },
        {
            title: 'BLE & Bluetooth',
            desc: 'BLE device discovery and GATT enumeration; classic BT on Linux.',
            icon: Bluetooth,
        },
        {
            title: 'RF Spectrum',
            desc: 'SDR spectrum analysis with interference detection.',
            icon: Radio,
        },
        {
            title: 'Automated Pentesting',
            desc: 'AI-assisted assessments with live logs and reporting.',
            icon: Zap,
        },
        {
            title: 'Real-time Monitoring',
            desc: 'Track devices, issues, and scan status in one place.',
            icon: Activity,
        },
        {
            title: 'Security Posture',
            desc: 'Highlight vulnerabilities and compliant devices.',
            icon: Shield,
        },
    ]

    return (
        <div className="min-h-screen bg-background w-full relative isolate overflow-hidden">
            {/* Animated Background Layers */}
            <SimpleWaveBackground />
            <FluidBackground />
            <InteractiveBackground />

            {/* Top Navigation */}
            <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 w-full">
                <div className="w-full px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{
                                backgroundColor: 'hsl(var(--sidebar-background))',
                                color: 'hsl(var(--sidebar-foreground))',
                            }}
                        >
                            IGS
                        </div>
                        <div>
                            <div className="text-lg font-bold">Adhere</div>
                            {/*
                            <div className="text-xs text-muted-foreground">
                                Medical Device Reconnaissance
                            </div>
                            */}
                        </div>
                    </div>
                    {/*
                    <Link
                        to="/networks"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all"
                        style={{
                            backgroundColor: 'hsl(var(--sidebar-background))',
                            color: 'hsl(var(--sidebar-foreground))',
                        }}
                    >
                        Request Access
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    */}
                </div>
            </nav>

            <main className="w-full px-8 py-20 mx-auto relative z-10" style={{ maxWidth: '1440px' }}>
                {/* Hero */}
                <section className="mb-32">
                    <div className="text-center max-w-5xl mx-auto mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border-2 border-primary/40 bg-primary/10 text-primary mb-8 animate-pulse shadow-lg">
                            🔜 Launching soon
                        </div>
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-8 tracking-tight group">
                            <span
                                className="block text-foreground mb-2 transition-all duration-300 group-hover:scale-[1.02]"
                                style={{
                                    textShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    letterSpacing: '-0.02em',
                                    animation:
                                        'fade-in 1s ease-out, slide-up 0.8s ease-out, pulse-glow 3s ease-in-out infinite',
                                }}
                            >
                                Agentic Security
                            </span>
                            <span
                                className="block bg-clip-text text-transparent transition-all duration-300 group-hover:scale-[1.02]"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(90deg, hsl(165 80% 50%) 0%, hsl(165 70% 60%) 25%, hsl(220 50% 40%) 50%, hsl(165 70% 60%) 75%, hsl(165 80% 50%) 100%)',
                                    backgroundSize: '300% 100%',
                                    letterSpacing: '-0.01em',
                                    animation:
                                        'gradient-flow 8s linear infinite, fade-in 1.2s ease-out, slide-up 1s ease-out',
                                }}
                            >
                                for connected devices
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-foreground/70 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                            Enforce security by design across all your connected devices and networks
                            using{' '}
                            <span className="font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                                AI-powered
                            </span>{' '}
                            <span className="underline decoration-primary decoration-2 underline-offset-4 font-medium">
                                pen-testing
                            </span>{' '}
                            and{' '}
                            <span className="underline decoration-primary decoration-2 underline-offset-4 font-medium">
                                audit workflows
                            </span>
                            .
                        </p>
                        <div className="flex items-center justify-center gap-5 flex-wrap">
                            <Link
                                to="/networks"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl text-lg font-bold transition-all hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
                                style={{
                                    backgroundColor: 'hsl(var(--sidebar-background))',
                                    color: 'hsl(var(--sidebar-foreground))',
                                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.4)',
                                }}
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <span className="relative">Request Access</span>
                                <ArrowRight className="w-6 h-6 relative group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/scans"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl text-lg font-bold bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-all border-2 border-border/50 hover:border-primary hover:scale-105 group shadow-lg"
                            >
                                <ScanLine className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                <span>Get a demo</span>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div
                        className="rounded-3xl border-2 border-border/40 p-10 shadow-2xl backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-all duration-500"
                        style={{
                            background:
                                'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                            <div className="text-center group/stat">
                                <div className="mb-4 inline-block">
                                    <div className="mb-3 flex justify-center">
                                        <ClipboardCheck className="w-10 h-10 text-primary" />
                                    </div>
                                    <div
                                        className="text-7xl font-black mb-3 bg-clip-text text-transparent group-hover/stat:scale-110 transition-transform duration-300"
                                        style={{
                                            backgroundImage:
                                                'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)',
                                        }}
                                    >
                                        {Number(Math.random().toFixed(2)) * 1000}
                                    </div>
                                    <div className="h-1 w-16 mx-auto bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                                </div>
                                <div className="text-base font-semibold text-foreground/80 tracking-wide">
                                    Audits
                                </div>
                            </div>
                            <div className="text-center group/stat relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-px before:h-3/4 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-3/4 after:bg-gradient-to-b after:from-transparent after:via-border after:to-transparent">
                                <div className="mb-4 inline-block">
                                    <div className="mb-3 flex justify-center">
                                        <ScanLine className="w-10 h-10 text-primary" />
                                    </div>
                                    <div
                                        className="text-7xl font-black mb-3 bg-clip-text text-transparent group-hover/stat:scale-110 transition-transform duration-300"
                                        style={{
                                            backgroundImage:
                                                'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)',
                                        }}
                                    >
                                        {Number(Math.random().toFixed(2)) * 1000}0
                                    </div>
                                    <div className="h-1 w-16 mx-auto bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                                </div>
                                <div className="text-base font-semibold text-foreground/80 tracking-wide">
                                    Scans
                                </div>
                            </div>
                            <div className="text-center group/stat">
                                <div className="mb-4 inline-block">
                                    <div className="mb-3 flex justify-center">
                                        <AlertTriangle className="w-10 h-10 text-primary" />
                                    </div>
                                    <div
                                        className="text-7xl font-black mb-3 bg-clip-text text-transparent group-hover/stat:scale-110 transition-transform duration-300"
                                        style={{
                                            backgroundImage:
                                                'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)',
                                        }}
                                    >
                                        {Number(Math.random().toFixed(2)) * 1000}
                                    </div>
                                    <div className="h-1 w-16 mx-auto bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                                </div>
                                <div className="text-base font-semibold text-foreground/80 tracking-wide">
                                    Issues
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-black mb-5 tracking-tight min-h-[4.5rem]">
                            <TypewriterText
                                texts={[
                                    'Comprehensive Insights',
                                    'Actionable Reports',
                                    // TODO: add more texts

                                    // 'Real-time Monitoring. Complete Visibility',
                                    // 'Automated Testing. Continuous Security',
                                ]}
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(135deg, hsl(220 50% 15%) 0%, hsl(165 70% 50%) 50%, hsl(220 45% 20%) 100%)',
                                    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                                    letterSpacing: '-0.02em',
                                }}
                            />
                        </h2>
                        <p className="text-xl text-foreground/60 max-w-3xl mx-auto leading-relaxed">
                            Uncover gaps in your security and compliance postures in a single unified
                            platform.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map(f => (
                            <Card
                                key={f.title}
                                className="shadow-2xl border-2 border-border/50 bg-card/90 backdrop-blur-sm hover:shadow-[0_20px_60px_-15px_rgba(74,222,189,0.3)] hover:border-primary/50 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <CardContent className="pt-8 pb-8 relative z-10">
                                    <div className="flex items-start gap-5">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative overflow-hidden shadow-lg"
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)',
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <f.icon className="w-8 h-8 relative z-10" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors tracking-tight">
                                                {f.title}
                                            </h3>
                                            <p className="text-sm text-foreground/70 leading-relaxed">
                                                {f.desc}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-extrabold mb-5 tracking-tight">
                            Get started in 3 steps
                        </h2>
                        <p className="text-xl text-foreground/60 max-w-3xl mx-auto leading-relaxed">
                            From discovery to remediation in minutes
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="relative group">
                            <div className="p-10 rounded-3xl bg-card/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground text-2xl font-black mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)',
                                    }}
                                >
                                    1
                                </div>
                                <h4 className="font-extrabold text-2xl mb-4 tracking-tight relative z-10">
                                    Discover
                                </h4>
                                <p className="text-foreground/70 mb-6 leading-relaxed relative z-10">
                                    Detect networks and enumerate devices via Nmap, BLE/BT, and RF
                                    scanning. Map your entire infrastructure.
                                </p>
                                <Link
                                    to="/networks"
                                    className="inline-flex items-center gap-2 text-primary text-base font-bold hover:gap-3 transition-all relative z-10 group/link"
                                >
                                    View networks
                                    <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="p-10 rounded-3xl bg-card/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground text-2xl font-black mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)',
                                    }}
                                >
                                    2
                                </div>
                                <h4 className="font-extrabold text-2xl mb-4 tracking-tight relative z-10">
                                    Assess
                                </h4>
                                <p className="text-foreground/70 mb-6 leading-relaxed relative z-10">
                                    Run AI‑assisted scans and penetration tests with live logs. Identify
                                    vulnerabilities automatically.
                                </p>
                                <Link
                                    to="/scans"
                                    className="inline-flex items-center gap-2 text-primary text-base font-bold hover:gap-3 transition-all relative z-10 group/link"
                                >
                                    Start a scan
                                    <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="p-10 rounded-3xl bg-card/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground text-2xl font-black mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, hsl(165 70% 60%) 0%, hsl(165 60% 45%) 100%)',
                                    }}
                                >
                                    3
                                </div>
                                <h4 className="font-extrabold text-2xl mb-4 tracking-tight relative z-10">
                                    Prioritize
                                </h4>
                                <p className="text-foreground/70 mb-6 leading-relaxed relative z-10">
                                    Review issues, track compliance, and monitor risk over time. Generate
                                    comprehensive reports.
                                </p>
                                <Link
                                    to="/audits"
                                    className="inline-flex items-center gap-2 text-primary text-base font-bold hover:gap-3 transition-all relative z-10 group/link"
                                >
                                    See audits
                                    <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section
                    className="rounded-2xl p-12 text-center border-2"
                    style={{
                        backgroundColor: 'hsl(var(--sidebar-background))',
                        borderColor: 'hsl(var(--sidebar-border))',
                    }}
                >
                    <h2
                        className="text-3xl font-bold mb-4"
                        style={{ color: 'hsl(var(--sidebar-foreground))' }}
                    >
                        Ready to secure your connected devices?
                    </h2>
                    <p
                        className="mb-8 max-w-2xl mx-auto"
                        style={{ color: 'hsl(var(--sidebar-foreground) / 0.8)' }}
                    >
                        Start discovering networks, running security assessments, and building compliance
                        reports today.
                    </p>
                    <Link
                        to="/networks"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:shadow-2xl transition-all text-base font-semibold"
                    >
                        Request Access
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </section>
            </main>

            {/* Footer */}
            <footer
                className="border-t w-full py-12"
                style={{
                    backgroundColor: 'hsl(var(--sidebar-background))',
                    borderColor: 'hsl(var(--sidebar-border))',
                }}
            >
                <div className="w-full px-8 mx-auto" style={{ maxWidth: '1400px' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                                    style={{ background: 'var(--gradient-primary)' }}
                                >
                                    IGS
                                </div>
                                <div>
                                    <div
                                        className="text-lg font-bold"
                                        style={{ color: 'hsl(var(--sidebar-foreground))' }}
                                    >
                                        Adhere
                                    </div>
                                </div>
                            </div>
                            <p
                                className="text-sm"
                                style={{ color: 'hsl(var(--sidebar-foreground) / 0.7)' }}
                            >
                                Comprehensive reconnaissance toolkit for medical device security and
                                hospital network assessment.
                            </p>
                        </div>
                        <div>
                            <h3
                                className="font-semibold mb-4"
                                style={{ color: 'hsl(var(--sidebar-primary))' }}
                            >
                                Platform
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        to="/networks"
                                        className="text-sm hover:underline"
                                        style={{ color: 'hsl(var(--sidebar-foreground) / 0.8)' }}
                                    >
                                        Networks
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/catalog"
                                        className="text-sm hover:underline"
                                        style={{ color: 'hsl(var(--sidebar-foreground) / 0.8)' }}
                                    >
                                        Devices
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/scans"
                                        className="text-sm hover:underline"
                                        style={{ color: 'hsl(var(--sidebar-foreground) / 0.8)' }}
                                    >
                                        Scans
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/audits"
                                        className="text-sm hover:underline"
                                        style={{ color: 'hsl(var(--sidebar-foreground) / 0.8)' }}
                                    >
                                        Audits
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3
                                className="font-semibold mb-4"
                                style={{ color: 'hsl(var(--sidebar-primary))' }}
                            >
                                Resources
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <span
                                        className="text-sm"
                                        style={{ color: 'hsl(var(--sidebar-foreground) / 0.8)' }}
                                    >
                                        Documentation
                                    </span>
                                </li>
                                <li>
                                    <span
                                        className="text-sm"
                                        style={{ color: 'hsl(var(--sidebar-foreground) / 0.8)' }}
                                    >
                                        API Reference
                                    </span>
                                </li>
                                <li>
                                    <span
                                        className="text-sm"
                                        style={{ color: 'hsl(var(--sidebar-foreground) / 0.8)' }}
                                    >
                                        Support
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div
                        className="pt-8 border-t text-center text-sm"
                        style={{
                            borderColor: 'hsl(var(--sidebar-border))',
                            color: 'hsl(var(--sidebar-foreground) / 0.6)',
                        }}
                    >
                        © {new Date().getFullYear()} Imperial Global Singapore. Authorized research &
                        security testing only.
                    </div>
                </div>
            </footer>

            {/* Global Styles for Animations */}
            <style>{`
                @keyframes gradient-shift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes gradient-flow {
                    0% {
                        background-position: 0% 50%;
                    }
                    100% {
                        background-position: 300% 50%;
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slide-up {
                    from {
                        transform: translateY(30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes pulse-glow {
                    0%, 100% {
                        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
                    }
                    50% {
                        filter: drop-shadow(0 8px 24px rgba(74, 222, 189, 0.3));
                    }
                }
            `}</style>
        </div>
    )
}
