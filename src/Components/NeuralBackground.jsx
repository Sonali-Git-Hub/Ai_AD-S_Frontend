import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const NeuralBackground = () => {
  const { theme } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle and connection settings (Heavy Effect)
    const PARTICLE_COUNT = Math.min(window.innerWidth / 8, 250); // Heavy but responsive
    const MAX_DISTANCE = 140;
    const MOUSE_RADIUS = 200;

    let particles = [];
    const mouse = { x: null, y: null };

    // Mouse tracking
    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#06080F' : '#f8f9fc';
    const pColor1 = isDark ? '#8b5cf6' : '#6366f1'; // Purple/Indigo
    const pColor2 = isDark ? '#3b82f6' : '#22d3ee'; // Blue/Cyan

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2.5 + 1;
        this.color = Math.random() > 0.5 ? pColor1 : pColor2;
        this.angle = Math.random() * 360;
        this.spin = (Math.random() - 0.5) * 0.05;
      }

      update() {
        // Natural movement
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.spin;

        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Mouse interaction (Repel and Swirl)
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < MOUSE_RADIUS) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
            
            // Push away
            this.x -= forceDirectionX * force * 3;
            this.y -= forceDirectionY * force * 3;
          }
        }
      }

      draw() {
        // Glowing core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset for lines
      }
    }

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    // Intense gradient background orbs
    let time = 0;

    const animate = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Background Ambient Clouds ──
      const cx1 = canvas.width * 0.3 + Math.sin(time) * 200;
      const cy1 = canvas.height * 0.4 + Math.cos(time * 0.8) * 200;
      const cloud1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, 600);
      cloud1.addColorStop(0, 'rgba(139, 92, 246, 0.12)'); // Purple
      cloud1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      const cx2 = canvas.width * 0.7 + Math.cos(time * 1.2) * 200;
      const cy2 = canvas.height * 0.6 + Math.sin(time * 0.9) * 200;
      const cloud2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 700);
      cloud2.addColorStop(0, 'rgba(59, 130, 246, 0.1)'); // Blue
      cloud2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = cloud1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = cloud2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ── Update and Draw Lines ──
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < MAX_DISTANCE) {
            const opacity = 1 - (distance / MAX_DISTANCE);
            ctx.beginPath();
            
            // Create gradient line between nodes to mix colors
            const lineGradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            lineGradient.addColorStop(0, particles[i].color.replace(')', `, ${opacity * 0.6})`).replace('rgb', 'rgba'));
            lineGradient.addColorStop(1, particles[j].color.replace(')', `, ${opacity * 0.6})`).replace('rgb', 'rgba'));
            // Since colors are hex, need fallback rgba translation
            const c1 = particles[i].color === '#8b5cf6' ? `rgba(139, 92, 246, ${opacity * 0.6})` : `rgba(59, 130, 246, ${opacity * 0.6})`;
            const c2 = particles[j].color === '#8b5cf6' ? `rgba(139, 92, 246, ${opacity * 0.6})` : `rgba(59, 130, 246, ${opacity * 0.6})`;
            
            const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            gradient.addColorStop(0, c1);
            gradient.addColorStop(1, c2);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#06080F' : '#f8f9fc';

  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 ${isDark ? 'bg-[#06080F]' : 'bg-[#f8f9fc]'}`}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
      {/* Heavy vignette overlay for dramatic cinematic focus */}
      <div 
        className="fixed inset-0 opacity-80" 
        style={{ background: `radial-gradient(circle at center, transparent 0%, ${bgColor} 100%)` }}
      />
    </div>
  );
};

export default NeuralBackground;
