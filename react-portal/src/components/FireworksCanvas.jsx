import { useEffect, useRef } from 'react';

// Vivid colour palettes — each burst uses one palette for coherence
const PALETTES = [
  ['#ff4757', '#ff6b81', '#ff8fa3'],
  ['#ffd32a', '#ffdd59', '#fff3a3'],
  ['#0be881', '#0fbcf9', '#7efff5'],
  ['#a29bfe', '#fd79a8', '#e84393'],
  ['#ff9f43', '#feca57', '#ff6348'],
  ['#1dd1a1', '#10ac84', '#55efc4'],
  ['#74b9ff', '#0984e3', '#a4c8ff'],
];

export default function FireworksCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const rockets = [];

    // ── Spark — plain circles, no shadowBlur (perf) ─────────
    class Spark {
      constructor(x, y, vx, vy, color, size = 2, life = 1) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.color = color;
        this.size = size;
        this.alpha = life;
        this.decay = 0.014 + Math.random() * 0.01;
      }
      update() {
        this.vx *= 0.97;
        this.vy = this.vy * 0.97 + 0.18;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw() {
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Rising rocket ────────────────────────────────────────
    class Rocket {
      constructor() {
        this.x = canvas.width * (0.1 + Math.random() * 0.8);
        this.y = canvas.height + 10;
        this.targetY = canvas.height * (0.08 + Math.random() * 0.40);
        this.vy = -(16 + Math.random() * 8);
        this.palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        this.exploded = false;
        this.trail = [];
      }
      update() {
        this.vy += 0.32;
        this.y += this.vy;
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();
        if (this.y <= this.targetY || this.vy >= 0) {
          this.exploded = true;
          this.burst();
        }
      }
      burst() {
        const count = 80 + Math.floor(Math.random() * 40);
        const isRing = Math.random() < 0.4;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
          const speed = isRing
            ? (Math.random() < 0.5 ? 6 : 3) * (0.85 + Math.random() * 0.3)
            : 2 + Math.random() ** 0.8 * 7;
          const color = this.palette[Math.floor(Math.random() * this.palette.length)];
          particles.push(new Spark(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 1.6 + Math.random() * 1.4));
        }
        // White flash
        particles.push(new Spark(this.x, this.y, 0, 0, '#ffffff', 10, 0.5));
        // Slow glitter
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.8 + Math.random() * 3;
          const color = this.palette[Math.floor(Math.random() * this.palette.length)];
          const s = new Spark(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 2);
          s.decay = 0.005 + Math.random() * 0.005;
          particles.push(s);
        }
      }
      draw() {
        // Rocket trail — no shadow, just fading dots
        ctx.fillStyle = '#fff9c4';
        this.trail.forEach((t, idx) => {
          ctx.globalAlpha = (idx / this.trail.length) * 0.5;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
        // Head
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const launchRocket = () => rockets.push(new Rocket());

    const timers = [];
    [0, 400, 800, 1200, 1700, 2200, 2700, 3100, 3500, 3900].forEach((d) => {
      timers.push(setTimeout(launchRocket, d));
    });
    // Finale burst
    [4200, 4250, 4300, 4350].forEach((d) => {
      timers.push(setTimeout(launchRocket, d));
    });

    let animFrame;
    const animate = () => {
      // Clear fully — transparent, no black background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;

      for (let i = rockets.length - 1; i >= 0; i--) {
        if (!rockets[i].exploded) { rockets[i].update(); rockets[i].draw(); }
        else rockets.splice(i, 1);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha > 0) particles[i].draw();
        else particles.splice(i, 1);
      }

      ctx.globalAlpha = 1;
      animFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrame);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
