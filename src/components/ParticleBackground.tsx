'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ParticleBackgroundProps {
  disabled?: boolean;
  particleCount?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

export default function ParticleBackground({ 
  disabled = false, 
  particleCount = 50, // 기본값 80에서 50으로 감소
  className = '' 
}: ParticleBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();
    const [isVisible, setIsVisible] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
        
        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Intersection Observer for visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (canvasRef.current) {
            observer.observe(canvasRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        // Don't animate if disabled, reduced motion preferred, or not visible
        if (disabled || prefersReducedMotion || !isVisible) {
            return;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Palantir-style Particle system
        const particles: Particle[] = [];
        const colors = ['#8B5CF6', '#3B82F6', '#6366F1']; // Purple-Blue palette

        // Create particles with dynamic count
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 1.2 + 0.3, // Smaller, more subtle particles
                opacity: Math.random() * 0.08 + 0.03, // More subtle opacity
                color: colors[Math.floor(Math.random() * colors.length)],
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01
            });
        }

        let time = 0;
        let lastFrameTime = 0;
        const targetFPS = 30; // 30 FPS로 제한
        const frameInterval = 1000 / targetFPS;

        // Optimized animation loop with FPS limiting
        const animate = (currentTime: number = 0) => {
            if (currentTime - lastFrameTime < frameInterval) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }
            
            lastFrameTime = currentTime;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.01;

            particles.forEach((particle, index) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.pulse += particle.pulseSpeed;

                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                // Pulsing effect - 더 서브틀하게
                const pulseSize = particle.size + Math.sin(particle.pulse) * 0.2;
                const pulseOpacity = particle.opacity + Math.sin(particle.pulse) * 0.03;

                // Palantir-style subtle glow effect
                ctx.save();
                ctx.globalAlpha = pulseOpacity * 0.06; // Even more subtle glow
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, pulseSize * 2.5, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, pulseSize * 2.5
                );
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.restore();

                // Draw main particle
                ctx.save();
                ctx.globalAlpha = pulseOpacity;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
                ctx.restore();

                // Draw connections with nearby particles (optimized)
                if (index % 2 === 0) { // Only draw connections for every other particle to reduce computation
                    particles.slice(index + 1, index + 4).forEach(otherParticle => { // Limit to 3 nearest particles
                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 80) { // Palantir-style shorter connections
                            ctx.save();
                            ctx.globalAlpha = (80 - distance) / 80 * 0.015; // More subtle connections
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(otherParticle.x, otherParticle.y);
                            ctx.strokeStyle = particle.color;
                            ctx.lineWidth = 0.2; // Thinner lines
                            ctx.stroke();
                            ctx.restore();
                        }
                    });
                }
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [disabled, prefersReducedMotion, isVisible, particleCount]);

    // Show nothing if disabled or reduced motion
    if (disabled || prefersReducedMotion) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none z-0 opacity-10 ${className}`}
            style={{ background: 'transparent' }}
        />
    );
}