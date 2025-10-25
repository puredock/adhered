export function AnimatedGradient() {
    return (
        <div 
            className="fixed inset-0 overflow-hidden pointer-events-none"
            style={{ zIndex: -10 }}
        >
            {/* Primary animated gradient orbs */}
            <div
                className="absolute rounded-full"
                style={{
                    top: '-160px',
                    right: '-160px',
                    width: '384px',
                    height: '384px',
                    opacity: 0.3,
                    filter: 'blur(96px)',
                    background: 'radial-gradient(circle, hsl(165 70% 75%) 0%, transparent 70%)',
                    animation: 'float 20s ease-in-out infinite',
                }}
            />
            <div
                className="absolute rounded-full"
                style={{
                    top: '33.333%',
                    left: '-160px',
                    width: '384px',
                    height: '384px',
                    opacity: 0.25,
                    filter: 'blur(96px)',
                    background: 'radial-gradient(circle, hsl(165 60% 65%) 0%, transparent 70%)',
                    animation: 'float 25s ease-in-out infinite reverse',
                }}
            />
            <div
                className="absolute rounded-full"
                style={{
                    bottom: '80px',
                    right: '25%',
                    width: '320px',
                    height: '320px',
                    opacity: 0.2,
                    filter: 'blur(96px)',
                    background: 'radial-gradient(circle, hsl(220 45% 35%) 0%, transparent 70%)',
                    animation: 'float 30s ease-in-out infinite',
                }}
            />

            {/* Mesh gradient overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `
                        radial-gradient(at 27% 37%, hsl(165 70% 75% / 0.1) 0px, transparent 50%),
                        radial-gradient(at 97% 21%, hsl(220 40% 20% / 0.1) 0px, transparent 50%),
                        radial-gradient(at 52% 99%, hsl(165 60% 65% / 0.1) 0px, transparent 50%),
                        radial-gradient(at 10% 29%, hsl(220 45% 25% / 0.1) 0px, transparent 50%),
                        radial-gradient(at 97% 96%, hsl(165 70% 70% / 0.1) 0px, transparent 50%),
                        radial-gradient(at 33% 50%, hsl(220 40% 30% / 0.1) 0px, transparent 50%),
                        radial-gradient(at 79% 53%, hsl(165 65% 68% / 0.1) 0px, transparent 50%)
                    `,
                }}
            />

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
            `}</style>
        </div>
    )
}
