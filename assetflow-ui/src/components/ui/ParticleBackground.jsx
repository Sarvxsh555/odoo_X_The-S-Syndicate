import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() { this.reset(true) }
      reset(initial = false) {
        this.x = Math.random() * canvas.width
        this.y = initial ? Math.random() * canvas.height : -5
        this.size = Math.random() * 1.8 + 0.3
        this.speedX = (Math.random() - 0.5) * 0.25
        this.speedY = Math.random() * 0.25 + 0.1
        this.opacity = Math.random() * 0.6 + 0.15
        this.pulse = Math.random() * Math.PI * 2
        this.pulseSpeed = Math.random() * 0.02 + 0.005
        const colors = ['255,255,255', '180,200,255', '200,180,255', '100,160,255', '220,210,255']
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.pulse += this.pulseSpeed
        this.currentOpacity = this.opacity * (0.6 + 0.4 * Math.sin(this.pulse))
        if (this.y > canvas.height + 5) this.reset()
      }
      draw() {
        ctx.save()
        ctx.globalAlpha = this.currentOpacity
        ctx.fillStyle = `rgb(${this.color})`
        ctx.shadowBlur = this.size * 4
        ctx.shadowColor = `rgba(${this.color}, 0.9)`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    for (let i = 0; i < 200; i++) particles.push(new Particle())

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < Math.min(particles.length, i + 8); j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 70) {
            ctx.save()
            ctx.globalAlpha = (1 - dist / 70) * 0.1
            ctx.strokeStyle = 'rgba(180, 160, 255, 1)'
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      drawConnections()
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0
      }}
    />
  )
}
