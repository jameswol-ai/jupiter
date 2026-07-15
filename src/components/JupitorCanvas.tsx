/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { JupitorParams, MoonType, Probe, MoonState } from '../types';
import { MOON_CONFIGS, JupitorPhysicsEngine } from '../simulation';
import { Wind, Play, RotateCcw, AlertCircle, Crosshair, HelpCircle, Compass, Target } from 'lucide-react';

interface JupitorCanvasProps {
  engine: JupitorPhysicsEngine;
  params: JupitorParams;
  setParams: React.Dispatch<React.SetStateAction<JupitorParams>>;
  onLaunchProbe: (x: number, y: number, vx: number, vy: number) => void;
  onClearProbes: () => void;
}

export default function JupitorCanvas({
  engine,
  params,
  setParams,
  onLaunchProbe,
  onClearProbes,
}: JupitorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Drag launcher states
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isHoveredBody, setIsHoveredBody] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });

  // Procedural background stars
  const starsRef = useRef<{ x: number; y: number; size: number; alpha: number }[]>([]);
  if (starsRef.current.length === 0) {
    const stars = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
    starsRef.current = stars;
  }

  // Handle resizing of container
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const rect = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({
          width: Math.max(400, rect.width),
          height: Math.max(350, rect.height),
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Quick delay check to make sure rendering layout is perfect
    const timer = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Frame tick render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const w = dimensions.width;
      const h = dimensions.height;
      
      ctx.clearRect(0, 0, w, h);

      // Coordinates transform: Center of canvas is (cx, cy)
      const cx = w / 2;
      const cy = h / 2;

      // 1. Draw space background with fading dust gas
      ctx.fillStyle = '#06060c';
      ctx.fillRect(0, 0, w, h);

      // Deep space atmospheric glow
      const radialDust = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(w, h) * 0.75);
      radialDust.addColorStop(0, '#090a16');
      radialDust.addColorStop(0.5, '#05050b');
      radialDust.addColorStop(1, '#020204');
      ctx.fillStyle = radialDust;
      ctx.fillRect(0, 0, w, h);

      // Draw starry sky
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      starsRef.current.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * (0.8 + 0.2 * Math.sin(Date.now() * 0.001 * star.size))})`;
        ctx.fillRect(star.x * w, star.y * h, star.size, star.size);
      });

      // 2. Draw Jupiter Faint Dust Rings
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.06)'; // amber-600 translucent
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38, 12, Math.PI / 12, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.04)'; // amber-400 translucent
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 45, 14, Math.PI / 12, 0, 2 * Math.PI);
      ctx.stroke();

      // 3. Draw Orbit Tracks for Galilean Moons
      if (params.showOrbits) {
        const visualRadii = [62, 105, 160, 230];
        const moonIds: MoonType[] = ['io', 'europa', 'ganymede', 'callisto'];

        moonIds.forEach((id, idx) => {
          const orbitR = visualRadii[idx];
          const isSelected = params.selectedMoon === id;
          
          ctx.strokeStyle = isSelected 
            ? 'rgba(34, 211, 238, 0.25)' // bright cyan for selection
            : 'rgba(255, 255, 255, 0.05)';
          
          ctx.lineWidth = isSelected ? 1.5 : 0.8;
          ctx.setLineDash(isSelected ? [4, 4] : [2, 8]);
          
          ctx.beginPath();
          ctx.arc(cx, cy, orbitR, 0, 2 * Math.PI);
          ctx.stroke();
        });
        ctx.setLineDash([]); // Reset dash
      }

      // 4. Draw Shadow Cone Cast by Jupiter
      // Light comes from the left (Sun at x = -infinity)
      // Shadow is a dark wedge going rightward from x = cx + jupiterRadius
      const jupVisualRadius = 24;
      const shadowGradient = ctx.createLinearGradient(cx + jupVisualRadius, cy - jupVisualRadius, cx + 320, cy);
      shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      shadowGradient.addColorStop(0.5, 'rgba(2, 2, 8, 0.45)');
      shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.moveTo(cx + jupVisualRadius - 2, cy - jupVisualRadius + 4);
      ctx.lineTo(cx + 320, cy - jupVisualRadius - 15);
      ctx.lineTo(cx + 320, cy + jupVisualRadius + 15);
      ctx.lineTo(cx + jupVisualRadius - 2, cy + jupVisualRadius - 4);
      ctx.closePath();
      ctx.fill();

      // 5. Draw Moons Trails & Moon Bodies
      const moonIds: MoonType[] = ['io', 'europa', 'ganymede', 'callisto'];
      moonIds.forEach((id) => {
        const state = engine.moons[id];
        const config = MOON_CONFIGS[id];
        const isSelected = params.selectedMoon === id;

        const mx = cx + state.x;
        const my = cy + state.y;

        // Draw glowing tail trail
        if (state.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(cx + state.trail[0].x, cy + state.trail[0].y);
          for (let i = 1; i < state.trail.length; i++) {
            ctx.lineTo(cx + state.trail[i].x, cy + state.trail[i].y);
          }
          const grad = ctx.createLinearGradient(cx + state.trail[0].x, cy + state.trail[0].y, mx, my);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(1, config.color + '33'); // translucent hex color
          ctx.strokeStyle = grad;
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.stroke();
        }

        // Draw Moon selection ring
        if (isSelected) {
          ctx.strokeStyle = '#22d3ee'; // cyan-400
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(mx, my, config.radius + 6, 0, 2 * Math.PI);
          ctx.stroke();
        }

        // Draw moon shadow overlay if eclipsed (darken visual look)
        const currentGlow = state.isEclipsed ? 'rgba(0,0,0,0)' : config.glowColor;
        const currentFill = state.isEclipsed ? '#1c1917' : config.color; // rock-grey if eclipsed

        // Draw glowing pulse sphere
        ctx.shadowColor = currentGlow;
        ctx.shadowBlur = state.isEclipsed ? 0 : 12;
        ctx.fillStyle = currentFill;
        ctx.beginPath();
        ctx.arc(mx, my, config.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Add subtle labels
        ctx.fillStyle = isSelected ? '#e2e8f0' : '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText(config.name.toUpperCase(), mx + config.radius + 6, my + 3);

        // Render Eclipse notification on canvas
        if (state.isEclipsed) {
          ctx.fillStyle = '#ef4444'; // red-500
          ctx.font = '8px monospace';
          ctx.fillText('ECLIPSED', mx + config.radius + 6, my - 6);
        }
      });

      // 6. Draw Jupiter with rotating cloud bands and Great Red Spot
      // Jupiter Glow Aura
      const jupGlow = ctx.createRadialGradient(cx, cy, jupVisualRadius - 2, cx, cy, jupVisualRadius + 22);
      jupGlow.addColorStop(0, 'rgba(217, 119, 6, 0.12)'); // amber
      jupGlow.addColorStop(0.5, 'rgba(239, 68, 68, 0.05)'); // red
      jupGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = jupGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, jupVisualRadius + 22, 0, 2 * Math.PI);
      ctx.fill();

      // Jupiter Body
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, jupVisualRadius, 0, 2 * Math.PI);
      ctx.clip(); // Mask within sphere limits

      // Render planetary gas band textures
      const bandY = [
        { y: -24, h: 6, color: '#451a03' }, // dark chocolate
        { y: -18, h: 4, color: '#7c2d12' }, // reddish brown
        { y: -14, h: 7, color: '#fed7aa' }, // peach beige
        { y: -7, h: 6, color: '#f97316' },  // vibrant orange
        { y: -1, h: 5, color: '#ffedd5' },  // cream white
        { y: 4, h: 6, color: '#7c2d12' },   // reddish brown
        { y: 10, h: 4, color: '#fed7aa' },  // peach beige
        { y: 14, h: 10, color: '#451a03' }  // dark chocolate
      ];

      // Time rotation factor
      const tRotation = (Date.now() * 0.005) % jupVisualRadius;

      bandY.forEach((band) => {
        ctx.fillStyle = band.color;
        ctx.fillRect(cx - jupVisualRadius, cy + band.y, jupVisualRadius * 2, band.h);
        
        // Dynamic swirl details
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(cx - jupVisualRadius + tRotation, cy + band.y, 6, band.h);
        ctx.fillRect(cx - jupVisualRadius + ((tRotation + 16) % (jupVisualRadius * 2)), cy + band.y, 4, band.h);
      });

      // The Great Red Spot (at bottom right band quadrant)
      ctx.fillStyle = '#b91c1c'; // deep brick-red
      ctx.beginPath();
      ctx.ellipse(cx + 10, cy + 8, 5, 3.2, 0, 0, 2 * Math.PI);
      ctx.fill();
      // White highlight outline on Spot
      ctx.strokeStyle = '#ffedd5';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore(); // Stop clipping

      // Outer atmosphere rim lighting (shading overlay)
      const jupShade = ctx.createRadialGradient(cx - 10, cy - 10, 2, cx, cy, jupVisualRadius);
      jupShade.addColorStop(0, 'rgba(255, 255, 255, 0.08)'); // slight highlight from sun
      jupShade.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
      jupShade.addColorStop(1, 'rgba(0, 0, 0, 0.85)'); // dark shadows on nightside (right)
      ctx.fillStyle = jupShade;
      ctx.beginPath();
      ctx.arc(cx, cy, jupVisualRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Jupiter text label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('JUPITER', cx, cy - jupVisualRadius - 6);
      ctx.textAlign = 'left';

      // 7. Draw Custom Space Probes
      engine.probes.forEach((probe) => {
        if (probe.status !== 'active') return;

        const px = cx + probe.x;
        const py = cy + probe.y;

        // Draw probe trail (cyan glow)
        if (probe.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(cx + probe.trail[0].x, cy + probe.trail[0].y);
          for (let i = 1; i < probe.trail.length; i++) {
            ctx.lineTo(cx + probe.trail[i].x, cy + probe.trail[i].y);
          }
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)'; // cyan trail
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Draw probe body
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        // Dynamic Speed Assist Indicator (highlight when undergoing high velocity slingshot!)
        const speed = Math.sqrt(probe.vx * probe.vx + probe.vy * probe.vy);
        if (speed > 28) {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)'; // rose glow
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px, py, 6 + Math.sin(Date.now() * 0.01) * 2, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.fillStyle = '#f43f5e';
          ctx.font = '7px monospace';
          ctx.fillText(`GRAVITY ASSIST! ${(speed * 5).toFixed(0)} km/s`, px + 8, py - 4);
        }
      });

      // 8. Draw launch slingshot guide vector (when dragging)
      if (dragStart && dragCurrent) {
        const startX = dragStart.x;
        const startY = dragStart.y;
        const currX = dragCurrent.x;
        const currY = dragCurrent.y;

        // Calculate launch speed vector
        const dx = startX - currX;
        const dy = startY - currY;
        const length = Math.sqrt(dx * dx + dy * dy);

        // Draw elastic slingshot rubber line
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)'; // cyan-400
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currX, currY);
        ctx.stroke();

        // Draw launch guide circle
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(startX, startY, length, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw predicted path (simple straight line first projection)
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)'; // red dotted target trajectory
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        // Project vector forward
        const scale = 3.0; // visual scaling projection
        ctx.lineTo(startX + dx * scale, startY + dy * scale);
        ctx.stroke();
        ctx.setLineDash([]);

        // Launch anchor circles
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(startX, startY, 4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(currX, currY, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Hud indicator near drag
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px monospace';
        const estSpeed = (length * 0.05 * params.launchVelocity).toFixed(1);
        ctx.fillText(`V_launch: ${estSpeed} km/s`, startX + 12, startY - 12);
      }

      // 9. Gravity Vector Sensor Fields (Dynamic interactive vector field visualizer)
      if (params.showGravitySensors && !dragStart) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 0.8;
        const spacing = 35;
        for (let x = spacing / 2; x < w; x += spacing) {
          for (let y = spacing / 2; y < h; y += spacing) {
            const rx = x - cx;
            const ry = y - cy;
            const dSq = rx * rx + ry * ry;
            const d = Math.sqrt(dSq);
            
            if (d < jupVisualRadius + 10) continue;

            // Draw field vector tick pointing to Jupiter center, with size proportional to force
            const maxF = 4.0;
            const force = Math.min(maxF, 1200 / dSq);
            const angle = Math.atan2(ry, rx);
            const vx = -Math.cos(angle) * force * 3;
            const vy = -Math.sin(angle) * force * 3;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + vx, y + vy);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, params]);

  // Click & Drag Launch handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked near a moon to select it
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const rx = x - cx;
    const ry = y - cy;

    let clickedMoon = false;
    const moonIds: MoonType[] = ['io', 'europa', 'ganymede', 'callisto'];
    moonIds.forEach((id) => {
      const state = engine.moons[id];
      const config = MOON_CONFIGS[id];
      const dx = rx - state.x;
      const dy = ry - state.y;
      if (dx * dx + dy * dy <= 144) { // 12 pixel radius check
        setParams((prev) => ({ ...prev, selectedMoon: id }));
        clickedMoon = true;
      }
    });

    if (!clickedMoon) {
      // Enter drag space probe mode
      setDragStart({ x, y });
      setDragCurrent({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragStart) {
      setDragCurrent({ x, y });
    } else {
      // Body hover detection
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      const rx = x - cx;
      const ry = y - cy;

      let hovered: string | null = null;
      const moonIds: MoonType[] = ['io', 'europa', 'ganymede', 'callisto'];
      moonIds.forEach((id) => {
        const state = engine.moons[id];
        const dx = rx - state.x;
        const dy = ry - state.y;
        if (dx * dx + dy * dy <= 100) {
          hovered = MOON_CONFIGS[id].name;
        }
      });

      if (rx * rx + ry * ry <= 576) { // Jupiter check
        hovered = 'Jupiter';
      }

      setIsHoveredBody(hovered);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStart || !dragCurrent) return;

    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    // Launch coordinates relative to center (0, 0)
    const launchX = dragStart.x - cx;
    const launchY = dragStart.y - cy;

    // Speed vector: opposite direction of the drag pull (elastic sling!)
    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;

    // Launch! Vector is scaled to match visual speed controls
    const scaleFactor = 0.05 * params.launchVelocity;
    const vx = dx * scaleFactor;
    const vy = dy * scaleFactor;

    onLaunchProbe(launchX, launchY, vx, vy);

    // Reset drag states
    setDragStart(null);
    setDragCurrent(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#08080f] rounded-2xl border border-gray-800/40 overflow-hidden shadow-2xl">
      
      {/* HUD Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex flex-col gap-0.5 bg-black/55 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-gray-800/60 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs font-mono font-bold text-gray-200 tracking-wider">
              {params.viewMode === 'orbit' ? 'ORBIT MAP (TOP-DOWN)' : params.viewMode === 'transit' ? 'TRANSIT SIDE PROFILE' : '3D TELESCOPE FEED'}
            </span>
          </div>
          <p className="text-[9px] font-mono text-cyan-400/80 leading-normal mt-1 flex items-center gap-1">
            <Target className="w-2.5 h-2.5" /> Drag & drag elastic sling to launch custom probes!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isHoveredBody && (
            <div className="bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/20 text-[10px] font-mono text-cyan-400 shadow-md">
              TARGET LOCKED: <span className="text-gray-100 font-bold">{isHoveredBody.toUpperCase()}</span>
            </div>
          )}
          
          <button
            onClick={onClearProbes}
            className="pointer-events-auto bg-black/55 hover:bg-red-950/30 text-gray-400 hover:text-red-400 border border-gray-800/60 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold tracking-wider transition-all shadow-md"
          >
            RESET PROBES
          </button>
        </div>
      </div>

      {/* Main Canvas Component */}
      <div className="flex-1 min-h-0 relative">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="absolute inset-0 w-full h-full cursor-crosshair block"
        />
      </div>

      {/* Active telemetry indicators in bottom border */}
      <div className="border-t border-gray-800/40 bg-black/40 px-5 py-2.5 flex items-center justify-between text-[10px] font-mono text-gray-500 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Io</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Europa</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Ganymede</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Callisto</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-cyan-400" />
          <span>Masses and gravity fully calculated at 60 Iterations/second.</span>
        </div>
      </div>
    </div>
  );
}
