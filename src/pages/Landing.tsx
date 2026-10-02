import { Activity, ArrowRight, FileText, Network, ScanLine, Shield, Zap } from 'lucide-react'
import { useState } from 'react'
import { GetDemoDialog } from '@/components/GetDemoDialog'
import { RequestAccessDialog } from '@/components/RequestAccessDialog'
import { TypewriterText } from '@/components/TypewriterText'
import { WorkflowCarousel } from '@/components/WorkflowCarousel'

const features = [
    {
        title: 'Asset Discovery',
        desc: 'Enumerate and identify all the connected devices on your networks.',
        icon: Network,
    },
    {
        title: 'Real-time Monitoring',
        desc: 'Track devices, security and audit issues, as well as advisory reports in one place.',
        icon: Activity,
    },
    {
        title: 'Risk Assessment',
        desc: 'Obtain deep insights into your cyber-risk posture and necessary remediation measures.',
        icon: Shield,
    },
    {
        title: 'Automated Pentesting',
        desc: 'AI-powered fully automated pen-testing workflows and cookbooks tailored to your specific use cases.',
        icon: Zap,
        large: true,
    },
    {
        title: 'Regulatory Advisory',
        desc: 'Detailed advisory reports for your devices and target markets.',
        icon: FileText,
    },
]

const badges = [
    { logo: '/hsa-logo.png', alt: 'HSA', label: 'HSA Compliant' },
    { logo: '/mitre-logo.png', alt: 'MITRE ATT&CK', label: 'MITRE ATT&CK Aligned' },
    { logo: '/csa-logo.avif', alt: 'CSA', label: 'CSA Singapore Aligned' },
]

const stats = [
    { value: '100%', label: 'autonomous execution' },
    { value: '24/7', label: 'continuous monitoring' },
    { value: 'MITRE', label: 'ATT&CK framework coverage' },
]

