import React, { useEffect, useRef } from "react";
import {
  Vector3,
  MeshPhysicalMaterial,
  InstancedMesh,
  AmbientLight,
  SphereGeometry,
  Scene,
  Color,
  Object3D,
  SRGBColorSpace,
  MathUtils,
  PMREMGenerator,
  Vector2,
  WebGLRenderer,
  PerspectiveCamera,
  PointLight,
  ACESFilmicToneMapping,
  Plane,
  Raycaster,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Timer as ThreeTimer } from "three/examples/jsm/misc/Timer.js";

/* ---------- ThreeStage ---------- */

interface ThreeStageOpts {
  canvas?: HTMLCanvasElement;
  id?: string;
  size?: "parent" | Object;
  rendererOptions?: any;
  cameraMinAspect?: number;
  cameraMaxAspect?: number;
  maxPixelRatio?: number;
  minPixelRatio?: number;
}

class ThreeStage {
  opts: ThreeStageOpts;
  canvas!: HTMLCanvasElement;
  camera!: PerspectiveCamera;
  cameraMinAspect!: number;
  cameraMaxAspect!: number;
  cameraFov!: number;
  maxPixelRatio!: number;
  minPixelRatio!: number;
  scene!: Scene;
  renderer!: WebGLRenderer;
  pmrem: PMREMGenerator | null = null;
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  onBeforeRender = (_t: { elapsed: number; delta: number }) => {};
  onAfterRender = (_t: { elapsed: number; delta: number }) => {};
  onAfterResize = (_s: any) => {};
  #intersecting = false;
  #animating = false;
  isDisposed = false;
  #resizeObs: ResizeObserver | null = null;
  #intersectObs: IntersectionObserver | null = null;
  #resizeTimer: any = null;
  #timer: ThreeTimer = new ThreeTimer();
  #raf = 0;
  #clock = { elapsed: 0, delta: 0 };

