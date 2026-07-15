/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MoonType, MoonConfig, MoonState, Probe, JupitorParams, JupitorMetrics } from './types';

export const MOON_CONFIGS: Record<MoonType, MoonConfig> = {
  io: {
    id: 'io',
    name: 'Io',
    radius: 4,
    physicalRadiusKm: 1821.6,
    orbitalRadiusKm: 421700,
    orbitalPeriodDays: 1.769,
    massKg: '8.93 x 10²²',
    color: '#eab308', // Yellow-500
    glowColor: 'rgba(234, 179, 8, 0.4)',
    description: 'The volcanic fireworld. It has over 400 active volcanoes due to intense tidal squeezing by Jupiter and Europa.',
    funFact: 'Lakes of molten sulfur and active volcano plumes erupt up to 500 km high into vacuum.',
    lifeProbability: 'Extremely Low (Radiation & Heat)',
    resonanceLabel: '4:1 resonance'
  },
  europa: {
    id: 'europa',
    name: 'Europa',
    radius: 3.5,
    physicalRadiusKm: 1560.8,
    orbitalRadiusKm: 670900,
    orbitalPeriodDays: 3.551,
    massKg: '4.80 x 10²²',
    color: '#38bdf8', // Sky-400
    glowColor: 'rgba(56, 189, 248, 0.4)',
    description: 'The ocean ice world. Beneath its global cracked water-ice crust lies a saltwater liquid ocean twice the volume of Earth’s.',
    funFact: 'Tidal forces flex its icy shell, heating the ocean below. Plumes of water vapor vent into space.',
    lifeProbability: 'High (Subsurface hydrothermal vents)',
    resonanceLabel: '2:1 resonance'
  },
  ganymede: {
    id: 'ganymede',
    name: 'Ganymede',
    radius: 5.5,
    physicalRadiusKm: 2634.1,
    orbitalRadiusKm: 1070400,
    orbitalPeriodDays: 7.154,
    massKg: '1.48 x 10²³',
    color: '#a855f7', // Purple-500
    glowColor: 'rgba(168, 85, 247, 0.4)',
    description: 'The giant colossus. It is the largest moon in the Solar System, even bigger than the planet Mercury.',
    funFact: 'The only moon known to possess its own intrinsic magnetic field, causing spectacular auroras.',
    lifeProbability: 'Medium (Deep underground saline ocean)',
    resonanceLabel: '1:1 resonance'
  },
  callisto: {
    id: 'callisto',
    name: 'Callisto',
    radius: 5,
    physicalRadiusKm: 2410.3,
    orbitalRadiusKm: 1882700,
    orbitalPeriodDays: 16.689,
    massKg: '1.08 x 10²³',
    color: '#f97316', // Orange-500
    glowColor: 'rgba(249, 115, 22, 0.4)',
    description: 'The ancient cratered shield. Geologically dead and unaltered for 4 billion years, it has the oldest surface.',
    funFact: 'Has the highest density of craters in the Solar System. Essentially a giant ball of rock and ice.',
    lifeProbability: 'Low (Distant, cold ocean possible)',
    resonanceLabel: 'Non-resonant'
  }
};

export class JupitorPhysicsEngine {
  moons: Record<MoonType, MoonState>;
  probes: Probe[] = [];
  simTimeDays: number = 0;
  maxSlingshotSpeed: number = 0;
  probesLaunched: number = 0;

  // Real scales for physics: G is scaled for beautiful desktop visual orbits
  private G: number = 0.4;
  private jupiterRadius: number = 24; // Visual radius on canvas

  constructor() {
    this.moons = {
      io: this.initMoon('io', 62, 1.769, 0),
      europa: this.initMoon('europa', 105, 3.551, Math.PI / 4),
      ganymede: this.initMoon('ganymede', 160, 7.154, Math.PI / 2),
      callisto: this.initMoon('callisto', 230, 16.689, Math.PI)
    };
  }

  private initMoon(id: MoonType, visualOrbitRadius: number, periodDays: number, initialAngle: number): MoonState {
    const angle = initialAngle;
    const x = visualOrbitRadius * Math.cos(angle);
    const y = visualOrbitRadius * Math.sin(angle);
    
    // Circular orbit speed v = sqrt(G*M / r).
    // Let G * M_jupiter = 2500 virtual units
    const GM_jupiter = 2500;
    const speed = Math.sqrt(GM_jupiter / visualOrbitRadius);
    
    // Velocity vector tangent to orbit (counter-clockwise)
    const vx = -speed * Math.sin(angle);
    const vy = speed * Math.cos(angle);

    return {
      id,
      x,
      y,
      vx,
      vy,
      angle,
      trail: [],
      isEclipsed: false,
      isTransit: false
    };
  }

