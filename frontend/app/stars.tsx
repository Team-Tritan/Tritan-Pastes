"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  alphaChange: number;
}
interface ShootingStar {
  x: number;
  y: number;
  len: number;
  speed: number;
  angle: number;
  life: number;
}

const ShootingStarsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hexToRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };

  const starColor = hexToRGB("#7c3aed");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };
    window.addEventListener("resize", handleResize);

    let stars: Star[] = [];
    const numStars = 150;
    const shootingStars: ShootingStar[] = [];
    const maxShootingStars = 3;

    const initStars = () => {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random(),
          alphaChange: 0.005 + Math.random() * 0.005,
        });
      }
    };
    initStars();

    const addShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * (height / 2),
        len: Math.random() * 80 + 10,
        speed: Math.random() * 10 + 6,
        angle: Math.PI / 4,
        life: 0,
      });
    };

    let lastTime = performance.now();
    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      ctx.fillStyle = "#0B0C10"; // dark...
      ctx.fillRect(0, 0, width, height);

      // stationary glowing stars
      for (const star of stars) {
        star.alpha += star.alphaChange;
        if (star.alpha <= 0 || star.alpha >= 1)
          star.alphaChange = -star.alphaChange;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor},${star.alpha.toFixed(2)})`;
        ctx.fill();
      }

      // shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.speed * Math.cos(s.angle);
        s.y += s.speed * Math.sin(s.angle);
        s.life += deltaTime;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - s.len * Math.cos(s.angle),
          s.y - s.len * Math.sin(s.angle)
        );
        const grad = ctx.createLinearGradient(
          s.x,
          s.y,
          s.x - s.len * Math.cos(s.angle),
          s.y - s.len * Math.sin(s.angle)
        );
        grad.addColorStop(0, "white");
        grad.addColorStop(1, "rgba(138,43,226,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
        if (s.x > width || s.y > height) shootingStars.splice(i, 1);
      }

      if (shootingStars.length < maxShootingStars && Math.random() < 0.01) {
        addShootingStar();
      }
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    return () => window.removeEventListener("resize", handleResize);
  }, [starColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: "#111" }}
    />
  );
};

export default ShootingStarsBackground;