export default function Landing() {
    const [showRequestAccess, setShowRequestAccess] = useState(false)
    const [showGetDemo, setShowGetDemo] = useState(false)

    return (
        <div className="min-h-screen bg-background w-full relative antialiased">
            <style>{`
                @keyframes aurora-drift {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(6%, 8%) scale(1.15); }
                    66% { transform: translate(-5%, -4%) scale(0.95); }
                }
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                @keyframes float-pulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.85; transform: scale(1.06); }
                }
                @keyframes ambient-drift {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(3%, -4%); }
                }
                @keyframes ambient-drift-rev {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-4%, 3%); }
                }
                @keyframes rise-in {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .landing-rise { animation: rise-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .landing-rise-1 { animation-delay: 0.1s; }
                .landing-rise-2 { animation-delay: 0.2s; }
                .landing-rise-3 { animation-delay: 0.3s; }
                .landing-marquee { animation: marquee 32s linear infinite; }
                .landing-marquee:hover { animation-play-state: paused; }
            `}</style>

            {/* ============ NAV ============ */}
            <nav className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
                <div
                    className="flex items-center justify-between w-full max-w-3xl rounded-full pl-4 pr-2 py-2 border"
                    style={{
                        backgroundColor: 'hsl(220 40% 12% / 0.75)',
                        borderColor: 'hsl(var(--sidebar-border))',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 32px -12px rgba(0,0,0,0.35)',
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ background: 'var(--gradient-primary)', color: 'hsl(220 50% 12%)' }}
                        >
                            IG
                        </div>
                        <span
                            className="text-sm font-semibold tracking-tight"
                            style={{ color: 'hsl(var(--sidebar-foreground))' }}
                        >
                            Adhere
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowRequestAccess(true)}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
                    >
                        Request access
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </nav>

            {/* ============ HERO (dark, aurora) ============ */}
            <section
                className="relative overflow-hidden pt-40 sm:pt-48 pb-24 sm:pb-32"
                style={{ backgroundColor: 'hsl(220 40% 12%)' }}
            >
                {/* Aurora glow layers */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
                        style={{
                            background:
                                'radial-gradient(ellipse at center, hsl(165 70% 50% / 0.28) 0%, transparent 65%)',
                            animation: 'aurora-drift 14s ease-in-out infinite',
                        }}
                    />
                    <div
                        className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full"
                        style={{
                            background:
                                'radial-gradient(circle, hsl(165 60% 45% / 0.18) 0%, transparent 70%)',
                            animation: 'aurora-drift 18s ease-in-out infinite reverse',
                        }}
                    />
                    <div
                        className="absolute bottom-0 -right-40 w-[600px] h-[500px] rounded-full"
                        style={{
                            background:
                                'radial-gradient(circle, hsl(200 60% 45% / 0.12) 0%, transparent 70%)',
                            animation: 'aurora-drift 22s ease-in-out infinite',
                        }}
                    />
                    {/* Fine grid overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.4]"
                        style={{
                            backgroundImage:
                                'linear-gradient(hsl(165 30% 75% / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(165 30% 75% / 0.05) 1px, transparent 1px)',
                            backgroundSize: '56px 56px',
                            maskImage:
                                'radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)',
                            WebkitMaskImage:
                                'radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)',
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <div
                        className="landing-rise inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border mb-8"
                        style={{
                            borderColor: 'hsl(165 70% 55% / 0.35)',
                            color: 'hsl(165 70% 65%)',
                            backgroundColor: 'hsl(165 70% 40% / 0.1)',
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                                backgroundColor: 'hsl(165 80% 55%)',
                                animation: 'float-pulse 2.4s ease-in-out infinite',
                            }}
                        />
                        Launching soon
                    </div>

                    <h1
                        className="landing-rise landing-rise-1 text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-semibold leading-[1.02] tracking-[-0.045em] mb-7"
                        style={{ color: 'hsl(165 40% 96%)' }}
                    >
                        Agentic security
                        <br />
                        <span
                            className="bg-clip-text text-transparent"
                            style={{
                                backgroundImage:
                                    'linear-gradient(120deg, hsl(165 85% 65%) 0%, hsl(165 70% 50%) 45%, hsl(190 70% 55%) 100%)',
                            }}
                        >
                            for connected devices
                        </span>
                    </h1>

                    <p
                        className="landing-rise landing-rise-2 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
                        style={{ color: 'hsl(165 30% 75% / 0.85)' }}
                    >
                        Enforce security by design across your devices and networks with AI-powered
                        pen-testing and audit workflows.
                    </p>

                    <div className="landing-rise landing-rise-3 flex items-center justify-center gap-3 flex-wrap mb-16">
                        <button
                            type="button"
                            onClick={() => setShowRequestAccess(true)}
                            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-transform hover:scale-[1.04] active:scale-[0.97]"
                            style={{
                                background:
                                    'linear-gradient(135deg, hsl(165 80% 60%) 0%, hsl(165 70% 45%) 100%)',
                                color: 'hsl(220 50% 12%)',
                                boxShadow:
                                    '0 0 0 1px hsl(165 80% 65% / 0.4), 0 12px 40px -8px hsl(165 70% 50% / 0.5)',
                            }}
                        >
                            Request access
                            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowGetDemo(true)}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold border transition-all hover:scale-[1.04] active:scale-[0.97]"
                            style={{
                                borderColor: 'hsl(165 30% 75% / 0.25)',
                                color: 'hsl(165 30% 75%)',
                                backgroundColor: 'hsl(165 30% 75% / 0.05)',
                            }}
                        >
                            <ScanLine className="w-4.5 h-4.5" />
                            Get a demo
                        </button>
                    </div>

                    {/* Stats strip */}
                    <div
                        className="landing-rise landing-rise-3 grid grid-cols-1 sm:grid-cols-3 divide-x divide-y sm:divide-y-0 rounded-2xl border max-w-2xl mx-auto overflow-hidden"
                        style={{
                            borderColor: 'hsl(var(--sidebar-border))',
                            backgroundColor: 'hsl(220 40% 10% / 0.6)',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        {stats.map(s => (
                            <div
                                key={s.label}
                                className="px-6 py-5 text-center"
                                style={{ borderColor: 'hsl(var(--sidebar-border))' }}
                            >
                                <div
                                    className="text-2xl font-bold tracking-tight"
                                    style={{ color: 'hsl(165 80% 62%)' }}
                                >
                                    {s.value}
                                </div>
                                <div
                                    className="text-xs mt-1"
                                    style={{ color: 'hsl(165 30% 75% / 0.6)' }}
                                >
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom fade into light page */}
                <div
                    className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, hsl(var(--background)))',
                    }}
                />
            </section>

            {/* ============ TRUST MARQUEE ============ */}
            <section className="py-10 border-b border-border/60 overflow-hidden">
                <div
                    className="flex items-center gap-16 whitespace-nowrap w-max landing-marquee"
                    style={{
                        maskImage:
                            'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)',
                        WebkitMaskImage:
                            'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)',
                    }}
                >
                    {[...badges, ...badges, ...badges, ...badges].map((b, i) => (
                        <div key={i} className="flex items-center gap-3 shrink-0">
                            <img
                                src={b.logo}
                                alt={b.alt}
                                className="h-7 w-auto object-contain opacity-70"
                            />
                            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/50">
                                {b.label}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ AMBIENT BACKGROUND (light sections) ============ */}
            <div className="relative">
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                    {/* Soft teal blobs drifting slowly */}
                    <div
                        className="absolute top-[5%] -left-32 w-[520px] h-[520px] rounded-full opacity-50"
                        style={{
                            background:
                                'radial-gradient(circle, hsl(165 70% 70% / 0.35) 0%, transparent 65%)',
                            animation: 'ambient-drift 26s ease-in-out infinite',
                        }}
                    />
                    <div
                        className="absolute top-[35%] -right-40 w-[620px] h-[620px] rounded-full opacity-40"
                        style={{
                            background:
                                'radial-gradient(circle, hsl(185 65% 68% / 0.35) 0%, transparent 65%)',
                            animation: 'ambient-drift-rev 32s ease-in-out infinite',
                        }}
                    />
                    <div
                        className="absolute bottom-[10%] left-1/4 w-[700px] h-[500px] rounded-full opacity-40"
                        style={{
                            background:
                                'radial-gradient(circle, hsl(165 70% 72% / 0.3) 0%, transparent 65%)',
                            animation: 'ambient-drift 38s ease-in-out infinite reverse',
                        }}
                    />
                    {/* Faint diagonal grid for texture */}
                    <div
                        className="absolute inset-0 opacity-[0.7]"
                        style={{
                            backgroundImage:
                                'linear-gradient(hsl(165 40% 55% / 0.14) 1px, transparent 1px), linear-gradient(90deg, hsl(165 40% 55% / 0.14) 1px, transparent 1px)',
                            backgroundSize: '56px 56px',
                            maskImage:
                                'radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 85%)',
                            WebkitMaskImage:
                                'radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 85%)',
                        }}
                    />
                </div>

                {/* ============ FEATURES (bento) ============ */}
                <section className="relative py-24 sm:py-32 max-w-6xl mx-auto px-6 sm:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                01 — Platform
                            </div>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] min-h-[3rem] sm:min-h-[4rem]">
                                <TypewriterText
                                    texts={['Comprehensive insights', 'Actionable reports']}
                                    className="bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage:
                                            'linear-gradient(135deg, hsl(220 50% 12%) 0%, hsl(165 60% 38%) 100%)',
                                    }}
                                />
                            </h2>
                        </div>
                        <p className="text-base text-foreground/55 max-w-md leading-relaxed sm:text-right">
                            Uncover gaps in your security and compliance postures in a single unified
                            platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]">
                        {features.map(f =>
                            f.large ? (
                                <div
                                    key={f.title}
                                    className="group relative sm:col-span-2 rounded-3xl overflow-hidden p-8 sm:p-10 flex flex-col justify-end min-h-[240px] transition-transform duration-300 hover:-translate-y-1"
                                    style={{
                                        backgroundColor: 'hsl(220 40% 12%)',
                                        boxShadow: '0 16px 48px -16px hsl(165 60% 35% / 0.35)',
                                    }}
                                >
                                    <div
                                        className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
                                        style={{
                                            background:
                                                'radial-gradient(circle, hsl(165 70% 50% / 0.35) 0%, transparent 70%)',
                                        }}
                                    />
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 relative"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, hsl(165 80% 60%) 0%, hsl(165 70% 45%) 100%)',
                                            color: 'hsl(220 50% 12%)',
                                        }}
                                    >
                                        <f.icon className="w-5 h-5" />
                                    </div>
                                    <h3
                                        className="font-semibold text-2xl mb-2 tracking-tight relative"
                                        style={{ color: 'hsl(165 40% 96%)' }}
                                    >
                                        {f.title}
                                    </h3>
                                    <p
                                        className="text-sm leading-relaxed max-w-lg relative"
                                        style={{ color: 'hsl(165 30% 75% / 0.75)' }}
                                    >
                                        {f.desc}
                                    </p>
                                </div>
                            ) : (
                                <div
                                    key={f.title}
                                    className="group relative rounded-3xl border border-border/70 bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                                >
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                                        style={{
                                            backgroundColor: 'hsl(165 65% 55% / 0.12)',
                                            color: 'hsl(165 60% 35%)',
                                        }}
                                    >
                                        <f.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2 tracking-tight">
                                        {f.title}
                                    </h3>
                                    <p className="text-sm text-foreground/60 leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </section>

                {/* ============ HOW IT WORKS ============ */}
                <section className="relative py-24 sm:py-32 max-w-6xl mx-auto px-6 sm:px-8">
                    <div className="text-center mb-14">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            02 — How it works
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em]">
                            Discovery to{' '}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(120deg, hsl(165 75% 45%) 0%, hsl(190 65% 40%) 100%)',
                                }}
                            >
                                remediation
                            </span>
                            <br />
                            <TypewriterText
                                texts={['in minutes', 'effortlessly', 'automatically']}
                                className="text-foreground/45 text-3xl sm:text-4xl md:text-5xl"
                            />
                        </h2>
                    </div>
                    <WorkflowCarousel
                        steps={[
                            {
                                number: 1,
                                title: 'Identify',
                                description:
                                    'Discover all your devices across all of your networks in one unified view.',
                                screenshot: '/screenshots/devices.png',
                                linkText: 'Find your devices',
                                onButtonClick: () => setShowRequestAccess(true),
                            },
                            {
                                number: 2,
                                title: 'Assess',
                                description:
                                    'Run AI‑assisted audit scans and penetration tests on specific devices with live logs. Identify vulnerabilities and misconfigurations and enforce provided remediation suggestions.',
                                screenshot: '/screenshots/scan.png',
                                linkText: 'Start a scan',
                                onButtonClick: () => setShowRequestAccess(true),
                            },
                        ]}
                    />
                </section>

                {/* ============ CTA ============ */}
                <section className="relative max-w-6xl mx-auto px-6 sm:px-8 pb-24 sm:pb-32">
                    <div
                        className="relative rounded-[2rem] overflow-hidden px-8 py-20 sm:py-28 text-center"
                        style={{ backgroundColor: 'hsl(220 40% 12%)' }}
                    >
                        <div
                            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
                            style={{
                                background:
                                    'radial-gradient(ellipse at center, hsl(165 70% 50% / 0.3) 0%, transparent 65%)',
                                animation: 'aurora-drift 16s ease-in-out infinite',
                            }}
                        />
                        <h2
                            className="relative text-4xl sm:text-5xl font-semibold tracking-[-0.03em] mb-5"
                            style={{ color: 'hsl(165 40% 96%)' }}
                        >
                            Ready to secure
                            <br />
                            your devices?
                        </h2>
                        <p
                            className="relative text-lg max-w-xl mx-auto mb-10"
                            style={{ color: 'hsl(165 30% 75% / 0.8)' }}
                        >
                            Experience the power of agentic AI to automate your device security &
                            compliance.
                        </p>
                        <div className="relative flex items-center justify-center gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setShowRequestAccess(true)}
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-transform hover:scale-[1.04] active:scale-[0.97]"
                                style={{
                                    background:
                                        'linear-gradient(135deg, hsl(165 80% 60%) 0%, hsl(165 70% 45%) 100%)',
                                    color: 'hsl(220 50% 12%)',
                                    boxShadow:
                                        '0 0 0 1px hsl(165 80% 65% / 0.4), 0 12px 40px -8px hsl(165 70% 50% / 0.5)',
                                }}
                            >
                                Request access
                                <ArrowRight className="w-4.5 h-4.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowGetDemo(true)}
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold border transition-all hover:scale-[1.04] active:scale-[0.97]"
                                style={{
                                    borderColor: 'hsl(165 30% 75% / 0.25)',
                                    color: 'hsl(165 30% 75%)',
                                    backgroundColor: 'hsl(165 30% 75% / 0.05)',
                                }}
                            >
                                <ScanLine className="w-4.5 h-4.5" />
                                Get a demo
                            </button>
                        </div>
                    </div>
                </section>
            </div>
            {/* end ambient background wrapper */}

            {/* ============ FOOTER ============ */}
            <footer className="w-full py-12" style={{ backgroundColor: 'hsl(220 40% 12%)' }}>
                <div className="w-full px-8 mx-auto max-w-6xl">
                    <div className="flex items-center gap-2.5 mb-8">
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ background: 'var(--gradient-primary)', color: 'hsl(220 50% 12%)' }}
                        >
                            IG
                        </div>
                        <span
                            className="text-sm font-semibold"
                            style={{ color: 'hsl(var(--sidebar-foreground))' }}
                        >
                            Adhere — agentic device security
                        </span>
                    </div>
                    <div
                        className="pt-8 border-t flex flex-col items-start gap-6"
                        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
                    >
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <a
                                href="https://www.imperial.ac.uk/about/global/singapore/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src="/igs-logo.png"
                                    alt="Imperial Global Singapore"
                                    className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
                                />
                            </a>
                            <div
                                className="w-px h-6"
                                style={{ backgroundColor: 'hsl(var(--sidebar-border))' }}
                            />
                            <div className="flex items-center gap-2 sm:gap-3">
                                <a
                                    href="https://www.imperial.ac.uk/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src="/imperial-logo.png"
                                        alt="Imperial College London"
                                        className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
                                    />
                                </a>
                                <span
                                    className="text-lg font-light"
                                    style={{ color: 'hsl(165 30% 75% / 0.5)' }}
                                >
                                    +
                                </span>
                                <a
                                    href="https://www.ntu.edu.sg/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src="/ntu-logo.png"
                                        alt="NTU Singapore"
                                        className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
                                    />
                                </a>
                            </div>
                        </div>
                        <div className="text-xs" style={{ color: 'hsl(165 30% 75% / 0.5)' }}>
                            © {new Date().getFullYear()} Imperial Global Singapore. Authorized research &
                            security testing only.
                        </div>
                    </div>
                </div>
            </footer>

            {/* Dialogs */}
            <RequestAccessDialog open={showRequestAccess} onOpenChange={setShowRequestAccess} />
            <GetDemoDialog open={showGetDemo} onOpenChange={setShowGetDemo} />
        </div>
    )
}