  public step(params: JupitorParams) {
    if (params.isPaused) return;

    // Time increment per frame in simulated days
    // Speed slider modifies simulated warp speed
    const dtDays = 0.005 * params.timeScale;
    this.simTimeDays += dtDays;

    const GM_jupiter = 2500 * params.jupiterMass;
    const gConst = this.G * params.gConstant;

    // 1. Move Moons (Analytical Keplerian orbits for robust perfect Laplace resonance tracking)
    const moonIds: MoonType[] = ['io', 'europa', 'ganymede', 'callisto'];
    const visualRadii: Record<MoonType, number> = {
      io: 62,
      europa: 105,
      ganymede: 160,
      callisto: 230
    };

    moonIds.forEach((id) => {
      const config = MOON_CONFIGS[id];
      const mState = this.moons[id];
      const orbitR = visualRadii[id];

      // Kepler's 3rd Law: period is proportional to r^(1.5)
      // Angle increment based on orbital period: d_angle = 2PI * dt / Period
      const dAngle = (2 * Math.PI * dtDays) / config.orbitalPeriodDays;
      mState.angle = (mState.angle + dAngle) % (2 * Math.PI);

      // Update position
      mState.x = orbitR * Math.cos(mState.angle);
      mState.y = orbitR * Math.sin(mState.angle);

      // Instantaneous velocity
      const speed = Math.sqrt(GM_jupiter / orbitR);
      mState.vx = -speed * Math.sin(mState.angle);
      mState.vy = speed * Math.cos(mState.angle);

      // Append trail point
      mState.trail.push({ x: mState.x, y: mState.y });
      if (mState.trail.length > 120) {
        mState.trail.shift();
      }

      // Check shadow eclipse (when inside Jupiter's shadow cone behind light source)
      // Assume light comes from the left (x = -9999).
      // Shadow is a cylinder behind Jupiter (from x = jupiterRadius to x = infinity, |y| < jupiterRadius)
      mState.isEclipsed = mState.x > this.jupiterRadius - 2 && Math.abs(mState.y) < this.jupiterRadius;

      // Check Transit (when passing in front of Jupiter from side view, light from front/bottom)
      // For a side view, say look from bottom (y = -infinity).
      // Moon is in transit when y is closer than Jupiter and intersects Jupiter's sphere.
      mState.isTransit = mState.y < 0 && Math.abs(mState.x) < this.jupiterRadius;
    });

    // 2. Move Custom Space Probes using full N-body gravity integration
    // dt physics is decoupled for smooth orbital trajectory updates
    const dtPhysics = 0.05 * params.timeScale;

    this.probes.forEach((probe) => {
      if (probe.status !== 'active') return;

      // Distance from Jupiter
      const distSq = probe.x * probe.x + probe.y * probe.y;
      const dist = Math.sqrt(distSq);

      // Collision check with Jupiter
      if (dist < this.jupiterRadius) {
        probe.status = 'crashed';
        return;
      }

      // Gravitational acceleration from Jupiter: a = - G*M_j * r / |r|^3
      // We scale GM_jupiter to match canvas physics
      const accJFactor = -GM_jupiter / (distSq * dist);
      let ax = probe.x * accJFactor;
      let ay = probe.y * accJFactor;

      // Add gravities of the 4 Galilean Moons!
      // Mass estimates scale (representing slingshot pull)
      const moonMasses: Record<MoonType, number> = {
        io: 15,
        europa: 12,
        ganymede: 30, // massive
        callisto: 25
      };

      moonIds.forEach((mid) => {
        const mState = this.moons[mid];
        const mMass = moonMasses[mid] * params.jupiterMass; // scale moon mass with jupiter mass

        const dx = probe.x - mState.x;
        const dy = probe.y - mState.y;
        const dMoonSq = dx * dx + dy * dy;
        const dMoon = Math.sqrt(dMoonSq);

        // Check crash with moon
        const config = MOON_CONFIGS[mid];
        if (dMoon < config.radius + 1) {
          probe.status = 'crashed';
          return;
        }

        // Acceleration from moon
        const accMFactor = -(gConst * mMass) / (dMoonSq * dMoon + 0.1); // soft factor prevents divide by zero
        ax += dx * accMFactor;
        ay += dy * accMFactor;
      });

      // Integrate! (Euler-Cromer)
      probe.vx += ax * dtPhysics;
      probe.vy += ay * dtPhysics;
      probe.x += probe.vx * dtPhysics;
      probe.y += probe.vy * dtPhysics;

      // Update speed telemetry
      const speed = Math.sqrt(probe.vx * probe.vx + probe.vy * probe.vy);
      if (speed > probe.peakSpeed) {
        probe.peakSpeed = speed;
      }
      if (speed > this.maxSlingshotSpeed) {
        this.maxSlingshotSpeed = speed;
      }

      // Add to trail
      probe.trail.push({ x: probe.x, y: probe.y });
      if (probe.trail.length > 180) {
        probe.trail.shift();
      }

      // Check escaped system (distance too far and moving outward)
      if (dist > 500) {
        probe.status = 'escaped';
      }
    });
  }

  public launchProbe(x: number, y: number, vx: number, vy: number, mass: number): Probe {
    this.probesLaunched++;
    const newProbe: Probe = {
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      vx,
      vy,
      trail: [],
      status: 'active',
      mass,
      peakSpeed: Math.sqrt(vx * vx + vy * vy),
      launchTime: this.simTimeDays
    };
    this.probes.push(newProbe);
    return newProbe;
  }

  public clearProbes() {
    this.probes = [];
  }

  public computeMetrics(params: JupitorParams): JupitorMetrics {
    const activeProbes = this.probes.filter(p => p.status === 'active').length;

    // Calculate phase resonance coherence (Laplace resonance: Io - 2*Europa + Ganymede)
    // Theoretically: phi_Laplace = angle_io - 3*angle_europa + 2*angle_ganymede = 180 deg (PI rad)
    const phi = this.moons.io.angle - 3 * this.moons.europa.angle + 2 * this.moons.ganymede.angle;
    const coherence = Math.cos(phi); // near 1.0 (or -1.0) indicates high resonant alignment

    // Calculate total kinetic energy of the system for science telemetry
    let kineticEnergy = 0;
    const active = this.probes.filter(p => p.status === 'active');
    active.forEach(p => {
      const vSq = p.vx * p.vx + p.vy * p.vy;
      kineticEnergy += 0.5 * p.mass * vSq;
    });

    return {
      simTimeDays: this.simTimeDays,
      activeProbes,
      probesLaunched: this.probesLaunched,
      maxSlingshotSpeed: this.maxSlingshotSpeed,
      laplaceResonancePhase: coherence,
      totalKineticEnergy: kineticEnergy
    };
  }
}
