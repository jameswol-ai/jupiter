/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { JupitorMetrics, MoonType, JupitorParams, MoonState } from '../types';
import { MOON_CONFIGS } from '../simulation';
import { Activity, Compass, Gauge, Landmark, Shield, Sparkles, Orbit, Sun, Moon, Zap, ArrowUpRight } from 'lucide-react';

interface TelemetryPanelProps {
  metrics: JupitorMetrics;
  params: JupitorParams;
  moonsState: Record<MoonType, MoonState>;
}

export default function TelemetryPanel({ metrics, params, moonsState }: TelemetryPanelProps) {
  const selectedMoonConfig = MOON_CONFIGS[params.selectedMoon];
  const selectedMoonState = moonsState[params.selectedMoon];

  // Laplace Resonance Phase (Coherence metric, close to 1 is aligned)
  const isResonating = Math.abs(metrics.laplaceResonancePhase) > 0.85;

  // Selected moon real-time speed in visual pixels scaled to physics km/s
  // Circular orbit velocity is approx 17.3 km/s for Io, 13.7 km/s for Europa, 10.9 km/s for Ganymede, 8.2 km/s for Callisto.
  // We scale the simulated velocities to look authentic.
  const visualSpeedFactor = 3.5;
  const currentSpeedKmS = (Math.sqrt(selectedMoonState.vx * selectedMoonState.vx + selectedMoonState.vy * selectedMoonState.vy) * visualSpeedFactor).toFixed(1);

  // Slingshot velocity score representation (1 pixel/frame ~ 5 km/s)
  const peakSpeedKmS = (metrics.maxSlingshotSpeed * 5).toFixed(1);

  return (
    <div className="flex flex-col gap-5 p-5 bg-[#0e0e16]/90 border border-gray-800/40 rounded-2xl h-full shadow-lg">
      
      {/* HUD Header */}
      <div className="flex items-center gap-2 border-b border-gray-800/60 pb-3">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-sans font-semibold tracking-wider text-gray-200">ORBITAL METRIC ENGINE</h3>
      </div>

      {/* Primary Moon Telemetry Details Card */}
      <div className="flex flex-col gap-3.5 bg-black/40 border border-gray-800/50 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-gray-400 tracking-wider">SELECTED TARGET:</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 uppercase">
            {selectedMoonConfig.name}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Orbital Radius */}
          <div>
            <span className="text-[9px] font-mono text-gray-500 block">ORBITAL SEMI-MAJOR AXIS</span>
            <span className="text-sm font-mono font-bold text-gray-200">
              {selectedMoonConfig.orbitalRadiusKm.toLocaleString()} km
            </span>
          </div>

          {/* Orbital Speed */}
          <div>
            <span className="text-[9px] font-mono text-gray-500 block">INSTANTANEOUS VELOCITY</span>
            <span className="text-sm font-mono font-bold text-cyan-400">
              {currentSpeedKmS} km/s
            </span>
          </div>

          {/* Mass */}
          <div>
            <span className="text-[9px] font-mono text-gray-500 block">MASS VALUE</span>
            <span className="text-sm font-mono font-bold text-gray-200">
              {selectedMoonConfig.massKg} kg
            </span>
          </div>

          {/* Physical Radius */}
          <div>
            <span className="text-[9px] font-mono text-gray-500 block">PHYSICAL RADIUS</span>
            <span className="text-sm font-mono font-bold text-gray-200">
              {selectedMoonConfig.physicalRadiusKm} km
            </span>
          </div>
        </div>

        {/* Life Potential indicator */}
        <div className="border-t border-gray-800/40 pt-2.5 mt-1 flex items-center justify-between text-[10px] font-mono">
          <span className="text-gray-500">ASTROBIOLOGICAL LIFE SCALE:</span>
          <span className={`font-semibold ${selectedMoonConfig.lifeProbability.includes('High') ? 'text-emerald-400' : selectedMoonConfig.lifeProbability.includes('Medium') ? 'text-purple-400' : 'text-gray-500'}`}>
            {selectedMoonConfig.lifeProbability.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Laplace Resonance Multi-Moon Sync Dial (Aesthetic high-fidelity visual) */}
      <div className="flex flex-col gap-3 bg-black/30 border border-gray-800/40 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-400 tracking-wider">LAPLACE ALIGNMENT PHASE</span>
          <span className={`text-[9px] font-mono font-bold flex items-center gap-1 px-1.5 py-0.5 rounded ${isResonating ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-amber-950/40 text-amber-400 border border-amber-500/10'}`}>
            <Sparkles className="w-2.5 h-2.5 animate-pulse" />
            {isResonating ? 'STABLE RESONANCE' : 'COHERENT'}
          </span>
        </div>

        {/* Radial Orbit Phase Rings drawing */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 bg-black/60 border border-gray-800/60 rounded-full flex items-center justify-center shrink-0">
            {/* SVG Orbits represent Io (inner), Europa (mid), Ganymede (outer) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              {/* Orbits */}
              <circle cx="50" cy="50" r="16" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
              {/* Jupiter core */}
              <circle cx="50" cy="50" r="6" fill="#eab308" opacity="0.85" />

              {/* Io dot */}
              <circle 
                cx={50 + 16 * Math.cos(moonsState.io.angle)} 
                cy={50 + 16 * Math.sin(moonsState.io.angle)} 
                r="2.5" 
                fill="#eab308" 
              />

              {/* Europa dot */}
              <circle 
                cx={50 + 28 * Math.cos(moonsState.europa.angle)} 
                cy={50 + 28 * Math.sin(moonsState.europa.angle)} 
                r="2.2" 
                fill="#38bdf8" 
              />

              {/* Ganymede dot */}
              <circle 
                cx={50 + 40 * Math.cos(moonsState.ganymede.angle)} 
                cy={50 + 40 * Math.sin(moonsState.ganymede.angle)} 
                r="3" 
                fill="#a855f7" 
              />
            </svg>
          </div>

          <div className="flex flex-col justify-center gap-2">
            <div>
              <span className="text-[9px] font-mono text-gray-500 block leading-none">ELAPSED TIME SCALE</span>
              <span className="text-base font-mono font-bold text-gray-200">
                {metrics.simTimeDays.toFixed(1)} Earth Days
              </span>
            </div>
            <div className="border-t border-gray-800/40 my-0.5" />
            <div>
              <span className="text-[9px] font-mono text-gray-500 block leading-none">ORBIT RATIO RATE</span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                4 : 2 : 1 resonance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Space Probes slingshot statistics */}
      <div className="flex flex-col gap-2.5 bg-black/20 border border-gray-800/30 p-4 rounded-xl">
        <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase">SLINGSHOT FLIGHT DECK</span>

        {/* Peak slingshot score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[11px] font-mono text-gray-400">Peak Slingshot Speed</span>
          </div>
          <span className="text-xs font-mono font-bold text-rose-400">
            {metrics.maxSlingshotSpeed > 0 ? `${peakSpeedKmS} km/s` : '---'}
          </span>
        </div>

        {/* Probes launched */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] font-mono text-gray-400">Probes Launched</span>
          </div>
          <span className="text-xs font-mono font-semibold text-gray-300">
            {metrics.probesLaunched} probes
          </span>
        </div>

        {/* Active Probes */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] font-mono text-gray-400">Active Orbiting Probes</span>
          </div>
          <span className="text-xs font-mono font-semibold text-cyan-400">
            {metrics.activeProbes} probes
          </span>
        </div>

        {/* Shadow Eclipse Status */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/30">
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-mono text-gray-400">Shadow Cone Status</span>
          </div>
          <span className={`text-[10px] font-mono font-bold ${selectedMoonState.isEclipsed ? 'text-red-400' : 'text-emerald-400'}`}>
            {selectedMoonState.isEclipsed ? 'ECLIPSED (DARK)' : 'SUNLIT'}
          </span>
        </div>
      </div>
    </div>
  );
}
