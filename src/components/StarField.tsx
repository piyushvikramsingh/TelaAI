import React, { useEffect, useRef } from 'react';

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const stars: Array<{ 
      x: number; 
      y: number; 
      z: number;
      size: number; 
      speed: number; 
      opacity: number;
      pulseSpeed: number;
      type: 'normal' | 'bright' | 'twinkling';
    }> = [];
    
    // Create different types of stars
    for (let i = 0; i < 300; i++) {
      const type = Math.random() < 0.1 ? 'bright' : Math.random() < 0.3 ? 'twinkling' : 'normal';
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: type === 'bright' ? Math.random() * 3 + 1 : Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.05,
        opacity: type === 'normal' ? Math.random() * 0.8 + 0.2 : Math.random() * 0.6 + 0.4,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        type
      });
    }

    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Clear with slight fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        // Update position
        star.z -= star.speed * 2;
        
        // Reset star position when it gets too close
        if (star.z <= 0) {
          star.z = 1000;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }

        // Calculate 3D projection
        const x = (star.x - canvas.width / 2) * (200 / star.z) + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * (200 / star.z) + canvas.height / 2;
        
        // Calculate size based on distance
        const size = star.size * (200 / star.z);
        
        // Skip if star is off screen
        if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) return;

        // Calculate opacity based on type and animation
        let opacity = star.opacity;
        
        if (star.type === 'twinkling') {
          opacity *= 0.5 + 0.5 * Math.sin(time * 5 + star.x * 0.01);
        } else if (star.type === 'bright') {
          opacity *= 0.7 + 0.3 * Math.sin(time * 2 + star.y * 0.01);
        }

        // Apply distance fade
        opacity *= Math.min(1, (1000 - star.z) / 300);

        ctx.globalAlpha = opacity;
        
        // Draw star with glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw bright core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();

        // Add motion trails for bright stars
        if (star.type === 'bright' && star.z < 500) {
          const trailLength = (500 - star.z) / 20;
          ctx.globalAlpha = opacity * 0.3;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x - trailLength, y - 0.5, trailLength, 1);
        }
      });

      ctx.globalAlpha = 1;
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
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%)' }}
    />
  );
};

export default StarField;
