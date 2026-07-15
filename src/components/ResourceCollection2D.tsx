import { useEffect, useMemo, useRef, useState } from "react";
import type { SolarPlanet } from "./SolarSystem";

type ResourceCollection2DProps = {
  planet: SolarPlanet;
  onComplete: () => void;
};

type KeyState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

type ResourceKind = "metal" | "crystal" | "gas";
type ObstacleKind = "asteroid" | "mine" | "wreck";

type Resource = {
  id: number;
  kind: ResourceKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  size: number;
  collected: boolean;
};

type Obstacle = {
  id: number;
  kind: ObstacleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  size: number;
  pulse: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

type Star = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
};

type Escort = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  phase: number;
  color: string;
};

type BaseState = {
  x: number;
  y: number;
  w: number;
  h: number;
  dockRadius: number;
  beaconPhase: number;
};

type GameState = {
  keys: KeyState;
  rocket: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    heading: number;
    invulnerable: number;
  };
  resources: Resource[];
  obstacles: Obstacle[];
  particles: Particle[];
  stars: Star[];
  escorts: Escort[];
  nextId: number;
  elapsed: number;
  base: BaseState;
  dockTime: number;
  damageFlash: number;
  stability: number;
};

const REQUIRED_PER_KIND: Record<ResourceKind, number> = {
  metal: 3,
  crystal: 3,
  gas: 2,
};

const KIND_META: Record<ResourceKind, { label: string; color: string; glow: string; icon: string }> = {
  metal: {
    label: "金属",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.55)",
    icon: "M",
  },
  crystal: {
    label: "晶体",
    color: "#7dd3fc",
    glow: "rgba(125,211,252,0.55)",
    icon: "C",
  },
  gas: {
    label: "气体",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.55)",
    icon: "G",
  },
};

const OBSTACLE_META: Record<ObstacleKind, { color: string; glow: string; label: string }> = {
  asteroid: {
    color: "#c08457",
    glow: "rgba(251,146,60,0.28)",
    label: "陨石",
  },
  mine: {
    color: "#f87171",
    glow: "rgba(248,113,113,0.24)",
    label: "机雷",
  },
  wreck: {
    color: "#93c5fd",
    glow: "rgba(147,197,253,0.24)",
    label: "残骸",
  },
};