  constructor(opts: ThreeStageOpts) {
    this.opts = { ...opts };
    this.#initCamera();
    this.#initScene();
    this.#initRenderer();
    if (!this.renderer) return;
    this.resize();
    this.#initObservers();
    this.start();
  }
  #initCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
    this.cameraMinAspect = this.opts.cameraMinAspect ?? 0;
    this.cameraMaxAspect = this.opts.cameraMaxAspect ?? Infinity;
    this.maxPixelRatio = this.opts.maxPixelRatio ?? 2;
    this.minPixelRatio = this.opts.minPixelRatio ?? 1;
  }
  #initScene() { this.scene = new Scene(); }
  #initRenderer() {
    const { canvas, id, rendererOptions } = this.opts;
    if (canvas) this.canvas = canvas;
    else if (id) this.canvas = document.getElementById(id) as HTMLCanvasElement;
    else console.error("Three: Missing canvas or id parameter");
    if (!this.canvas) return;
    this.canvas.style.display = "block";
    let probe: any = null;
    try { probe = this.canvas.getContext("webgl2") || this.canvas.getContext("webgl"); } catch {}
    if (!probe) { console.warn("Ballpit: WebGL not available; skipping."); return; }
    try {
      this.renderer = new WebGLRenderer({
        canvas: this.canvas,
        powerPreference: "high-performance",
        ...(rendererOptions ?? {}),
      });
    } catch (err) {
      console.error("Ballpit: WebGLRenderer construction failed", err);
      return;
    }
    this.renderer.outputColorSpace = SRGBColorSpace;
    try {
      this.pmrem = new PMREMGenerator(this.renderer);
    } catch {
      this.pmrem = null;
    }
  }
  #initObservers() {
    const size = this.opts.size;
    if (typeof size !== "object") {
      window.addEventListener("resize", this.#onWindowResize);
      const parent = this.canvas.parentNode as HTMLElement | null;
      if (size === "parent" && parent) {
        this.#resizeObs = new ResizeObserver(this.#onWindowResize);
        this.#resizeObs.observe(parent);
      }
    }
    this.#intersectObs = new IntersectionObserver(this.#onIntersect, { root: null, rootMargin: "0px", threshold: 0 });
    this.#intersectObs.observe(this.canvas);
    document.addEventListener("visibilitychange", this.#onVisibilityChange);
  }
  #teardownObservers() {
    window.removeEventListener("resize", this.#onWindowResize);
    this.#resizeObs?.disconnect();
    this.#intersectObs?.disconnect();
    document.removeEventListener("visibilitychange", this.#onVisibilityChange);
  }
  #onIntersect = (entries: IntersectionObserverEntry[]) => {
    this.#intersecting = entries[0].isIntersecting;
    this.#intersecting ? this.start() : this.stop();
  };
  #onVisibilityChange = () => {
    if (this.#intersecting) document.hidden ? this.stop() : this.start();
  };
  #onWindowResize = () => {
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
    this.#resizeTimer = setTimeout(() => this.resize(), 100);
  };
  resize() {
    let w: number, h: number;
    const size = this.opts.size;
    const parent = this.canvas.parentNode as HTMLElement | null;
    if (size instanceof Object) { w = (size as any).width; h = (size as any).height; }
    else if (size === "parent" && parent) { w = parent.clientWidth; h = parent.clientHeight; }
    else { w = window.innerWidth; h = window.innerHeight; }
    this.size.width = w; this.size.height = h;
    const ratio = w / h;
    this.size.ratio = ratio;
    if (ratio > (this.cameraMaxAspect as number)) { this.camera.fov = this.cameraFov; }
    else {
      const cmax = this.cameraMaxAspect === Infinity ? ratio : this.cameraMaxAspect;
      const cmin = this.cameraMinAspect === 0 ? 0.0001 : this.cameraMinAspect;
      this.camera.fov = this.cameraFov * (cmax / Math.max(ratio, cmin));
    }
    this.camera.aspect = ratio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    const pixelRatio = Math.min(this.maxPixelRatio, window.devicePixelRatio || 1);
    this.size.pixelRatio = pixelRatio;
    this.renderer.setPixelRatio(pixelRatio);
    this.size.wWidth = w * pixelRatio;
    this.size.wHeight = h * pixelRatio;
    this.onAfterResize(this.size);
  }
  start() {
    if (this.isDisposed) return;
    if (!this.#animating && this.renderer) {
      this.#animating = true;
      const tick = () => {
        if (!this.#animating) return;
        this.#raf = requestAnimationFrame(tick);
        this.#clock.delta = this.#timer.getDelta();
        this.#clock.elapsed = this.#timer.getElapsed();
        this.onBeforeRender(this.#clock);
        this.onAfterRender?.(this.#clock);
        this.renderer.render(this.scene, this.camera);
      };
      tick();
    }
  }
  stop() {
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#animating = false;
  }
  clear() {
    this.scene.traverse((obj: any) => {
      if (obj.isMesh && typeof obj.material === "object" && obj.material !== null) {
        Object.keys(obj.material).forEach((k: string) => {
          const v = (obj.material as any)[k];
          if (v !== null && typeof v === "object" && typeof v.dispose === "function") v.dispose();
        });
        obj.material.dispose();
        obj.geometry?.dispose?.();
      }
    });
    this.scene.clear();
  }
  dispose() {
    this.#teardownObservers();
    this.stop();
    this.#timer.dispose();
    this.clear();
    this.pmrem?.dispose?.();
    try { this.renderer?.dispose(); } catch {}
    // skip forceContextLoss so React StrictMode can remount safely
    this.isDisposed = true;
  }
}

/* ---------- Pointer tracker ---------- */

const pointerElems = new Map<HTMLElement, any>();
const tmpCoord = new Vector2();
let pointerActive = false;

function initPointerTracker(opts: {
  domElement: HTMLElement;
  onEnter?: () => void;
  onMove?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}) {
  const state = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter: opts.onEnter ?? (() => {}),
    onMove: opts.onMove ?? (() => {}),
    onClick: opts.onClick ?? (() => {}),
    onLeave: opts.onLeave ?? (() => {}),
    dispose: () => {
      pointerElems.delete(opts.domElement);
      if (pointerElems.size === 0) {
        document.body.removeEventListener("pointermove", onPointerMove);
        document.body.removeEventListener("pointerleave", onPointerLeave);
        document.body.removeEventListener("click", onPointerClick);
        document.body.removeEventListener("touchstart", onTouchStart);
        document.body.removeEventListener("touchmove", onTouchMove);
        document.body.removeEventListener("touchend", onTouchEnd);
        document.body.removeEventListener("touchcancel", onTouchEnd);
        pointerActive = false;
      }
    },
  };
  pointerElems.set(opts.domElement, state);
  if (!pointerActive) {
    document.body.addEventListener("pointermove", onPointerMove);
    document.body.addEventListener("pointerleave", onPointerLeave);
    document.body.addEventListener("click", onPointerClick);
    document.body.addEventListener("touchstart", onTouchStart, { passive: false });
    document.body.addEventListener("touchmove", onTouchMove, { passive: false });
    document.body.addEventListener("touchend", onTouchEnd);
    document.body.addEventListener("touchcancel", onTouchEnd);
    pointerActive = true;
  }
  return state;
}

function onPointerMove(e: PointerEvent) { tmpCoord.x = e.clientX; tmpCoord.y = e.clientY; processInteractions(); }
function onPointerLeave() { for (const s of pointerElems.values()) { if (s.hover) { s.hover = false; s.onLeave(); } } }
function onPointerClick() { for (const [el, s] of pointerElems) { const r = el.getBoundingClientRect(); updateStatePos(s, r); if (pointInsideRect(r)) s.onClick(); } }
function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 0) return;
  e.preventDefault();
  tmpCoord.x = e.touches[0].clientX;
  tmpCoord.y = e.touches[0].clientY;
  for (const [el, s] of pointerElems) {
    const r = el.getBoundingClientRect();
    if (pointInsideRect(r)) { s.touching = true; updateStatePos(s, r); if (!s.hover) { s.hover = true; s.onEnter(); } s.onMove(); }
  }
}
function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 0) return;
  e.preventDefault();
  tmpCoord.x = e.touches[0].clientX;
  tmpCoord.y = e.touches[0].clientY;
  for (const [el, s] of pointerElems) {
    const r = el.getBoundingClientRect();
    updateStatePos(s, r);
    if (pointInsideRect(r)) { if (!s.hover) { s.hover = true; s.touching = true; s.onEnter(); } s.onMove(); }
    else if (s.hover && s.touching) s.onMove();
  }
}
function onTouchEnd() { for (const s of pointerElems.values()) { if (s.touching) { s.touching = false; if (s.hover) { s.hover = false; s.onLeave(); } } } }
function updateStatePos(s: any, rect: DOMRect) {
  s.position.x = tmpCoord.x - rect.left;
  s.position.y = tmpCoord.y - rect.top;
  s.nPosition.x = (s.position.x / rect.width) * 2 - 1;
  s.nPosition.y = (-s.position.y / rect.height) * 2 + 1;
}
function pointInsideRect(r: DOMRect) {
  return tmpCoord.x >= r.left && tmpCoord.x <= r.left + r.width && tmpCoord.y >= r.top && tmpCoord.y <= r.top + r.height;
}
function processInteractions() {
  for (const [el, s] of pointerElems) {
    const r = el.getBoundingClientRect();
    if (pointInsideRect(r)) {
      updateStatePos(s, r);
      if (!s.hover) { s.hover = true; s.onEnter(); }
      s.onMove();
    } else if (s.hover && !s.touching) { s.hover = false; s.onLeave(); }
  }
}

