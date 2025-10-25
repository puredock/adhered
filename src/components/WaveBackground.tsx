export function WaveBackground() {
    return (
        <div 
            className="fixed inset-0 overflow-hidden pointer-events-none"
            style={{ zIndex: -20 }}
        >
            {/* Wave layers */}
            <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                viewBox="0 0 1440 800"
            >
                <defs>
                    <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(165 70% 75%)" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="hsl(165 60% 65%)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="hsl(165 70% 75%)" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(220 45% 25%)" stopOpacity="0.08" />
                        <stop offset="50%" stopColor="hsl(220 40% 20%)" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="hsl(220 45% 25%)" stopOpacity="0.08" />
                    </linearGradient>
                    <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(165 65% 68%)" stopOpacity="0.06" />
                        <stop offset="50%" stopColor="hsl(165 70% 72%)" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="hsl(165 65% 68%)" stopOpacity="0.06" />
                    </linearGradient>
                </defs>

                {/* Wave 1 - Bottom layer, slower */}
                <path
                    d="M0,320 C240,380 480,380 720,320 C960,260 1200,260 1440,320 L1440,800 L0,800 Z"
                    fill="url(#wave-gradient-1)"
                    opacity="0.7"
                >
                    <animate
                        attributeName="d"
                        dur="20s"
                        repeatCount="indefinite"
                        values="
                            M0,320 C240,380 480,380 720,320 C960,260 1200,260 1440,320 L1440,800 L0,800 Z;
                            M0,340 C240,280 480,280 720,340 C960,400 1200,400 1440,340 L1440,800 L0,800 Z;
                            M0,320 C240,380 480,380 720,320 C960,260 1200,260 1440,320 L1440,800 L0,800 Z
                        "
                    />
                </path>

                {/* Wave 2 - Middle layer, medium speed */}
                <path
                    d="M0,400 C320,450 640,350 960,400 C1280,450 1440,400 1440,400 L1440,800 L0,800 Z"
                    fill="url(#wave-gradient-2)"
                    opacity="0.5"
                >
                    <animate
                        attributeName="d"
                        dur="15s"
                        repeatCount="indefinite"
                        values="
                            M0,400 C320,450 640,350 960,400 C1280,450 1440,400 1440,400 L1440,800 L0,800 Z;
                            M0,420 C320,370 640,470 960,420 C1280,370 1440,420 1440,420 L1440,800 L0,800 Z;
                            M0,400 C320,450 640,350 960,400 C1280,450 1440,400 1440,400 L1440,800 L0,800 Z
                        "
                    />
                </path>

                {/* Wave 3 - Top layer, fastest */}
                <path
                    d="M0,480 C360,520 720,440 1080,480 C1440,520 1440,480 1440,480 L1440,800 L0,800 Z"
                    fill="url(#wave-gradient-3)"
                    opacity="0.4"
                >
                    <animate
                        attributeName="d"
                        dur="10s"
                        repeatCount="indefinite"
                        values="
                            M0,480 C360,520 720,440 1080,480 C1440,520 1440,480 1440,480 L1440,800 L0,800 Z;
                            M0,500 C360,460 720,540 1080,500 C1440,460 1440,500 1440,500 L1440,800 L0,800 Z;
                            M0,480 C360,520 720,440 1080,480 C1440,520 1440,480 1440,480 L1440,800 L0,800 Z
                        "
                    />
                </path>

                {/* Top waves - flowing from top */}
                <path
                    d="M0,100 C480,150 960,50 1440,100 L1440,0 L0,0 Z"
                    fill="url(#wave-gradient-1)"
                    opacity="0.3"
                >
                    <animate
                        attributeName="d"
                        dur="18s"
                        repeatCount="indefinite"
                        values="
                            M0,100 C480,150 960,50 1440,100 L1440,0 L0,0 Z;
                            M0,120 C480,70 960,170 1440,120 L1440,0 L0,0 Z;
                            M0,100 C480,150 960,50 1440,100 L1440,0 L0,0 Z
                        "
                    />
                </path>

                <path
                    d="M0,150 C360,180 720,120 1080,150 C1440,180 1440,150 1440,150 L1440,0 L0,0 Z"
                    fill="url(#wave-gradient-3)"
                    opacity="0.25"
                >
                    <animate
                        attributeName="d"
                        dur="12s"
                        repeatCount="indefinite"
                        values="
                            M0,150 C360,180 720,120 1080,150 C1440,180 1440,150 1440,150 L1440,0 L0,0 Z;
                            M0,130 C360,100 720,160 1080,130 C1440,100 1440,130 1440,130 L1440,0 L0,0 Z;
                            M0,150 C360,180 720,120 1080,150 C1440,180 1440,150 1440,150 L1440,0 L0,0 Z
                        "
                    />
                </path>
            </svg>

            {/* Fluid blobs with morphing animation */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-10 blur-3xl">
                <div
                    className="w-full h-full"
                    style={{
                        background: 'radial-gradient(circle, hsl(165 70% 75%) 0%, transparent 70%)',
                        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                        animation: 'morph 15s ease-in-out infinite',
                    }}
                />
            </div>

            <div className="absolute top-1/2 right-1/4 w-80 h-80 opacity-8 blur-3xl">
                <div
                    className="w-full h-full"
                    style={{
                        background: 'radial-gradient(circle, hsl(220 40% 30%) 0%, transparent 70%)',
                        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                        animation: 'morph 20s ease-in-out infinite reverse',
                    }}
                />
            </div>

            <style>{`
                @keyframes morph {
                    0%, 100% {
                        border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
                        transform: translate(0, 0) rotate(0deg) scale(1);
                    }
                    25% {
                        border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
                        transform: translate(10px, -10px) rotate(5deg) scale(1.05);
                    }
                    50% {
                        border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
                        transform: translate(-10px, 10px) rotate(-5deg) scale(0.95);
                    }
                    75% {
                        border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
                        transform: translate(5px, 5px) rotate(3deg) scale(1.02);
                    }
                }
            `}</style>
        </div>
    )
}