const ALL_KINDS: ResourceKind[] = ["metal", "crystal", "gas"];
const ALL_OBSTACLES: ObstacleKind[] = ["asteroid", "mine", "wreck"];
const INITIAL_STABILITY = 100;
const OBSTACLE_COUNT = 8;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distanceSq(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function drawRocket(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number, time: number) {
  const plume = 8 + Math.sin(time * 16) * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);

  const flame = ctx.createLinearGradient(-36, 0, -6, 0);
  flame.addColorStop(0, "rgba(125,211,252,0)");
  flame.addColorStop(0.35, "rgba(96,165,250,0.78)");
  flame.addColorStop(1, "rgba(255,255,255,0.95)");
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(-30 - plume, 7);
  ctx.lineTo(-34 - plume, 0);
  ctx.lineTo(-30 - plume, -7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#e7efff";
  ctx.strokeStyle = "rgba(180,210,255,0.68)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(0, 10);
  ctx.lineTo(-14, 11);
  ctx.lineTo(-18, 0);
  ctx.lineTo(-14, -11);
  ctx.lineTo(0, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#60a5fa";
  ctx.beginPath();
  ctx.arc(5, 0, 4.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7dd3fc";
  ctx.beginPath();
  ctx.moveTo(-2, 9);
  ctx.lineTo(-18, 17);
  ctx.lineTo(-10, 7);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2, -9);
  ctx.lineTo(-18, -17);
  ctx.lineTo(-10, -7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#93c5fd";
  ctx.fillRect(-8, -2, 11, 4);
  ctx.restore();
}

function drawResource(ctx: CanvasRenderingContext2D, resource: Resource) {
  const meta = KIND_META[resource.kind];
  ctx.save();
  ctx.translate(resource.x, resource.y);
  ctx.rotate(resource.rotation);

  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, resource.size * 1.8);
  glow.addColorStop(0, meta.glow);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, resource.size * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = meta.color;
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 1.3;

  if (resource.kind === "crystal") {
    ctx.beginPath();
    ctx.moveTo(0, -resource.size);
    ctx.lineTo(resource.size * 0.9, 0);
    ctx.lineTo(0, resource.size);
    ctx.lineTo(-resource.size * 0.9, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (resource.kind === "gas") {
    ctx.beginPath();
    ctx.arc(0, 0, resource.size * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.arc(0, 0, resource.size * 0.55, 0.4, Math.PI * 1.7);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.roundRect(-resource.size, -resource.size * 0.72, resource.size * 2, resource.size * 1.44, 4);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.font = `${Math.round(resource.size * 0.95)}px ui-sans-serif, system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(meta.icon, 0, 0);
  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle, time: number) {
  const meta = OBSTACLE_META[obstacle.kind];
  ctx.save();
  ctx.translate(obstacle.x, obstacle.y);
  ctx.rotate(obstacle.rotation);

  const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, obstacle.size * 1.7);
  glow.addColorStop(0, meta.glow);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, obstacle.size * 1.7, 0, Math.PI * 2);
  ctx.fill();

  if (obstacle.kind === "mine") {
    ctx.fillStyle = meta.color;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, obstacle.size * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillRect(obstacle.size * 0.45, -1.2, obstacle.size * 0.78, 2.4);
      ctx.restore();
    }
    ctx.fillStyle = "rgba(255,240,240,0.95)";
    ctx.beginPath();
    ctx.arc(0, 0, 2.5 + Math.sin(time * 8 + obstacle.pulse) * 1.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (obstacle.kind === "wreck") {
    ctx.fillStyle = meta.color;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-obstacle.size, -obstacle.size * 0.3);
    ctx.lineTo(obstacle.size * 0.3, -obstacle.size * 0.75);
    ctx.lineTo(obstacle.size, obstacle.size * 0.1);
    ctx.lineTo(-obstacle.size * 0.2, obstacle.size * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(147,197,253,0.65)";
    ctx.beginPath();
    ctx.moveTo(-obstacle.size * 0.5, 0);
    ctx.lineTo(obstacle.size * 0.56, 0);
    ctx.stroke();
  } else {
    ctx.fillStyle = meta.color;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      const radius = obstacle.size * (0.75 + Math.sin(i * 1.7 + obstacle.pulse) * 0.18);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawBase(ctx: CanvasRenderingContext2D, base: BaseState, ready: boolean, dockProgress: number, time: number) {
  ctx.save();
  ctx.translate(base.x, base.y);

  const pulse = 0.5 + Math.sin(time * 4 + base.beaconPhase) * 0.5;
  const glow = ctx.createRadialGradient(0, 0, 6, 0, 0, base.dockRadius + 36);
  glow.addColorStop(0, ready ? "rgba(34,197,94,0.2)" : "rgba(56,189,248,0.16)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, base.dockRadius + 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = ready ? `rgba(74,222,128,${0.4 + pulse * 0.3})` : "rgba(125,211,252,0.35)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.arc(0, 0, base.dockRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(15,23,42,0.92)";
  ctx.strokeStyle = ready ? "rgba(74,222,128,0.85)" : "rgba(125,211,252,0.75)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-base.w / 2, -base.h / 2, base.w, base.h, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(148,163,184,0.85)";
  ctx.fillRect(-10, -base.h / 2 - 26, 20, 26);
  ctx.fillStyle = ready ? `rgba(74,222,128,${0.55 + pulse * 0.35})` : `rgba(125,211,252,${0.45 + pulse * 0.25})`;
  ctx.beginPath();
  ctx.arc(0, -base.h / 2 - 30, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(186,230,253,0.45)";
  ctx.beginPath();
  ctx.moveTo(-base.w * 0.28, 0);
  ctx.lineTo(base.w * 0.28, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -base.h * 0.2);
  ctx.lineTo(0, base.h * 0.2);
  ctx.stroke();

  ctx.fillStyle = "rgba(226,232,240,0.96)";
  ctx.font = "12px ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(ready ? "返回基地对接" : "基地待命", 0, -base.h / 2 - 42);

  if (dockProgress > 0) {
    ctx.fillStyle = "rgba(15,23,42,0.85)";
    ctx.beginPath();
    ctx.roundRect(-38, base.h / 2 + 12, 76, 8, 999);
    ctx.fill();
    ctx.fillStyle = "rgba(74,222,128,0.95)";
    ctx.beginPath();
    ctx.roundRect(-38, base.h / 2 + 12, 76 * dockProgress, 8, 999);
    ctx.fill();
  }

  ctx.restore();
}

function drawEscort(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.7, size * 0.52);
  ctx.lineTo(-size * 0.32, 0);
  ctx.lineTo(-size * 0.7, -size * 0.52);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function createStars(width: number, height: number): Star[] {
  return Array.from({ length: 120 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1 + Math.random() * 2.2,
    alpha: 0.2 + Math.random() * 0.7,
    speed: 4 + Math.random() * 16,
  }));
}

function createEscorts(): Escort[] {
  return [
    { angle: 0, radius: 84, speed: 0.55, size: 11, phase: 0, color: "#7dd3fc" },
    { angle: Math.PI * 0.9, radius: 72, speed: 0.72, size: 9, phase: 1.4, color: "#c4b5fd" },
    { angle: Math.PI * 1.5, radius: 96, speed: 0.48, size: 10, phase: 2.1, color: "#93c5fd" },
  ];
}

export default function ResourceCollection2D({ planet, onComplete }: ResourceCollection2DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const disposedRef = useRef(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const stateRef = useRef<GameState>({
    keys: { up: false, down: false, left: false, right: false },
    rocket: { x: 0, y: 0, vx: 0, vy: 0, heading: 0, invulnerable: 0 },
    resources: [],
    obstacles: [],
    particles: [],
    stars: [],
    escorts: createEscorts(),
    nextId: 1,
    elapsed: 0,
    base: { x: 0, y: 0, w: 146, h: 86, dockRadius: 74, beaconPhase: 0 },
    dockTime: 0,
    damageFlash: 0,
    stability: INITIAL_STABILITY,
  });
  const [progress, setProgress] = useState<Record<ResourceKind, number>>({
    metal: 0,
    crystal: 0,
    gas: 0,
  });
  const [stability, setStability] = useState(INITIAL_STABILITY);
  const [dockProgress, setDockProgress] = useState(0);

  const totalNeeded = useMemo(
    () => Object.values(REQUIRED_PER_KIND).reduce((sum, value) => sum + value, 0),
    [],
  );

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    setProgress({ metal: 0, crystal: 0, gas: 0 });
    setStability(INITIAL_STABILITY);
    setDockProgress(0);
  }, [planet.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    disposedRef.current = false;

    const countCollected = (): Record<ResourceKind, number> => {
      const counts: Record<ResourceKind, number> = { metal: 0, crystal: 0, gas: 0 };
      for (const resource of stateRef.current.resources) {
        if (resource.collected) counts[resource.kind] += 1;
      }
      return counts;
    };

    const createParticleBurst = (x: number, y: number, color: string, count: number, spread = 120) => {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = spread * (0.4 + Math.random() * 0.8);
        stateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.7 + Math.random() * 0.4,
          maxLife: 0.7 + Math.random() * 0.4,
          color,
          size: 2 + Math.random() * 4,
        });
      }
    };

    const canPlace = (x: number, y: number, size: number, width: number, height: number) => {
      const base = stateRef.current.base;
      if (distanceSq(x, y, base.x, base.y) < (base.dockRadius + size + 50) ** 2) return false;
      if (distanceSq(x, y, width / 2, height / 2) < (size + 90) ** 2) return false;
      return true;
    };

    const spawnResource = (width: number, height: number, forceKind?: ResourceKind) => {
      const counts = countCollected();
      const remainingKinds = ALL_KINDS.filter((kind) => counts[kind] < REQUIRED_PER_KIND[kind]);
      if (remainingKinds.length === 0) return;
      const kind = forceKind ?? remainingKinds[Math.floor(Math.random() * remainingKinds.length)];
      const margin = 48;

      for (let attempt = 0; attempt < 24; attempt += 1) {
        const x = margin + Math.random() * (width - margin * 2);
        const y = margin + Math.random() * (height - margin * 2);
        const size = 12 + Math.random() * 5;
        if (!canPlace(x, y, size, width, height)) continue;
        stateRef.current.resources.push({
          id: stateRef.current.nextId++,
          kind,
          x,
          y,
          vx: (Math.random() - 0.5) * 26,
          vy: (Math.random() - 0.5) * 26,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.8,
          size,
          collected: false,
        });
        return;
      }
    };

    const spawnObstacle = (width: number, height: number) => {
      const kind = ALL_OBSTACLES[Math.floor(Math.random() * ALL_OBSTACLES.length)];
      const size = kind === "mine" ? 14 + Math.random() * 4 : 18 + Math.random() * 8;

      for (let attempt = 0; attempt < 24; attempt += 1) {
        const x = 40 + Math.random() * (width - 80);
        const y = 40 + Math.random() * (height - 80);
        if (!canPlace(x, y, size, width, height)) continue;
        stateRef.current.obstacles.push({
          id: stateRef.current.nextId++,
          kind,
          x,
          y,
          vx: (Math.random() - 0.5) * 70,
          vy: (Math.random() - 0.5) * 70,
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 1.2,
          size,
          pulse: Math.random() * Math.PI * 2,
        });
        return;
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const state = stateRef.current;
      state.rocket.x = width * 0.22;
      state.rocket.y = height * 0.52;
      state.rocket.vx = 0;
      state.rocket.vy = 0;
      state.base.x = width - 118;
      state.base.y = height * 0.5;
      state.stars = createStars(width, height);
    };

    const seed = () => {
      const state = stateRef.current;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      state.resources = [];
      state.obstacles = [];
      state.particles = [];
      state.nextId = 1;
      state.elapsed = 0;
      state.dockTime = 0;
      state.damageFlash = 0;
      state.stability = INITIAL_STABILITY;
      state.rocket.invulnerable = 0;
      for (let i = 0; i < totalNeeded; i += 1) spawnResource(width, height);
      for (let i = 0; i < OBSTACLE_COUNT; i += 1) spawnObstacle(width, height);
    };

    resize();
    seed();
    window.addEventListener("resize", resize);

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          stateRef.current.keys.up = true;
          event.preventDefault();
          break;
        case "KeyS":
        case "ArrowDown":
          stateRef.current.keys.down = true;
          event.preventDefault();
          break;
        case "KeyA":
        case "ArrowLeft":
          stateRef.current.keys.left = true;
          event.preventDefault();
          break;
        case "KeyD":
        case "ArrowRight":
          stateRef.current.keys.right = true;
          event.preventDefault();
          break;
        default:
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          stateRef.current.keys.up = false;
          break;
        case "KeyS":
        case "ArrowDown":
          stateRef.current.keys.down = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          stateRef.current.keys.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          stateRef.current.keys.right = false;
          break;
        default:
          break;
      }
    };

    const onBlur = () => {
      stateRef.current.keys = { up: false, down: false, left: false, right: false };
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    let last = performance.now();
    const accel = 360;
    const maxSpeed = 300;
    const drag = 2.4;
    const hitRadius = 24;
    const dockDuration = 1.2;

    const update = (dt: number) => {
      const state = stateRef.current;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      state.elapsed += dt;
      state.base.beaconPhase += dt * 2.8;
      state.damageFlash = Math.max(0, state.damageFlash - dt * 2);
      state.rocket.invulnerable = Math.max(0, state.rocket.invulnerable - dt);
      state.stability = clamp(state.stability + dt * 2.6, 0, INITIAL_STABILITY);

      const rocket = state.rocket;
      if (state.keys.left) rocket.vx -= accel * dt;
      if (state.keys.right) rocket.vx += accel * dt;
      if (state.keys.up) rocket.vy -= accel * dt;
      if (state.keys.down) rocket.vy += accel * dt;

      rocket.vx -= rocket.vx * Math.min(1, drag * dt);
      rocket.vy -= rocket.vy * Math.min(1, drag * dt);

      const speed = Math.hypot(rocket.vx, rocket.vy);
      if (speed > maxSpeed) {
        rocket.vx = (rocket.vx / speed) * maxSpeed;
        rocket.vy = (rocket.vy / speed) * maxSpeed;
      }

      rocket.x += rocket.vx * dt;
      rocket.y += rocket.vy * dt;

      if (rocket.x < 20) {
        rocket.x = 20;
        rocket.vx = Math.abs(rocket.vx) * 0.42;
      }
      if (rocket.x > width - 20) {
        rocket.x = width - 20;
        rocket.vx = -Math.abs(rocket.vx) * 0.42;
      }
      if (rocket.y < 20) {
        rocket.y = 20;
        rocket.vy = Math.abs(rocket.vy) * 0.42;
      }
      if (rocket.y > height - 20) {
        rocket.y = height - 20;
        rocket.vy = -Math.abs(rocket.vy) * 0.42;
      }

      const targetHeading = Math.atan2(rocket.vy, rocket.vx || 0.0001);
      let headingDelta = targetHeading - rocket.heading;
      while (headingDelta > Math.PI) headingDelta -= Math.PI * 2;
      while (headingDelta < -Math.PI) headingDelta += Math.PI * 2;
      rocket.heading += headingDelta * Math.min(1, dt * 8);

      for (const star of state.stars) {
        star.x -= star.speed * dt;
        if (star.x < -4) {
          star.x = width + Math.random() * 30;
          star.y = Math.random() * height;
        }
      }

      for (const escort of state.escorts) {
        escort.angle += dt * escort.speed;
      }

      for (const resource of state.resources) {
        if (resource.collected) continue;
        resource.x += resource.vx * dt;
        resource.y += resource.vy * dt;
        resource.rotation += resource.spin * dt;

        if (resource.x < 20 || resource.x > width - 20) resource.vx *= -1;
        if (resource.y < 20 || resource.y > height - 20) resource.vy *= -1;
        resource.x = clamp(resource.x, 20, width - 20);
        resource.y = clamp(resource.y, 20, height - 20);
      }

      for (const obstacle of state.obstacles) {
        obstacle.x += obstacle.vx * dt;
        obstacle.y += obstacle.vy * dt;
        obstacle.rotation += obstacle.spin * dt;
        if (obstacle.x < obstacle.size || obstacle.x > width - obstacle.size) obstacle.vx *= -1;
        if (obstacle.y < obstacle.size || obstacle.y > height - obstacle.size) obstacle.vy *= -1;
        obstacle.x = clamp(obstacle.x, obstacle.size, width - obstacle.size);
        obstacle.y = clamp(obstacle.y, obstacle.size, height - obstacle.size);
      }

      let collectedAny = false;
      for (const resource of state.resources) {
        if (resource.collected) continue;
        if (distanceSq(resource.x, resource.y, rocket.x, rocket.y) < (resource.size + hitRadius) ** 2) {
          resource.collected = true;
          collectedAny = true;
          createParticleBurst(resource.x, resource.y, KIND_META[resource.kind].color, 16, 140);
        }
      }

      if (collectedAny) {
        setProgress(countCollected());
      }

      if (rocket.invulnerable <= 0) {
        for (const obstacle of state.obstacles) {
          const hitDistance = (obstacle.size + 18) ** 2;
          if (distanceSq(obstacle.x, obstacle.y, rocket.x, rocket.y) < hitDistance) {
            const angle = Math.atan2(rocket.y - obstacle.y, rocket.x - obstacle.x);
            rocket.vx += Math.cos(angle) * 120;
            rocket.vy += Math.sin(angle) * 120;
            rocket.invulnerable = 0.9;
            state.damageFlash = 0.8;
            state.stability = clamp(state.stability - 14, 0, INITIAL_STABILITY);
            setStability(Math.round(state.stability));
            createParticleBurst(rocket.x, rocket.y, OBSTACLE_META[obstacle.kind].color, 12, 100);
            if (state.stability <= 0) {
              state.stability = 42;
              setStability(42);
              rocket.x = width * 0.22;
              rocket.y = height * 0.52;
              rocket.vx = 0;
              rocket.vy = 0;
              state.dockTime = 0;
              setDockProgress(0);
            }
            break;
          }
        }
      } else {
        setStability(Math.round(state.stability));
      }

      for (let i = state.particles.length - 1; i >= 0; i -= 1) {
        const particle = state.particles[i];
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= 1 - dt * 1.25;
        particle.vy *= 1 - dt * 1.25;
        particle.life -= dt;
        if (particle.life <= 0) state.particles.splice(i, 1);
      }

      const remainingResources = state.resources.filter((resource) => !resource.collected).length;
      if (remainingResources < 4) spawnResource(width, height);

      const allCollected = ALL_KINDS.every((kind) => countCollected()[kind] >= REQUIRED_PER_KIND[kind]);
      if (allCollected) {
        if (distanceSq(rocket.x, rocket.y, state.base.x, state.base.y) < state.base.dockRadius ** 2) {
          state.dockTime = clamp(state.dockTime + dt, 0, dockDuration);
        } else {
          state.dockTime = Math.max(0, state.dockTime - dt * 1.5);
        }
      } else {
        state.dockTime = 0;
      }
      setDockProgress(clamp(state.dockTime / dockDuration, 0, 1));

      if (allCollected && state.dockTime >= dockDuration && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current();
      }
    };

    const render = () => {
      const state = stateRef.current;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const allCollected = ALL_KINDS.every((kind) => progress[kind] >= REQUIRED_PER_KIND[kind]);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#030712");
      gradient.addColorStop(0.55, "#07101f");
      gradient.addColorStop(1, "#09162b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const haze = ctx.createRadialGradient(width * 0.75, height * 0.38, 10, width * 0.75, height * 0.38, width * 0.45);
      haze.addColorStop(0, "rgba(96,165,250,0.16)");
      haze.addColorStop(0.5, "rgba(59,130,246,0.08)");
      haze.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, width, height);

      const lowerGlow = ctx.createRadialGradient(width * 0.12, height * 0.88, 20, width * 0.12, height * 0.88, width * 0.34);
      lowerGlow.addColorStop(0, "rgba(167,139,250,0.12)");
      lowerGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = lowerGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      for (const star of state.stars) {
        ctx.globalAlpha = star.alpha;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }
      ctx.globalAlpha = 1;

      ctx.strokeStyle = "rgba(125,211,252,0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.ellipse(width * 0.76, height * 0.48, 140 + i * 50, 65 + i * 24, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      drawBase(ctx, state.base, allCollected, state.dockTime / 1.2, state.elapsed);

      for (const escort of state.escorts) {
        const orbitX = state.base.x + Math.cos(escort.angle + escort.phase) * escort.radius;
        const orbitY = state.base.y + Math.sin(escort.angle + escort.phase) * escort.radius * 0.62;
        const heading = escort.angle + escort.phase + Math.PI / 2;
        drawEscort(ctx, orbitX, orbitY, heading, escort.size, escort.color);
      }

      for (const obstacle of state.obstacles) {
        drawObstacle(ctx, obstacle, state.elapsed);
      }

      for (const resource of state.resources) {
        if (!resource.collected) drawResource(ctx, resource);
      }

      for (const particle of state.particles) {
        ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (state.damageFlash > 0) {
        ctx.fillStyle = `rgba(248,113,113,${state.damageFlash * 0.16})`;
        ctx.fillRect(0, 0, width, height);
      }

      drawRocket(ctx, state.rocket.x, state.rocket.y, state.rocket.heading, state.elapsed);

      if (allCollected) {
        ctx.fillStyle = "rgba(74,222,128,0.16)";
        ctx.beginPath();
        ctx.roundRect(width / 2 - 160, 22, 320, 36, 999);
        ctx.fill();
        ctx.fillStyle = "rgba(220,252,231,0.96)";
        ctx.font = "600 14px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("资源收集完成，请返回基地完成对接", width / 2, 40);
      }
    };

    const loop = (now: number) => {
      if (disposedRef.current) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      render();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      disposedRef.current = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [planet.id, totalNeeded]);

  const collected = progress.metal + progress.crystal + progress.gas;
  const allCollected = collected >= totalNeeded;

  return (
    <div className="fixed inset-0 z-[95] h-screen w-screen overflow-hidden bg-[#040611] text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-x-0 top-6 z-[100] flex items-start justify-between gap-4 px-6 sm:px-8">
        <div className="pointer-events-auto rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-2.5 backdrop-blur-xl">
          <p className="text-[10px] tracking-[0.32em] text-cyan-200/80">资源回收航段 · {planet.name}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{collected}/{totalNeeded}</p>
          <p className="mt-1 text-[10px] tracking-[0.22em] text-white/60">
            {allCollected ? "返航基地进行对接" : "收集资源并避开障碍"}
          </p>
        </div>

        <div className="pointer-events-auto grid grid-cols-1 gap-2 rounded-2xl border border-white/15 bg-slate-950/70 px-3 py-2 backdrop-blur-xl">
          {ALL_KINDS.map((kind) => {
            const meta = KIND_META[kind];
            return (
              <div key={kind} className="flex items-center gap-2 text-[11px]">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    background: meta.color,
                    boxShadow: `0 0 8px ${meta.glow}`,
                  }}
                />
                <span className="w-14 text-white/82">{meta.label}</span>
                <span className="tabular-nums text-white/90">
                  {progress[kind]}/{REQUIRED_PER_KIND[kind]}
                </span>
              </div>
            );
          })}
          <div className="mt-1 border-t border-white/10 pt-2 text-[11px]">
            <div className="mb-1 flex items-center justify-between text-white/82">
              <span>稳定度</span>
              <span className="tabular-nums">{stability}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#fb7185_0%,#f59e0b_40%,#4ade80_100%)]"
                style={{ width: `${stability}%` }}
              />
            </div>
          </div>
          {allCollected && (
            <div className="mt-1 text-[11px] text-emerald-200/90">
              对接进度 {Math.round(dockProgress * 100)}%
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[100] flex justify-center">
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-2 text-[10px] tracking-[0.28em] text-white/74 backdrop-blur-xl">
          WASD / 方向键移动 · 接触资源回收 · 躲避陨石、机雷与残骸 · 收集完成后返回基地
        </div>
      </div>
    </div>
  );
}
