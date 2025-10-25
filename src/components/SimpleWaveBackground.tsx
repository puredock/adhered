export function SimpleWaveBackground() {
    return (
        <>
            {/* Animated wave background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Large teal blob */}
                <div
                    style={{
                        position: 'absolute',
                        top: '10%',
                        left: '10%',
                        width: '600px',
                        height: '600px',
                        background: 'radial-gradient(circle, rgba(74, 222, 189, 0.5) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                        animation: 'blob-float 20s ease-in-out infinite',
                    }}
                />

                {/* Dark blue blob */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10%',
                        width: '500px',
                        height: '500px',
                        background: 'radial-gradient(circle, rgba(42, 50, 66, 0.4) 0%, transparent 70%)',
                        filter: 'blur(90px)',
                        animation: 'blob-float 25s ease-in-out infinite reverse',
                    }}
                />

                {/* Bottom teal blob */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '5%',
                        left: '30%',
                        width: '550px',
                        height: '550px',
                        background: 'radial-gradient(circle, rgba(74, 222, 189, 0.45) 0%, transparent 70%)',
                        filter: 'blur(100px)',
                        animation: 'blob-float 30s ease-in-out infinite',
                    }}
                />
            </div>

            <style>{`
                @keyframes blob-float {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(50px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-30px, 30px) scale(0.9);
                    }
                }
            `}</style>
        </>
    )
}