/* ---------- Physics ---------- */

interface BallPhysicsConfig {
  count: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  maxSize: number;
  size0: number;
  minSize: number;
  maxVelocity: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  controlSphere0: boolean;
  followCursor?: boolean;
}

class BallPhysics {
  config: BallPhysicsConfig;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center = new Vector3();
  constructor(config: BallPhysicsConfig) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.#seedPositions();
    this.setSizes();
  }
  #seedPositions() {
    const cfg = this.config;
    const pos = this.positionData;
    this.center.toArray(pos, 0);
    for (let i = 1; i < cfg.count; i++) {
      const s = 3 * i;
      pos[s] = MathUtils.randFloatSpread(2 * cfg.maxX);
      pos[s + 1] = MathUtils.randFloatSpread(2 * cfg.maxY);
      pos[s + 2] = MathUtils.randFloatSpread(2 * cfg.maxZ);
    }
  }
  setSizes() {
    const cfg = this.config;
    const sz = this.sizeData;
    sz[0] = cfg.size0;
    for (let i = 1; i < cfg.count; i++) sz[i] = MathUtils.randFloat(cfg.minSize, cfg.maxSize);
  }
  update(e: { delta: number }) {
    const cfg = this.config;
    const pos = this.positionData;
    const sz = this.sizeData;
    const vel = this.velocityData;
    let start = 0;
    const c0 = new Vector3();
    const I = new Vector3();
    const O = new Vector3();
    const B = new Vector3();
    const N = new Vector3();
    const diff = new Vector3();
    const j = new Vector3();
    const H = new Vector3();
    const T = new Vector3();

    if (cfg.controlSphere0) {
      start = 1;
      c0.fromArray(pos, 0);
      c0.lerp(this.center, 0.1).toArray(pos, 0);
      B.set(0, 0, 0).toArray(vel, 0);
    }
    for (let idx = start; idx < cfg.count; idx++) {
      const base = 3 * idx;
      I.fromArray(pos, base);
      B.fromArray(vel, base);
      B.y -= e.delta * cfg.gravity * sz[idx];
      B.multiplyScalar(cfg.friction);
      B.clampLength(0, cfg.maxVelocity);
      I.add(B);
      I.toArray(pos, base);
      B.toArray(vel, base);
    }
    for (let idx = start; idx < cfg.count; idx++) {
      const base = 3 * idx;
      I.fromArray(pos, base);
      B.fromArray(vel, base);
      const radius = sz[idx];
      for (let jdx = idx + 1; jdx < cfg.count; jdx++) {
        const otherBase = 3 * jdx;
        O.fromArray(pos, otherBase);
        N.fromArray(vel, otherBase);
        const otherRadius = sz[jdx];
        diff.copy(O).sub(I);
        const dist = diff.length();
        const sumRadius = radius + otherRadius;
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          j.copy(diff).normalize().multiplyScalar(0.5 * overlap);
          H.copy(j).multiplyScalar(Math.max(B.length(), 1));
          T.copy(j).multiplyScalar(Math.max(N.length(), 1));
          I.sub(j);
          B.sub(H);
          I.toArray(pos, base);
          B.toArray(vel, base);
          O.add(j);
          N.add(T);
          O.toArray(pos, otherBase);
          N.toArray(vel, otherBase);
        }
      }
      if (cfg.controlSphere0) {
        diff.copy(c0).sub(I);
        const dist = diff.length();
        const sumRadius0 = radius + sz[0];
        if (dist < sumRadius0) {
          const diff2 = sumRadius0 - dist;
          j.copy(diff).normalize().multiplyScalar(diff2);
          H.copy(j).multiplyScalar(Math.max(B.length(), 2));
          I.sub(j);
          B.sub(H);
        }
      }
      if (Math.abs(I.x) + radius > cfg.maxX) { I.x = Math.sign(I.x) * (cfg.maxX - radius); B.x = -B.x * cfg.wallBounce; }
      if (cfg.gravity === 0) {
        if (Math.abs(I.y) + radius > cfg.maxY) { I.y = Math.sign(I.y) * (cfg.maxY - radius); B.y = -B.y * cfg.wallBounce; }
      } else if (I.y - radius < -cfg.maxY) { I.y = -cfg.maxY + radius; B.y = -B.y * cfg.wallBounce; }
      const maxBoundary = Math.max(cfg.maxZ, cfg.maxSize);
      if (Math.abs(I.z) + radius > maxBoundary) { I.z = Math.sign(I.z) * (cfg.maxZ - radius); B.z = -B.z * cfg.wallBounce; }
      I.toArray(pos, base);
      B.toArray(vel, base);
    }
  }
}

