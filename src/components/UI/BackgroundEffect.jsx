import React, { useEffect, useRef } from 'react'
import './BackgroundEffect.css'

const BackgroundEffect = () => {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrame
    let particles = []
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    const createParticles = () => {
      particles = []
      const count = Math.floor((canvas.width * canvas.height) / 20000)
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * 0.25 + 0.05,
          color: Math.random() > 0.5 ? '16, 185, 129' : '139, 92, 246'
        })
      }
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.x += particle.speedX
        particle.y += particle.speedY
        
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
        
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 12
        )
        gradient.addColorStop(0, `rgba(${particle.color}, ${particle.opacity})`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 12, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })
      
      animationFrame = requestAnimationFrame(animate)
    }
    
    resize()
    createParticles()
    animate()
    
    window.addEventListener('resize', () => {
      resize()
      createParticles()
    })
    
    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [])
  
  return (
    <>
      <canvas ref={canvasRef} className="background-canvas" />
      <div className="background-glow background-glow--1" />
      <div className="background-glow background-glow--2" />
      <div className="background-glow background-glow--3" />
      <div className="background-glow background-glow--4" />
      <div className="background-glow background-glow--5" />
      <div className="background-grid" />
    </>
  )
}

export default BackgroundEffect
