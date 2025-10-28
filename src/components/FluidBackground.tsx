export function FluidBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-30 sm:opacity-100">
            {/* Liquid gradient blobs */}
            <div className="absolute inset-0">
                {/* Large flowing blob 1 */}
                <div
                    className="absolute"
                    style={{
                        top: '-10%',
                        left: '-10%',
                        width: '800px',
                        height: '800px',
                        opacity: 0.5,
                        filter: 'blur(100px)',
                        background:
                            'radial-gradient(circle at 50% 50%, hsl(165 70% 75%) 0%, hsl(165 60% 65%) 30%, transparent 70%)',
                        animation: 'float-diagonal 25s ease-in-out infinite',
                        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                    }}
                />

                {/* Large flowing blob 2 */}
                <div
                    className="absolute"
                    style={{
                        top: '30%',
                        right: '-10%',
                        width: '700px',
                        height: '700px',
                        opacity: 0.45,
                        filter: 'blur(120px)',
                        background:
                            'radial-gradient(circle at 50% 50%, hsl(220 45% 35%) 0%, hsl(220 40% 25%) 30%, transparent 70%)',
                        animation: 'float-diagonal-reverse 30s ease-in-out infinite',
                        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                    }}
                />

                {/* Medium flowing blob 3 */}
                <div
                    className="absolute"
                    style={{
                        bottom: '-10%',
                        left: '20%',
                        width: '600px',
                        height: '600px',
                        opacity: 0.48,
                        filter: 'blur(80px)',
                        background:
                            'radial-gradient(circle at 50% 50%, hsl(165 65% 68%) 0%, hsl(165 70% 72%) 30%, transparent 70%)',
                        animation: 'float-spin 35s ease-in-out infinite',
                        borderRadius: '50% 50% 30% 70% / 50% 30% 70% 50%',
                    }}
                />

                {/* Small accent blob 4 */}
                <div
                    className="absolute"
                    style={{
                        top: '60%',
                        left: '40%',
                        width: '500px',
                        height: '500px',
                        opacity: 0.42,
                        filter: 'blur(90px)',
                        background:
                            'radial-gradient(circle at 50% 50%, hsl(220 40% 30%) 0%, hsl(165 60% 60%) 50%, transparent 70%)',
                        animation: 'float-wobble 20s ease-in-out infinite',
                        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                    }}
                />

                {/* Top accent blob 5 */}
                <div
                    className="absolute"
                    style={{
                        top: '10%',
                        right: '30%',
                        width: '450px',
                        height: '450px',
                        opacity: 0.4,
                        filter: 'blur(100px)',
                        background:
                            'radial-gradient(circle at 50% 50%, hsl(165 70% 70%) 0%, transparent 60%)',
                        animation: 'float-pulse 18s ease-in-out infinite',
                        borderRadius: '70% 30% 30% 70% / 60% 40% 60% 40%',
                    }}
                />
            </div>

            <style>{`
                @keyframes float-diagonal {
                    0%, 100% {
                        transform: translate(0, 0) scale(1) rotate(0deg);
                        border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                    }
                    25% {
                        transform: translate(100px, 50px) scale(1.1) rotate(5deg);
                        border-radius: 50% 50% 60% 40% / 50% 60% 40% 50%;
                    }
                    50% {
                        transform: translate(150px, -50px) scale(0.9) rotate(-3deg);
                        border-radius: 60% 40% 50% 50% / 40% 60% 50% 50%;
                    }
                    75% {
                        transform: translate(50px, 100px) scale(1.05) rotate(8deg);
                        border-radius: 45% 55% 65% 35% / 55% 45% 55% 45%;
                    }
                }

                @keyframes float-diagonal-reverse {
                    0%, 100% {
                        transform: translate(0, 0) scale(1) rotate(0deg);
                        border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
                    }
                    33% {
                        transform: translate(-80px, 80px) scale(1.15) rotate(-8deg);
                        border-radius: 50% 50% 40% 60% / 50% 40% 60% 50%;
                    }
                    66% {
                        transform: translate(-120px, -60px) scale(0.85) rotate(5deg);
                        border-radius: 40% 60% 50% 50% / 60% 50% 50% 40%;
                    }
                }

                @keyframes float-spin {
                    0%, 100% {
                        transform: translate(0, 0) rotate(0deg) scale(1);
                        border-radius: 50% 50% 30% 70% / 50% 30% 70% 50%;
                    }
                    25% {
                        transform: translate(-60px, -80px) rotate(90deg) scale(1.1);
                        border-radius: 30% 70% 50% 50% / 70% 50% 50% 30%;
                    }
                    50% {
                        transform: translate(60px, -40px) rotate(180deg) scale(0.95);
                        border-radius: 70% 30% 30% 70% / 30% 70% 70% 30%;
                    }
                    75% {
                        transform: translate(-40px, 60px) rotate(270deg) scale(1.05);
                        border-radius: 50% 50% 70% 30% / 50% 70% 30% 50%;
                    }
                }

                @keyframes float-wobble {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                        border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
                    }
                    20% {
                        transform: translate(40px, -30px) scale(1.08);
                        border-radius: 50% 50% 60% 40% / 40% 60% 50% 50%;
                    }
                    40% {
                        transform: translate(-30px, 50px) scale(0.92);
                        border-radius: 60% 40% 50% 50% / 50% 50% 40% 60%;
                    }
                    60% {
                        transform: translate(50px, 40px) scale(1.05);
                        border-radius: 40% 60% 40% 60% / 60% 40% 60% 40%;
                    }
                    80% {
                        transform: translate(-40px, -50px) scale(0.95);
                        border-radius: 70% 30% 50% 50% / 30% 70% 50% 50%;
                    }
                }

                @keyframes float-pulse {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                        border-radius: 70% 30% 30% 70% / 60% 40% 60% 40%;
                        opacity: 0.1;
                    }
                    50% {
                        transform: translate(20px, -20px) scale(1.2);
                        border-radius: 30% 70% 70% 30% / 40% 60% 40% 60%;
                        opacity: 0.15;
                    }
                }
            `}</style>
        </div>
    )
}