/* ---------- Material + planet palette + scene ---------- */

class GlossyMeshPhysicalMaterial extends MeshPhysicalMaterial {
  constructor(params: any) { super(params); }
}

const PLANET_PALETTE = [
  0x0b1024, // deep space
  0xc1440e, // Mars rust
  0x2a4e9b, // deep ocean blue
  0xd4a04b, // Saturn gold
  0x7dd6c9, // Uranus teal
  0x3964d6, // Neptune deep
  0xb8b3a6, // Moon rock
  0x9b8aa6, // dwarf planet purple
  0xe8eef5, // ice white
];

const DEFAULT_CONFIG = {
  count: 220,
  colors: PLANET_PALETTE,
  ambientColor: 16777215,
  ambientIntensity: 0.35,
  lightIntensity: 240,
  materialParams: {
    metalness: 0.05,
    roughness: 0.95,
    clearcoat: 0.0,
    clearcoatRoughness: 0.6,
    sheen: 0.4,
    sheenRoughness: 0.7,
    sheenColor: 0xffffff,
  },
  minSize: 0.45,
  maxSize: 1.4,
  size0: 1.6,
  gravity: 0.7,
  friction: 0.8,
  wallBounce: 0.95,
  maxVelocity: 0.2,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true,
};

const dummy = new Object3D();

