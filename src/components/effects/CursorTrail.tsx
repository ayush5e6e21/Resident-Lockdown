import { useEffect, useRef, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

export function CursorTrail() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Detect touch-only devices (no hover capability)
    const mq = window.matchMedia('(hover: none)');
    setIsTouchDevice(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Skip the entire canvas animation on touch devices
    if (isTouchDevice) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      trailRef.current.push({
        x: e.clientX,
        y: e.clientY,
        age: 0
      });

      if (trailRef.current.length > 25) {
        trailRef.current.shift();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw trail
      trailRef.current = trailRef.current.filter(point => {
        point.age += 1;
        return point.age < 30;
      });

      trailRef.current.forEach((point, index) => {
        const alpha = 1 - point.age / 30;
        const size = (1 - point.age / 30) * 6;

        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size
        );
        gradient.addColorStop(0, `rgba(220, 38, 38, ${alpha * 0.8})`);
        gradient.addColorStop(0.5, `rgba(220, 38, 38, ${alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(220, 38, 38, 0)');

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw connection line
        if (index < trailRef.current.length - 1) {
          const nextPoint = trailRef.current[index + 1];
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(nextPoint.x, nextPoint.y);
          ctx.strokeStyle = `rgba(220, 38, 38, ${alpha * 0.2})`;
          ctx.lineWidth = size * 0.4;
          ctx.stroke();
        }
      });

      // Draw main cursor glow
      const mouse = mouseRef.current;
      const cursorGradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 15
      );
      cursorGradient.addColorStop(0, 'rgba(220, 38, 38, 0.6)');
      cursorGradient.addColorStop(0.5, 'rgba(220, 38, 38, 0.2)');
      cursorGradient.addColorStop(1, 'rgba(220, 38, 38, 0)');

      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = cursorGradient;
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isTouchDevice]);

  // Don't render canvas on touch devices
  if (isTouchDevice) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
