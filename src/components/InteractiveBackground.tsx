import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
}

interface Ripple {
    x: number
    y: number
    radius: number
    maxRadius: number
    opacity: number
}

export function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const ripplesRef = useRef<Ripple[]>([])
    const mouseRef = useRef({ x: 0, y: 0, moving: false })
    const animationFrameRef = useRef<number>()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY, moving: true }

            if (Math.random() > 0.7) {
                particlesRef.current.push({
                    x: e.clientX,
                    y: e.clientY,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 1,
                    maxLife: 60 + Math.random() * 60,
                })
            }

            if (particlesRef.current.length > 50) {
                particlesRef.current.shift()
            }
        }

        const handleClick = (e: MouseEvent) => {
            ripplesRef.current.push({
                x: e.clientX,
                y: e.clientY,
                radius: 0,
                maxRadius: 100 + Math.random() * 100,
                opacity: 1,
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particlesRef.current = particlesRef.current.filter(p => {
                p.x += p.vx
                p.y += p.vy
                p.life++

                const alpha = 1 - p.life / p.maxLife
                const size = 2 + (1 - p.life / p.maxLife) * 3

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2)
                gradient.addColorStop(0, `rgba(74, 222, 189, ${alpha * 0.6})`)
                gradient.addColorStop(1, `rgba(74, 222, 189, 0)`)

                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
                ctx.fill()

                return p.life < p.maxLife
            })

            ripplesRef.current = ripplesRef.current.filter(r => {
                r.radius += 3
                r.opacity -= 0.02

                ctx.strokeStyle = `rgba(74, 222, 189, ${r.opacity * 0.5})`
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
                ctx.stroke()

                ctx.strokeStyle = `rgba(74, 222, 189, ${r.opacity * 0.3})`
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.arc(r.x, r.y, r.radius + 10, 0, Math.PI * 2)
                ctx.stroke()

                return r.radius < r.maxRadius && r.opacity > 0
            })

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        animate()
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('click', handleClick)

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('click', handleClick)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 hidden sm:block"
            style={{ mixBlendMode: 'screen' }}
        />
    )
}