function buildColorRamp(colors: number[]) {
  const cs: Color[] = colors.map((c) => new Color(c));
  return (ratio: number, out: Color = new Color()) => {
    const scaled = Math.max(0, Math.min(1, ratio)) * (cs.length - 1);
    const idx = Math.floor(scaled);
    const start = cs[idx];
    if (idx >= cs.length - 1) return start.clone();
    const alpha = scaled - idx;
    const end = cs[idx + 1];
    out.r = start.r + alpha * (end.r - start.r);
    out.g = start.g + alpha * (end.g - start.g);
    out.b = start.b + alpha * (end.b - start.b);
    return out;
  };
}

class BallSpheres extends InstancedMesh {
  config: any;
  physics: BallPhysics;
  ambientLight: AmbientLight;
  light: PointLight;
  fill: PointLight;
  colorRamp: any;
  constructor(renderer: WebGLRenderer, opts: any = {}) {
    const cfg = { ...DEFAULT_CONFIG, ...opts };
    const env = new RoomEnvironment();
    let envMap: any = null;
    try { envMap = new PMREMGenerator(renderer).fromScene(env, 0.04).texture; } catch {}
    const mat = new GlossyMeshPhysicalMaterial({ envMap, ...cfg.materialParams });
    mat.envMapRotation.x = -Math.PI / 2;
    super(new SphereGeometry(1, 24, 24), mat, cfg.count);
    this.config = cfg;
    this.physics = new BallPhysics(cfg);
    this.ambientLight = new AmbientLight(cfg.ambientColor, cfg.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new PointLight(0xfff6e6, cfg.lightIntensity);
    this.light.position.set(8, 6, 14);
    this.add(this.light);
    this.fill = new PointLight(0x88aaff, cfg.lightIntensity * 0.5);
    this.fill.position.set(-9, -4, -8);
    this.add(this.fill);
    if (Array.isArray(cfg.colors) && cfg.colors.length > 1) {
      this.colorRamp = buildColorRamp(cfg.colors);
      for (let idx = 0; idx < this.count; idx++) {
        const c = this.colorRamp(idx / this.count);
        this.setColorAt(idx, c);
      }
      const ic = this.instanceColor as any;
      if (ic) ic.needsUpdate = true;
    }
  }
  update(e: { delta: number }) {
    this.physics.update(e);
    for (let idx = 0; idx < this.count; idx++) {
      dummy.position.fromArray(this.physics.positionData, 3 * idx);
      if (idx === 0 && this.config.followCursor === false) {
        dummy.scale.setScalar(0);
      } else {
        dummy.scale.setScalar(this.physics.sizeData[idx]);
      }
      dummy.updateMatrix();
      this.setMatrixAt(idx, dummy.matrix);
      if (idx === 0 && this.light) this.light.position.copy(dummy.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

/* ---------- Factory + React component ---------- */

function createBallpit(canvas: HTMLCanvasElement, opts: any = {}) {
  let stage: ThreeStage;
  try {
    stage = new ThreeStage({ canvas, size: "parent", rendererOptions: { antialias: true, alpha: true } });
  } catch (err) {
    console.error("Ballpit: failed to create ThreeStage", err);
    return null as any;
  }
  if (!stage.renderer) return null as any;
  stage.renderer.toneMapping = ACESFilmicToneMapping;
  stage.camera.position.set(0, 0, 20);
  stage.camera.lookAt(0, 0, 0);
  stage.cameraMaxAspect = 1.5;

  let spheres: BallSpheres;
  const init = (config: any) => {
    if (spheres) { stage.clear(); stage.scene.remove(spheres); }
    spheres = new BallSpheres(stage.renderer, config);
    stage.scene.add(spheres);
    stage.resize();
  };
  init(opts);

  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const hit = new Vector3();
  let paused = false;

  canvas.style.touchAction = "none";
  canvas.style.userSelect = "none";
  (canvas.style as any).webkitUserSelect = "none";

  const pointer = initPointerTracker({
    domElement: canvas,
    onMove: () => {
      raycaster.setFromCamera(pointer.nPosition, stage.camera);
      stage.camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, hit);
      spheres.physics.center.copy(hit);
      spheres.config.controlSphere0 = true;
    },
    onLeave: () => { spheres.config.controlSphere0 = false; },
  });

  stage.onBeforeRender = (t: { delta: number; elapsed: number }) => { if (!paused) spheres.update(t); };
  stage.onAfterResize = (s: { wWidth: number; wHeight: number }) => {
    spheres.config.maxX = s.wWidth / 2;
    spheres.config.maxY = s.wHeight / 2;
  };

  return {
    three: stage,
    get spheres() { return spheres; },
    setCount(n: number) { init({ ...spheres.config, count: n }); },
    togglePause() { paused = !paused; },
    dispose() {
      try { pointer.dispose(); } catch {}
      try { stage.dispose(); } catch {}
    },
  };
}

export interface BallpitProps {
  className?: string;
  count?: number;
  gravity?: number;
  friction?: number;
  wallBounce?: number;
  followCursor?: boolean;
  colors?: number[];
  ambientColor?: number;
  ambientIntensity?: number;
  lightIntensity?: number;
  minSize?: number;
  maxSize?: number;
  size0?: number;
  maxVelocity?: number;
  maxX?: number;
  maxY?: number;
  maxZ?: number;
}

const Ballpit: React.FC<BallpitProps> = ({ className = "", followCursor = true, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spheresInstanceRef = useRef<ReturnType<typeof createBallpit> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let instance: ReturnType<typeof createBallpit> | null = null;
    try {
      instance = createBallpit(canvas, { followCursor, ...props });
    } catch (e) {
      console.error("Ballpit init failed", e);
    }
    spheresInstanceRef.current = instance;
    return () => {
      try { instance?.dispose?.(); } catch (e) { console.warn("Ballpit dispose warning:", e); }
      if (spheresInstanceRef.current === instance) spheresInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

export default Ballpit;
