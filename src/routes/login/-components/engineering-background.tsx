import { useCallback, useEffect, useRef } from 'react'

interface EngineeringBackgroundProps {
  animate: boolean
}

// Engineering-themed floating symbols
const SYMBOLS = ['⚡', '⚙', '🔧', '📐', '💡', '🔩', '⚛', '∑', '∫', 'Ω', 'π', 'λ', '∇', '∂', '∞']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  symbol: string
  size: number
  opacity: number
  rotation: number
  rotationSpeed: number
}

export function EngineeringBackground({ animate }: EngineeringBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)

  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.floor((width * height) / 12000) // ~30-40 particles for typical screen
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.4 - 0.15, // slight upward drift
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        size: 14 + Math.random() * 16,
        opacity: 0.08 + Math.random() * 0.18,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      if (particlesRef.current.length === 0) {
        initParticles(canvas.width, canvas.height)
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particlesRef.current) {
        if (animate) {
          p.x += p.vx
          p.y += p.vy
          p.rotation += p.rotationSpeed

          // Wrap around edges
          if (p.x < -30) p.x = canvas.width + 30
          if (p.x > canvas.width + 30) p.x = -30
          if (p.y < -30) p.y = canvas.height + 30
          if (p.y > canvas.height + 30) p.y = -30
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.opacity
        ctx.font = `${p.size}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.symbol, 0, 0)
        ctx.restore()
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [animate, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
