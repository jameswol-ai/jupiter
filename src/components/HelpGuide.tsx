/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Orbit, ArrowUpRight, Zap, Target } from 'lucide-react';

export default function HelpGuide() {
  return (
    <div className="flex flex-col gap-5 p-5 bg-[#0e0e16]/90 border border-gray-800/40 rounded-2xl h-full overflow-y-auto max-h-[85vh] custom-scrollbar shadow-lg">
      <div className="flex items-center gap-2 border-b border-gray-800/60 pb-3">
        <BookOpen className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-sans font-semibold tracking-wider text-gray-200">ASTROPHYSICS MANUAL</h3>
      </div>

      {/* 1. Newtonian Gravity */}
      <div className="flex flex-col gap-2 bg-black/30 border border-gray-800/40 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
          <Orbit className="w-4 h-4" />
          <span>NEWTONIAN GRAVITATIONAL FIELDS</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed mt-1">
          Every point mass attracts every other point mass by a force acting along the line intersecting both centers. The force is proportional to the product of their masses and inversely proportional to the square of the distance between them:
        </p>
        <div className="bg-black/60 p-2.5 rounded-lg border border-gray-800/50 my-1 font-mono text-[11px] text-center text-cyan-400">
          F = G · (M₁ · M₂) / r²
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          In this laboratory, Jupiter's massive gravity creates a deep potential well, pulling any launched probe inwards. Toggle the <strong className="text-gray-300">Gravity Vector Sensors</strong> checkbox to visualize this field of force vectors.
        </p>
      </div>

      {/* 2. Gravitational Slingshot */}
      <div className="flex flex-col gap-2 bg-black/30 border border-gray-800/40 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
          <ArrowUpRight className="w-4 h-4" />
          <span>GRAVITATIONAL SLINGSHOT ASSIST</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed mt-1">
          A <strong className="text-gray-200">gravitational slingshot</strong> (or gravity assist) is a spaceflight maneuver that uses the relative movement and gravity of a planet or moon to alter the path and speed of a spacecraft.
        </p>
        <p className="text-xs text-gray-400 leading-relaxed">
          As a probe approaches a moving moon from behind, the moon's gravity pulls on the probe, speeding it up in the sun's (or Jupiter's) frame of reference. The probe "steals" an extremely tiny fraction of the moon's orbital energy to achieve massive acceleration!
        </p>
      </div>

      {/* 3. Laplace Resonance */}
      <div className="flex flex-col gap-2 bg-black/30 border border-gray-800/40 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-yellow-400 font-semibold text-xs">
          <Zap className="w-4 h-4" />
          <span>THE LAPLACE RESONANCE Harmony</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed mt-1">
          The three innermost Galilean moons—<strong className="text-yellow-400">Io</strong>, <strong className="text-sky-400">Europa</strong>, and <strong className="text-purple-400">Ganymede</strong>—exist in a stable orbital resonance called the Laplace resonance:
        </p>
        <div className="bg-black/60 p-2.5 rounded-lg border border-gray-800/50 my-1 font-mono text-[11px] text-center text-yellow-500">
          4 : 2 : 1 Orbit Ratio
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          For every <strong className="text-purple-400">one orbit</strong> of Ganymede, Europa completes exactly <strong className="text-sky-400">two orbits</strong>, and Io completes exactly <strong className="text-yellow-400">four orbits</strong>. This prevents chaotic orbital decay.
        </p>
      </div>

      {/* 4. Flight Instructions */}
      <div className="flex flex-col gap-2.5 border-t border-gray-800/40 pt-4 shrink-0">
        <span className="text-[10px] font-mono text-gray-500 tracking-wider">LABORATORY FLIGHT PROCEDURES</span>
        <ul className="flex flex-col gap-2 pl-4 list-disc text-xs text-gray-400 leading-relaxed">
          <li>
            <strong className="text-gray-300">Aim and Sling Launch</strong>: Click and drag anywhere on the space canvas to create a launch vector. Pull back like an elastic slingshot, then release to launch a custom space probe.
          </li>
          <li>
            <strong className="text-gray-300">Perform Slingshots</strong>: Aim your probes so they pass close behind a moon's path. Check the velocity indicator—if angled correctly, your probe will gain a massive velocity boost!
          </li>
          <li>
            <strong className="text-gray-300">Calibrate Physical Constants</strong>: Adjust Jupiter's mass multiplier or warp time. Higher mass speeds up orbits and bends gravity curves deeper.
          </li>
          <li>
            <strong className="text-gray-300">Shadow Occlusion</strong>: Watch the moons as they pass behind Jupiter. When they enter the grey shadow cone, their solar panels lose light and they go into <strong className="text-red-400">ECLIPSE</strong> state.
          </li>
        </ul>
      </div>
    </div>
  );
}
