import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  pulsePhase: number;
}

export function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Loopay gradient colors: #C77D45 (orange), #B23B2F (red), #4A3535 (brown), #2C4A6B (navy), #4A7DC4 (blue), #6BA3E8 (light blue)
    const loopayColors = [
      '#C77D45', '#B23B2F', '#4A3535', '#2C4A6B', '#4A7DC4', '#6BA3E8'
    ];

    // Particle system
    const particles: Particle[] = [];
    const particleCount = 100;
    const connectionDistance = 180;
    const maxSpeed = 0.8;

    // Initialize particles with Loopay colors
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * maxSpeed,
        vy: (Math.random() - 0.5) * maxSpeed,
        size: Math.random() * 3 + 1.5,
        color: loopayColors[Math.floor(Math.random() * loopayColors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Animation loop
    const animate = () => {
      // Clear with fade effect for trails
      ctx.fillStyle = 'rgba(17, 19, 23, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update pulse phase
        particle.pulsePhase += 0.02;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges with some damping
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.vx = -particle.vx;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.vy = -particle.vy;
        }

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Draw particle with pulsing effect
        const pulseSize = particle.size * (1 + Math.sin(particle.pulsePhase) * 0.3);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);

        // Add glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, pulseSize * 2
        );
        gradient.addColorStop(0, particle.color + '80'); // Semi-transparent center
        gradient.addColorStop(1, particle.color + '20'); // More transparent edge

        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Draw connections
        particles.forEach((otherParticle, j) => {
          if (i === j) return;

          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.4;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);

            // Create gradient line between particles
            const lineGradient = ctx.createLinearGradient(
              particle.x, particle.y,
              otherParticle.x, otherParticle.y
            );
            lineGradient.addColorStop(0, particle.color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
            lineGradient.addColorStop(1, otherParticle.color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));

            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}






