/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { JupitorParams, JupitorMetrics, MoonType, MoonState } from './types';
import { JupitorPhysicsEngine } from './simulation';
import JupitorCanvas from './components/JupitorCanvas';
import TelemetryPanel from './components/TelemetryPanel';
import ControlPanel from './components/ControlPanel';
import HelpGuide from './components/HelpGuide';
import { Orbit, Activity, Sliders, BookOpen, Compass, Shield } from 'lucide-react';

export default function App() {
  // Instantiate the celestial physics engine once using a Ref to bypass React state re-render thrashing
  const engineRef = useRef<JupitorPhysicsEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new JupitorPhysicsEngine();
  }

  const [params, setParams] = useState<JupitorParams>({
    timeScale: 1.2,
    gConstant: 1.0,
    jupiterMass: 1.0,
    viewMode: 'orbit',
    selectedMoon: 'io',
    showOrbits: true,
    showGravitySensors: false,
    isPaused: false,
    probeMass: 5.0,
    launchVelocity: 1.2,
  });

  const [metrics, setMetrics] = useState<JupitorMetrics>({
    simTimeDays: 0,
    activeProbes: 0,
    probesLaunched: 0,
    maxSlingshotSpeed: 0,
    laplaceResonancePhase: 1.0,
    totalKineticEnergy: 0,
  });

  // Track moons positions state for UI components
  const [moonsState, setMoonsState] = useState<Record<MoonType, MoonState>>({
    io: { id: 'io', x: 62, y: 0, vx: 0, vy: 6.3, angle: 0, trail: [], isEclipsed: false, isTransit: false },
    europa: { id: 'europa', x: 74.2, y: 74.2, vx: -3.4, vy: 3.4, angle: Math.PI / 4, trail: [], isEclipsed: false, isTransit: false },
    ganymede: { id: 'ganymede', x: 0, y: 160, vx: -3.9, vy: 0, angle: Math.PI / 2, trail: [], isEclipsed: false, isTransit: false },
    callisto: { id: 'callisto', x: -230, y: 0, vx: 0, vy: -3.3, angle: Math.PI, trail: [], isEclipsed: false, isTransit: false },
  });

  const [activeTab, setActiveTab] = useState<'telemetry' | 'controls' | 'guide'>('telemetry');

  // Unified Physics Step tick loop
  useEffect(() => {
    let animId: number;
    const tick = () => {
      const engine = engineRef.current;
      if (engine) {
        // Run physics integration step
        engine.step(params);

        // Compute metrics and update React state
        const calculatedMetrics = engine.computeMetrics(params);
        setMetrics(calculatedMetrics);

        // Mirror active moon coordinates for UI components
        setMoonsState({
          io: { ...engine.moons.io },
          europa: { ...engine.moons.europa },
          ganymede: { ...engine.moons.ganymede },
          callisto: { ...engine.moons.callisto },
        });
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [params]);

  // Handlers for canvas operations
  const handleLaunchProbe = (x: number, y: number, vx: number, vy: number) => {
    if (engineRef.current) {
      engineRef.current.launchProbe(x, y, vx, vy, params.probeMass);
    }
  };

  const handleClearProbes = () => {
    if (engineRef.current) {
      engineRef.current.clearProbes();
    }
  };

  const handleResetSystem = () => {
    if (engineRef.current) {
      engineRef.current.clearProbes();
      engineRef.current.simTimeDays = 0;
      engineRef.current.maxSlingshotSpeed = 0;
      engineRef.current.probesLaunched = 0;
      
      // Reinitialize moon orbits
      engineRef.current.moons.io.angle = 0;
      engineRef.current.moons.europa.angle = Math.PI / 4;
      engineRef.current.moons.ganymede.angle = Math.PI / 2;
      engineRef.current.moons.callisto.angle = Math.PI;
    }
    setParams({
      timeScale: 1.2,
      gConstant: 1.0,
      jupiterMass: 1.0,
      viewMode: 'orbit',
      selectedMoon: 'io',
      showOrbits: true,
      showGravitySensors: false,
      isPaused: false,
      probeMass: 5.0,
      launchVelocity: 1.2,
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#07070c] text-gray-100 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* 1. Global Navigation Header */}
      <header className="border-b border-gray-800/40 bg-[#0a0a12]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent animate-pulse" />
            <Orbit className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-sm font-sans font-extrabold tracking-[0.25em] text-gray-100 uppercase">
              JUPITOR
            </h1>
            <p className="text-[10px] font-mono tracking-wider text-cyan-400/80 uppercase font-medium mt-0.5">
              JUPITER CELESTIAL & GALILEAN MOONS LAB
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-gray-800/60 text-gray-400">
            <Compass className="w-3.5 h-3.5 text-cyan-500 animate-spin" style={{ animationDuration: '4s' }} />
            <span>SOLVER RATE: <strong className="text-gray-200">60Hz</strong></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-gray-800/60 text-emerald-400">
            <Shield className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500/40 animate-pulse" />
            <span>CORE LIVE</span>
          </div>
        </div>
      </header>

      {/* 2. Main Workbench Console Area */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column (col-span-8): Active Simulation Stage */}
        <section className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
          <div className="flex-1 h-full min-h-[450px]">
            {engineRef.current && (
              <JupitorCanvas
                engine={engineRef.current}
                params={params}
                setParams={setParams}
                onLaunchProbe={handleLaunchProbe}
                onClearProbes={handleClearProbes}
              />
            )}
          </div>
        </section>

        {/* Right Column (col-span-4): Tabbed Control Deck & Diagnostics Feed */}
        <section className="lg:col-span-4 flex flex-col h-full bg-[#0a0a11]/60 border border-gray-800/40 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Deck Sidebar Navigation Tabs */}
          <div className="flex border-b border-gray-800/60 bg-black/20 p-1.5 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-black/20 font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/20'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>TELEMETRY</span>
            </button>
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'controls'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-black/20 font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/20'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>CONTROLS</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-black/20 font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/20'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>MANUAL</span>
            </button>
          </div>

          {/* Dynamic Tab Panel Display */}
          <div className="flex-1 min-h-0 bg-transparent">
            {activeTab === 'telemetry' && (
              <TelemetryPanel metrics={metrics} params={params} moonsState={moonsState} />
            )}
            
            {activeTab === 'controls' && (
              <ControlPanel
                params={params}
                setParams={setParams}
                onResetSystem={handleResetSystem}
              />
            )}
            
            {activeTab === 'guide' && (
              <HelpGuide />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
