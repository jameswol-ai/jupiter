/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MoonType = 'io' | 'europa' | 'ganymede' | 'callisto';

export interface MoonConfig {
  id: MoonType;
  name: string;
  radius: number;          // Visual radius in pixels
  physicalRadiusKm: number; // Real physical radius
  orbitalRadiusKm: number;  // Real distance from Jupiter
  orbitalPeriodDays: number;// Real orbital period
  massKg: string;           // Real mass representation
  color: string;            // Primary tailwind/canvas color hex
  glowColor: string;        // Glow shadow color
  description: string;      // Quick blurb
  funFact: string;          // Scientific highlight
  lifeProbability: string;  // Astrobiological potential
  resonanceLabel: string;   // 1:2:4 resonance state
}

export interface MoonState {
  id: MoonType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;            // Current angle in radians
  trail: { x: number; y: number }[];
  isEclipsed: boolean;      // Inside Jupiter's shadow cone
  isTransit: boolean;       // In front of Jupiter from side-view
}

export interface Probe {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  status: 'active' | 'crashed' | 'escaped';
  mass: number;
  peakSpeed: number;
  launchTime: number;
}

export interface JupitorParams {
  timeScale: number;        // Rate of speed (0 to 5)
  gConstant: number;        // Gravitational strength modifier
  jupiterMass: number;      // Jupiter mass multiplier
  viewMode: 'orbit' | 'transit' | 'telescope';
  selectedMoon: MoonType;
  showOrbits: boolean;
  showGravitySensors: boolean;
  isPaused: boolean;
  probeMass: number;
  launchVelocity: number;
}

export interface JupitorMetrics {
  simTimeDays: number;
  activeProbes: number;
  probesLaunched: number;
  maxSlingshotSpeed: number;
  laplaceResonancePhase: number; // 1:2:4 phase coherence
  totalKineticEnergy: number;
}

