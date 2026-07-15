/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { JupitorParams, MoonType } from '../types';
import { MOON_CONFIGS } from '../simulation';
import { 
  Play, Pause, RotateCcw, Sliders, Eye, 
  HelpCircle, Sparkles, Orbit, Compass, Zap, Gauge
} from 'lucide-react';

interface ControlPanelProps {
  params: JupitorParams;
  setParams: React.Dispatch<React.SetStateAction<JupitorParams>>;
  onResetSystem: () => void;
}

export default function ControlPanel({
  params,
  setParams,
  onResetSystem,
}: ControlPanelProps) {
  
  const updateParam = <K extends keyof JupitorParams>(key: K, value: JupitorParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const moonKeys: MoonType[] = ['io', 'europa', 'ganymede', 'callisto'];

  return (
    <div className="flex flex-col gap-5 p-5 bg-[#0e0e16]/90 border border-gray-800/40 rounded-2xl h-full overflow-y-auto max-h-[85vh] custom-scrollbar shadow-lg">
      
      {/* 1. Play / Pause & Reset Actions */}
      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-800/60 shrink-0">
        <button
          id="btn-play-pause"
          onClick={() => updateParam('isPaused', !params.isPaused)}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
            params.isPaused
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-emerald-950/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 shadow-amber-950/20'
          }`}
        >
          {params.isPaused ? (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>RESUME ORBITS</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>FREEZE ORBITS</span>
            </>
          )}
        </button>

        <button
          id="btn-reset"
          onClick={onResetSystem}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono font-semibold bg-gray-900 border border-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET DEFAULTS</span>
        </button>
      </div>

      {/* 2. Moon System study selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Orbit className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono tracking-wider font-semibold">SELECT CELESTIAL TARGET</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {moonKeys.map((mid) => {
            const config = MOON_CONFIGS[mid];
            const isSelected = params.selectedMoon === mid;
            return (
              <button
                key={mid}
                id={`moon-select-${mid}`}
                onClick={() => updateParam('selectedMoon', mid)}
                className={`flex flex-col items-start p-3 rounded-xl bg-black/40 border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-950/10 shadow-lg shadow-cyan-950/20' 
                    : 'border-gray-800/50 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-xs font-semibold text-gray-200">{config.name}</span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400/80 mt-1.5">{config.resonanceLabel}</span>
                <span className="text-[8px] font-mono text-gray-500 leading-normal mt-0.5 line-clamp-2">
                  {config.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Physics & Gravity Sliders */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono tracking-wider font-semibold">GRAVITATIONAL PHYSICS ENGINE</span>
        </div>

        {/* Time Warp Speed Scale */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-cyan-500" /> Time Warp Factor</span>
            <span className="text-cyan-400 font-bold">{params.timeScale.toFixed(1)}x speed</span>
          </div>
          <input
            id="slider-time-scale"
            type="range"
            min="0.0"
            max="3.0"
            step="0.1"
            value={params.timeScale}
            onChange={(e) => updateParam('timeScale', parseFloat(e.target.value))}
            className="w-full accent-cyan-500 h-1 bg-gray-900 rounded-lg cursor-pointer"
          />
          <span className="text-[8px] font-mono text-gray-600">Alters orbital progress days per second.</span>
        </div>

        {/* Jupiter Mass Multiplier */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Jupiter Mass (M_J)</span>
            <span className="text-yellow-400 font-bold">{params.jupiterMass.toFixed(1)}x Standard</span>
          </div>
          <input
            id="slider-jupiter-mass"
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={params.jupiterMass}
            onChange={(e) => updateParam('jupiterMass', parseFloat(e.target.value))}
            className="w-full accent-yellow-500 h-1 bg-gray-900 rounded-lg cursor-pointer"
          />
          <span className="text-[8px] font-mono text-gray-600">Altering mass increases orbital speed and bends space paths.</span>
        </div>

        {/* Gravity Constant scaling */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Gravitational Constant (G)</span>
            <span className="text-emerald-400 font-bold">{params.gConstant.toFixed(1)}x G₀</span>
          </div>
          <input
            id="slider-g-constant"
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={params.gConstant}
            onChange={(e) => updateParam('gConstant', parseFloat(e.target.value))}
            className="w-full accent-emerald-500 h-1 bg-gray-900 rounded-lg cursor-pointer"
          />
        </div>

        {/* Slingshot Probe Launch Velocity Multiplier */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Sling Launch Speed Factor</span>
            <span className="text-cyan-400 font-bold">{params.launchVelocity.toFixed(1)}x</span>
          </div>
          <input
            id="slider-launch-speed"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={params.launchVelocity}
            onChange={(e) => updateParam('launchVelocity', parseFloat(e.target.value))}
            className="w-full accent-cyan-500 h-1 bg-gray-900 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Telemetry Layers & Viewmodes */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono tracking-wider font-semibold">VIEWPORT SENSORS</span>
        </div>

        {/* View mode toggle */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wide">MAP RENDERING TARGET</span>
          <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-xl border border-gray-800/40">
            {[
              { id: 'orbit', label: 'Orbit' },
              { id: 'transit', label: 'Transit' },
              { id: 'telescope', label: 'Telescope' }
            ].map((v) => (
              <button
                key={v.id}
                id={`btn-viewmode-${v.id}`}
                onClick={() => updateParam('viewMode', v.id as any)}
                className={`py-1.5 px-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  params.viewMode === v.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Boolean Layers checkboxes */}
        <div className="flex flex-col gap-2 bg-black/30 p-3 rounded-xl border border-gray-800/40">
          <label className="flex items-center justify-between text-xs font-mono text-gray-400 cursor-pointer">
            <span className="flex items-center gap-2">
              <input
                id="checkbox-show-orbits"
                type="checkbox"
                checked={params.showOrbits}
                onChange={(e) => updateParam('showOrbits', e.target.checked)}
                className="rounded border-gray-800 text-cyan-500 focus:ring-cyan-500 bg-gray-900 h-3.5 w-3.5 cursor-pointer"
              />
              Show Orbit Paths
            </span>
            <span className="text-[9px] text-gray-600 font-mono">Dotted</span>
          </label>

          <label className="flex items-center justify-between text-xs font-mono text-gray-400 cursor-pointer mt-1">
            <span className="flex items-center gap-2">
              <input
                id="checkbox-gravity-vectors"
                type="checkbox"
                checked={params.showGravitySensors}
                onChange={(e) => updateParam('showGravitySensors', e.target.checked)}
                className="rounded border-gray-800 text-cyan-500 focus:ring-cyan-500 bg-gray-900 h-3.5 w-3.5 cursor-pointer"
              />
              Gravity Vector Sensors
            </span>
            <span className="text-[9px] text-emerald-600/80 font-mono">Dynamic Force</span>
          </label>
        </div>
      </div>

      {/* Info blurb footer */}
      <div className="mt-auto pt-3 border-t border-gray-800/60 flex items-start gap-2 bg-cyan-950/5 p-3 rounded-xl border border-cyan-500/10 shrink-0">
        <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-[9px] font-mono text-gray-400 leading-normal">
          The moons maintain their exact <span className="text-cyan-400 font-semibold">1:2:4 Laplace orbital resonance</span> (Io - Europa - Ganymede) unless heavy mass factors perturb gravity limits.
        </p>
      </div>
    </div>
  );
}
