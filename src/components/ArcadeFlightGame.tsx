import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { SolarPlanet } from "./SolarSystem";

type ArcadeFlightGameProps = {
  planet: SolarPlanet;
  onExit: () => void;
  onRestart: () => void;
  onEnterCollection?: () => void;
};

const ROCKET_MODEL_URL =
  "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/explorer-jupiter-c-rocket/Explorer%20Jupiter-C%20Rocket.glb";

type RocketHandle = {
  group: THREE.Group;
  velocity: THREE.Vector3;
  bbox: THREE.Box3;
  halfSize: THREE.Vector3;
};

type Hazard = {
  object: THREE.Object3D;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  bbox: THREE.Box3;
  radius: number;
  points: number;
  color: number;
};

type FlybyShip = {
  object: THREE.Group;
  velocity: THREE.Vector3;
  wobble: number;
  phase: number;
};

type Bullet = {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
};

type Particle = {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
};

type KeyState = { fire: boolean };

const INITIAL_LIVES = 3;
const ROCKET_SPEED = 18;
const WORLD_BOUND_X = 110; // forward axis (head is +X)
const WORLD_BOUND_Y = 9;
const WORLD_BOUND_Z = 14; // lateral drift bounds
const BULLET_SPEED = 60;
const BULLET_LIFE = 1.4;
const FIRE_COOLDOWN = 0.18;
const METEOR_BASE_SPEED = 26;
const SPAWN_INTERVAL_START = 0.85;
const SPAWN_INTERVAL_MIN = 0.32;
const SCORE_PER_METEOR = 25;
const STAR_COUNT = 700;
const HAZARD_SPAWN_DISTANCE = 120;

function disposeObjectMaterials(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
    else child.material.dispose();
  });
}

function normalizeRocketModel(source: THREE.Object3D) {
  // Build a horizontal rocket whose long axis is X (head at -X, tail at +X).
  // The GLB may be authored in any orientation, so we fit a bounding box and
  // pick whichever world axis is the longest to use as the long axis.
  const root = new THREE.Group();
  const model = source.clone(true);
  root.add(model);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  const fitScale = 1.6 / Math.max(size.x || 1, size.y || 1, size.z || 1);
  model.position.sub(center);
  model.scale.setScalar(fitScale);
  const fitted = new THREE.Box3().setFromObject(root);
  const fittedSize = new THREE.Vector3();
  fitted.getSize(fittedSize);
  const longAxis = fittedSize.x >= fittedSize.y && fittedSize.x >= fittedSize.z
    ? "x"
    : fittedSize.y >= fittedSize.z
      ? "y"
      : "z";
  // Rotate root so the longest axis of the model ends up on the world X axis.
  if (longAxis === "y") root.rotation.z = Math.PI / 2;
  else if (longAxis === "z") root.rotation.y = Math.PI / 2;
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = false;
    child.receiveShadow = false;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if ("emissive" in material) {
        material.emissive = new THREE.Color("#1d4ed8");
        material.emissiveIntensity = Math.max(material.emissiveIntensity ?? 0, 0.18);
      }
    });
  });
  return root;
}

function createFallbackRocket() {
  // Head points along -X, tail along +X. Same orientation as the GLB after
  // normalizeRocketModel applies its z-rotation, so the gameplay camera (which
  // sits at +X behind the ship) reads the rocket horizontally.
  const rocket = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 2.4, 24),
    new THREE.MeshStandardMaterial({
      color: 0xe8eefc,
      emissive: new THREE.Color("#7db7ff"),
      emissiveIntensity: 0.4,
      metalness: 0.4,
      roughness: 0.35,
    }),
  );
  body.rotation.z = Math.PI / 2; // lay the cylinder on its side along X
  rocket.add(body);
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.7, 24),
    new THREE.MeshStandardMaterial({
      color: 0xcfdcff,
      emissive: new THREE.Color("#4f8fff"),
      emissiveIntensity: 0.5,
      metalness: 0.25,
      roughness: 0.3,
    }),
  );
  nose.rotation.z = -Math.PI / 2; // cone tip points along -X (front)
  nose.position.x = -1.55;
  rocket.add(nose);
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x7dc1ff,
    emissive: new THREE.Color("#51a6ff"),
    emissiveIntensity: 0.7,
    metalness: 0.2,
    roughness: 0.5,
  });
  for (let i = 0; i < 4; i += 1) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.08), finMaterial);
    fin.position.x = 0.85; // sit near the tail
    fin.rotation.y = (Math.PI / 2) * i;
    fin.position.y = Math.cos(fin.rotation.y) * 0.28;
    fin.position.z = Math.sin(fin.rotation.y) * 0.28;
    rocket.add(fin);
  }
  const plume = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 1.1, 18),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85 }),
  );
  plume.rotation.z = Math.PI / 2; // cone tip points along +X (back / tail)
  plume.position.x = 1.75;
  rocket.add(plume);
  return rocket;
}

function pickMeteorGeometry(): THREE.BufferGeometry {
  const radius = 0.6 + Math.random() * 0.9;
  const detail = Math.random() > 0.5 ? 1 : 0;
  const geom = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geom.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    const noise = 0.85 + Math.random() * 0.3;
    pos.setXYZ(i, (x / len) * radius * noise, (y / len) * radius * noise, (z / len) * radius * noise);
  }
  geom.computeVertexNormals();
  return geom;
}

function buildStars(): THREE.Points {
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i += 1) {
    const r = 80 + Math.random() * 60;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3] = -Math.random() * WORLD_BOUND_X * 2;
  }
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geom,
    new THREE.PointsMaterial({ color: 0xcbd5ff, size: 0.18, sizeAttenuation: true, transparent: true, opacity: 0.8 }),
  );
}

function buildNebulaField(color: string): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < 8; i += 1) {
    const cloud = new THREE.Mesh(
      new THREE.SphereGeometry(10 + Math.random() * 8, 18, 18),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).offsetHSL((Math.random() - 0.5) * 0.08, 0.08, 0.12),
        transparent: true,
        opacity: 0.08 + Math.random() * 0.08,
        depthWrite: false,
      }),
    );
    cloud.position.set(
      -70 - Math.random() * 90,
      (Math.random() - 0.5) * 36,
      (Math.random() - 0.5) * 46,
    );
    cloud.scale.set(1.8 + Math.random(), 0.65 + Math.random() * 0.4, 1.4 + Math.random() * 0.7);
    group.add(cloud);
  }
  return group;
}

function buildDistantPlanet(color: string): THREE.Group {
  const group = new THREE.Group();
  const planetCore = new THREE.Mesh(
    new THREE.SphereGeometry(18, 40, 40),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color).offsetHSL(0, 0.08, -0.1),
      roughness: 0.9,
      metalness: 0.02,
    }),
  );
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(24, 32, 32),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).offsetHSL(0.02, 0.1, 0.22),
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    }),
  );
  group.add(glow);
  group.add(planetCore);
  group.position.set(-150, -26, -58);
  return group;
}

function buildLaneLines(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.22 });
  for (let i = 0; i < 6; i += 1) {
    const z = -12 + i * 4.8;
    const points = [
      new THREE.Vector3(10, -7.5, z),
      new THREE.Vector3(-170, -6.2 + Math.sin(i) * 1.2, z * 1.08),
    ];
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
    group.add(line);
  }
  return group;
}

function buildSpaceBase(): THREE.Group {
  const base = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(6.2, 0.42, 18, 48),
    new THREE.MeshStandardMaterial({
      color: 0xc8d8ff,
      emissive: new THREE.Color("#8dd3ff"),
      emissiveIntensity: 0.35,
      metalness: 0.6,
      roughness: 0.3,
    }),
  );
  ring.rotation.y = Math.PI / 2;
  base.add(ring);
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.6, 5.4, 18),
    new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: new THREE.Color("#60a5fa"),
      emissiveIntensity: 0.2,
      metalness: 0.55,
      roughness: 0.35,
    }),
  );
  hub.rotation.z = Math.PI / 2;
  base.add(hub);
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.9 }),
  );
  base.add(beacon);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    emissive: new THREE.Color("#2563eb"),
    emissiveIntensity: 0.45,
    metalness: 0.4,
    roughness: 0.45,
  });
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.16, 0.16), panelMaterial);
    arm.position.y = side * 2.1;
    base.add(arm);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 0.08), panelMaterial);
    panel.position.set(0, side * 3.6, 0);
    base.add(panel);
  }
  return base;
}

function buildEscortShip(color: string): THREE.Group {
  const ship = new THREE.Group();
  const hullMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.35,
    metalness: 0.4,
    roughness: 0.32,
  });
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 1.8, 14), hullMaterial);
  hull.rotation.z = Math.PI / 2;
  ship.add(hull);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 14), hullMaterial);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = -1.08;
  ship.add(nose);
  const wingMaterial = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    emissive: new THREE.Color("#7dd3fc"),
    emissiveIntensity: 0.55,
    metalness: 0.18,
    roughness: 0.52,
  });
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 1.1), wingMaterial);
    wing.position.set(0.15, 0, side * 0.48);
    ship.add(wing);
  }
  return ship;
}

function createMineHazard(color: string): { object: THREE.Group; radius: number } {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 18, 18),
    new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.22,
      roughness: 0.5,
      metalness: 0.6,
    }),
  );
  group.add(core);
  const spikeMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.35,
    metalness: 0.75,
  });
  const directions = [
    new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
  ];
  directions.forEach((direction) => {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 10), spikeMaterial);
    spike.position.copy(direction.clone().multiplyScalar(0.68));
    spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    group.add(spike);
  });
  return { object: group, radius: 1.15 };
}

function createDebrisHazard(): { object: THREE.Group; radius: number } {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.85,
    metalness: 0.2,
  });
  for (let i = 0; i < 4; i += 1) {
    const shard = new THREE.Mesh(
      new THREE.BoxGeometry(0.45 + Math.random() * 0.4, 0.22 + Math.random() * 0.16, 1 + Math.random() * 0.7),
      material,
    );
    shard.position.set(
      (Math.random() - 0.5) * 1.3,
      (Math.random() - 0.5) * 0.9,
      (Math.random() - 0.5) * 1.1,
    );
    shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    group.add(shard);
  }
  return { object: group, radius: 1.3 };
}

export default function ArcadeFlightGame({
  planet,
  onExit,
  onRestart,
  onEnterCollection,
}: ArcadeFlightGameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const stateRef = useRef({ score: 0, lives: INITIAL_LIVES, gameOver: false, paused: false, elapsed: 0 });
  // After this many seconds the meteor phase is over and we hand off to the
  // 2D resource collection minigame. Guard with handedOff so the callback
  // fires exactly once.
  const COLLECTION_HANDOVER_SECONDS = 20;
  const handedOffRef = useRef(false);

  useEffect(() => {
    stateRef.current = { score, lives, gameOver, paused, elapsed: stateRef.current.elapsed };
  }, [score, lives, gameOver, paused]);

  const updateScore = useCallback((delta: number) => {
    stateRef.current.score += delta;
    setScore(stateRef.current.score);
  }, []);
  const updateLives = useCallback((delta: number) => {
    stateRef.current.lives = Math.max(0, stateRef.current.lives + delta);
    setLives(stateRef.current.lives);
    if (stateRef.current.lives <= 0) {
      stateRef.current.gameOver = true;
      setGameOver(true);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(planet.color);
    // Push the fog far end out so meteors spawning ~120 units in front of the
    // player remain visible instead of fading into the planetary haze.
    scene.fog = new THREE.Fog(planet.color, 60, 220);

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 320);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(8, 12, 12);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(new THREE.Color(planet.glow), 1.1);
    fillLight.position.set(-10, -6, 10);
    scene.add(fillLight);

    const stars = buildStars();
    scene.add(stars);
    const nebulaField = buildNebulaField(planet.glow);
    scene.add(nebulaField);
    const distantPlanet = buildDistantPlanet(planet.color);
    scene.add(distantPlanet);
    const laneLines = buildLaneLines();
    scene.add(laneLines);
    const baseGroup = buildSpaceBase();
    scene.add(baseGroup);
    const flybyShips: FlybyShip[] = [];
    for (let i = 0; i < 3; i += 1) {
      const escort = buildEscortShip(i % 2 === 0 ? "#67e8f9" : "#a78bfa");
      escort.position.set(28 + i * 12, (i - 1) * 3, (Math.random() - 0.5) * 10);
      scene.add(escort);
      flybyShips.push({
        object: escort,
        velocity: new THREE.Vector3(-(10 + Math.random() * 6), 0, 0),
        wobble: 0.4 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const trail = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 1.4, 18),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.55 }),
    );
    trail.rotation.z = -Math.PI / 2; // cone tip points along rocket tail (+X = backward when head is -X)
    trail.position.set(2.4, 0, 0); // sit behind the rocket body
    const trailGroup = new THREE.Group();
    trailGroup.add(trail);
    // NOTE: trailGroup is attached to rocketGroup once the rocket model is loaded so it follows the ship

    const rocketGroup = new THREE.Group();
    scene.add(rocketGroup);
    rocketGroup.add(trailGroup); // attach trail up front so it follows whichever rocket loads

    let rocketLoaded = false;
    const loader = new GLTFLoader();
    loader.load(
      ROCKET_MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const normalized = normalizeRocketModel(gltf.scene);
        rocketGroup.add(normalized);
        rocketLoaded = true;
      },
      undefined,
      () => {
        if (disposed) return;
        const fallback = createFallbackRocket();
        rocketGroup.add(fallback);
        rocketLoaded = true;
      },
    );
    const fallbackTimer = window.setTimeout(() => {
      if (!disposed && !rocketLoaded) {
        rocketGroup.add(createFallbackRocket());
        rocketLoaded = true;
      }
    }, 1800);

    const cameraTarget = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();

    const rocketState: RocketHandle = {
      group: rocketGroup,
      velocity: new THREE.Vector3(),
      bbox: new THREE.Box3(),
      halfSize: new THREE.Vector3(1.1, 0.55, 0.55),
    };

    const keys: KeyState = { fire: false };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.code) {
        case "Space": keys.fire = true; e.preventDefault(); break;
        case "KeyP": case "Escape":
          if (!stateRef.current.gameOver) setPaused((p) => !p);
          break;
        case "Enter":
          if (stateRef.current.gameOver) {
            stateRef.current.gameOver = false;
            stateRef.current.lives = INITIAL_LIVES;
            stateRef.current.score = 0;
            setLives(INITIAL_LIVES);
            setScore(0);
            setGameOver(false);
          }
          break;
        default: break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space": keys.fire = false; break;
        default: break;
      }
    };
    const onBlur = () => {
      keys.fire = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    const hazards: Hazard[] = [];
    const bullets: Bullet[] = [];
    const particles: Particle[] = [];
    const bulletGeometry = new THREE.SphereGeometry(0.14, 12, 12);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xfde68a });
    const particleGeometry = new THREE.SphereGeometry(0.16, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.9 });

    const spawnHazard = () => {
      const forward = forwardVec.lengthSq() > 0
        ? forwardVec.clone().normalize()
        : new THREE.Vector3(-1, 0, 0);
      const spawnAhead = rocketGroup.position.clone().addScaledVector(forward, HAZARD_SPAWN_DISTANCE);
      const right = Math.abs(forward.y) < 0.99
        ? new THREE.Vector3(0, 1, 0).cross(forward).normalize()
        : new THREE.Vector3(1, 0, 0);
      const up = forward.clone().cross(right).normalize();
      const r = (0.15 + Math.random() * 0.8) * WORLD_BOUND_Y;
      const theta = Math.random() * Math.PI * 2;
      const lateralOffset = right.clone().multiplyScalar(Math.cos(theta) * r)
        .add(up.clone().multiplyScalar(Math.sin(theta) * r));
      const roll = Math.random();

      if (roll < 0.58) {
        const radius = 0.7 + Math.random() * 1.1;
        const geom = pickMeteorGeometry();
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.04 + Math.random() * 0.06, 0.4, 0.35 + Math.random() * 0.2),
          roughness: 0.85,
          metalness: 0.1,
          flatShading: true,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(spawnAhead).add(lateralOffset);
        const speed = METEOR_BASE_SPEED + Math.random() * 18;
        const velocity = forward.clone().multiplyScalar(-speed);
        const angularVelocity = new THREE.Vector3(
          (Math.random() - 0.5) * 2.4,
          (Math.random() - 0.5) * 2.4,
          (Math.random() - 0.5) * 2.4,
        );
        scene.add(mesh);
        hazards.push({
          object: mesh,
          velocity,
          angularVelocity,
          bbox: new THREE.Box3(),
          radius,
          points: SCORE_PER_METEOR,
          color: 0xfde68a,
        });
        return;
      }

      if (roll < 0.82) {
        const mine = createMineHazard(planet.glow);
        mine.object.position.copy(spawnAhead).add(lateralOffset);
        const speed = METEOR_BASE_SPEED * 0.65 + Math.random() * 8;
        scene.add(mine.object);
        hazards.push({
          object: mine.object,
          velocity: forward.clone().multiplyScalar(-speed),
          angularVelocity: new THREE.Vector3(0.9, 1.8, 0.7),
          bbox: new THREE.Box3(),
          radius: mine.radius,
          points: 40,
          color: 0xfca5a5,
        });
        return;
      }

      const debris = createDebrisHazard();
      debris.object.position.copy(spawnAhead).add(lateralOffset);
      const speed = METEOR_BASE_SPEED * 0.8 + Math.random() * 10;
      scene.add(debris.object);
      hazards.push({
        object: debris.object,
        velocity: forward.clone().multiplyScalar(-speed),
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 1.8,
        ),
        bbox: new THREE.Box3(),
        radius: debris.radius,
        points: 30,
        color: 0xbfdbfe,
      });
    };

    const spawnParticles = (position: THREE.Vector3, count: number, color: number) => {
      for (let i = 0; i < count; i += 1) {
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(particleGeometry, mat);
        mesh.position.copy(position);
        const dir = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ).normalize();
        const velocity = dir.multiplyScalar(2 + Math.random() * 5);
        scene.add(mesh);
        particles.push({ mesh, velocity, life: 0.6, maxLife: 0.6 });
      }
    };

    const clock = new THREE.Clock();
    let raf = 0;
    let disposed = false;
    let fireCooldown = 0;
    let spawnTimer = 0;
    let difficulty = 0;

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const mouseNdc = { x: 0, y: 0, active: false };
    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseNdc.active = true;
    };
    const onMouseLeave = () => { mouseNdc.active = false; mouseNdc.x = 0; mouseNdc.y = 0; };
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseleave", onMouseLeave);
    const mouseAccel = new THREE.Vector3();
    const forwardVec = new THREE.Vector3();
    const chaseOffsetLocal = new THREE.Vector3();

    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      stateRef.current.elapsed += delta;
      const elapsed = stateRef.current.elapsed;
      const isPaused = stateRef.current.paused || stateRef.current.gameOver;

      // Hand off to the 2D resource collection minigame once the meteor phase
      // has run long enough. Skip while paused or game-over so the player can
      // still use the existing controls in those states.
      if (
        !isPaused &&
        onEnterCollection &&
        !handedOffRef.current &&
        elapsed >= COLLECTION_HANDOVER_SECONDS
      ) {
        handedOffRef.current = true;
        onEnterCollection();
        return;
      }

      if (!isPaused) {
        difficulty = Math.min(1, elapsed / 60);

        // Mouse drives the rocket flight direction. The rocket local -X is
        // its nose, so we steer yaw/pitch from mouse NDC and then push the
        // ship forward along its own local -X axis.
        const mx = mouseNdc.active ? mouseNdc.x : 0;
        const my = mouseNdc.active ? mouseNdc.y : 0;
        const targetYaw = THREE.MathUtils.clamp(-mx * 1.1, -1.1, 1.1);
        const targetPitchAxis = THREE.MathUtils.clamp(-my * 0.7, -0.7, 0.7);
        rocketGroup.rotation.y += (targetYaw - rocketGroup.rotation.y) * Math.min(1, delta * 4);
        rocketGroup.rotation.z += (targetPitchAxis - rocketGroup.rotation.z) * Math.min(1, delta * 4);
        forwardVec.set(-1, 0, 0).applyQuaternion(rocketGroup.quaternion).normalize();
        mouseAccel.copy(forwardVec).multiplyScalar(ROCKET_SPEED);
        rocketState.velocity.lerp(mouseAccel, Math.min(1, delta * 4));
        rocketGroup.position.addScaledVector(rocketState.velocity, delta);
        rocketGroup.position.x = THREE.MathUtils.clamp(rocketGroup.position.x, -WORLD_BOUND_X, 6);
        rocketGroup.position.y = THREE.MathUtils.clamp(rocketGroup.position.y, -WORLD_BOUND_Y, WORLD_BOUND_Y);
        rocketGroup.position.z = THREE.MathUtils.clamp(rocketGroup.position.z, -WORLD_BOUND_Z, WORLD_BOUND_Z);
        chaseOffsetLocal.set(7.2, 1.6, 0).applyQuaternion(rocketGroup.quaternion);
        cameraTarget.copy(rocketGroup.position).add(chaseOffsetLocal);
        lookTarget.copy(rocketGroup.position);
        camera.position.lerp(cameraTarget, Math.min(1, delta * 5));
        camera.lookAt(lookTarget);

        rocketState.bbox.setFromCenterAndSize(
          rocketGroup.position,
          new THREE.Vector3(rocketState.halfSize.x * 2, rocketState.halfSize.y * 2, rocketState.halfSize.z * 2),
        );

        spawnTimer += delta;
        const spawnInterval = THREE.MathUtils.lerp(SPAWN_INTERVAL_START, SPAWN_INTERVAL_MIN, difficulty);
        if (spawnTimer >= spawnInterval) {
          spawnTimer = 0;
          spawnHazard();
          if (Math.random() < 0.25 + difficulty * 0.35) spawnHazard();
        }

        fireCooldown -= delta;
        if (keys.fire && fireCooldown <= 0) {
          fireCooldown = FIRE_COOLDOWN;
          const muzzleLocal = new THREE.Vector3(-2.2, 0, 0).applyQuaternion(rocketGroup.quaternion);
          const muzzle = rocketGroup.position.clone().add(muzzleLocal);
          const mesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
          mesh.position.copy(muzzle);
          const velocity = forwardVec.clone().multiplyScalar(BULLET_SPEED);
          scene.add(mesh);
          bullets.push({ mesh, velocity, life: BULLET_LIFE });
        }

        for (let i = bullets.length - 1; i >= 0; i -= 1) {
          const b = bullets[i];
          b.mesh.position.addScaledVector(b.velocity, delta);
          b.life -= delta;
          if (b.life <= 0) {
            scene.remove(b.mesh);
            bullets.splice(i, 1);
          }
        }

        const handoffProgress = THREE.MathUtils.clamp(elapsed / COLLECTION_HANDOVER_SECONDS, 0, 1);
        const baseDistance = THREE.MathUtils.lerp(170, 64, handoffProgress);
        baseGroup.position.copy(rocketGroup.position).addScaledVector(forwardVec, baseDistance);
        baseGroup.position.y += 2.6 + Math.sin(elapsed * 0.8) * 1.4;
        baseGroup.position.z += Math.cos(elapsed * 0.5) * 5.5;
        baseGroup.rotation.x += delta * 0.08;
        baseGroup.rotation.z += delta * 0.12;
        const baseScale = THREE.MathUtils.lerp(0.32, 1.2, handoffProgress);
        baseGroup.scale.setScalar(baseScale);

        laneLines.position.x = rocketGroup.position.x * 0.7;
        laneLines.position.y = rocketGroup.position.y * 0.18;
        laneLines.position.z = rocketGroup.position.z * 0.22;
        nebulaField.rotation.y += delta * 0.015;
        distantPlanet.rotation.y += delta * 0.03;

        for (let i = flybyShips.length - 1; i >= 0; i -= 1) {
          const escort = flybyShips[i];
          escort.object.position.x += escort.velocity.x * delta;
          escort.object.position.y = Math.sin(elapsed * escort.wobble + escort.phase) * 3.5 + (i - 1) * 3.2;
          escort.object.position.z = Math.cos(elapsed * escort.wobble + escort.phase) * 7 + (i - 1) * 4;
          escort.object.rotation.z = Math.sin(elapsed * 1.8 + escort.phase) * 0.12;
          escort.object.rotation.y = Math.PI;
          if (escort.object.position.x < rocketGroup.position.x - 120) {
            escort.object.position.set(
              rocketGroup.position.x + 48 + Math.random() * 36,
              (i - 1) * 3.2,
              (Math.random() - 0.5) * 16,
            );
          }
        }

        for (let i = hazards.length - 1; i >= 0; i -= 1) {
          const hazard = hazards[i];
          hazard.object.position.addScaledVector(hazard.velocity, delta);
          hazard.object.rotation.x += hazard.angularVelocity.x * delta;
          hazard.object.rotation.y += hazard.angularVelocity.y * delta;
          hazard.object.rotation.z += hazard.angularVelocity.z * delta;
          hazard.bbox.setFromObject(hazard.object);
          const hazardRel = hazard.object.position.clone().sub(rocketGroup.position);
          const hazardAhead = hazardRel.dot(forwardVec);
          if (hazardAhead < -(WORLD_BOUND_X + 6)) {
            scene.remove(hazard.object);
            disposeObjectMaterials(hazard.object);
            hazards.splice(i, 1);
            continue;
          }
          if (hazard.bbox.intersectsBox(rocketState.bbox)) {
            spawnParticles(hazard.object.position, 16, 0xfb923c);
            scene.remove(hazard.object);
            disposeObjectMaterials(hazard.object);
            hazards.splice(i, 1);
            updateLives(-1);
            rocketState.velocity.set(0, 0, 0);
            continue;
          }
          for (let j = bullets.length - 1; j >= 0; j -= 1) {
            const b = bullets[j];
            if (hazard.bbox.containsPoint(b.mesh.position)) {
              spawnParticles(hazard.object.position, 10, hazard.color);
              scene.remove(hazard.object);
              disposeObjectMaterials(hazard.object);
              hazards.splice(i, 1);
              scene.remove(b.mesh);
              bullets.splice(j, 1);
              updateScore(hazard.points);
              break;
            }
          }
        }

        for (let i = particles.length - 1; i >= 0; i -= 1) {
          const p = particles[i];
          p.mesh.position.addScaledVector(p.velocity, delta);
          p.velocity.multiplyScalar(1 - delta * 0.6);
          p.life -= delta;
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p.life / p.maxLife);
          if (p.life <= 0) {
            scene.remove(p.mesh);
            (p.mesh.material as THREE.MeshBasicMaterial).dispose();
            particles.splice(i, 1);
          }
        }
      }

      stars.rotation.z += delta * 0.02;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseleave", onMouseLeave);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else (obj.material as THREE.Material).dispose();
        } else if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
      bulletGeometry.dispose();
      bulletMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [planet, updateLives, updateScore]);

  const collectionCountdown = Math.max(0, COLLECTION_HANDOVER_SECONDS - stateRef.current.elapsed);
  // "再来一次" routes back through the launch cutscene so the player sees
  // the rocket fly in again before the flight gameplay starts over.
  const restart = useCallback(() => {
    onRestart();
  }, [onRestart]);
  const shieldDisplay = useMemo(() => "◆".repeat(Math.max(0, lives)) || "—", [lives]);

  return (
    <div className="fixed inset-0 z-[80] h-screen w-screen overflow-hidden bg-[#02040c] text-white">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-6 z-[90] flex items-start justify-between gap-4 px-6 sm:px-8">
        <div className="pointer-events-auto rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-2.5 backdrop-blur-xl">
          <p className="text-[10px] tracking-[0.32em] text-cyan-200/80">近地航线 · {planet.name}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">得分 {score.toString().padStart(5, "0")}</p>
          <p className="mt-1 text-[10px] tracking-[0.22em] text-white/55">抵达基地倒计时 {Math.ceil(collectionCountdown)}s</p>
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          <span className="rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 text-[10px] tracking-[0.32em] text-white/85 backdrop-blur-xl">
            护盾 {shieldDisplay}
          </span>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="rounded-full border border-white/25 bg-slate-950/70 px-3 py-1.5 text-[10px] tracking-[0.32em] text-white/90 backdrop-blur-xl transition hover:bg-white/15"
          >
            {paused ? "继续" : "暂停"}
          </button>
          <button
            type="button"
            onClick={onExit}
            aria-label="exit"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-slate-950/70 text-base leading-none text-white/85 transition hover:bg-white/20"
          >
            ×
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[90] flex justify-center">
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-2 text-[10px] tracking-[0.32em] text-white/70 backdrop-blur-xl">
          鼠标控制方向 · SPACE 发射 · P / ESC 暂停 · 躲开机雷与残骸
        </div>
      </div>
      {paused && !gameOver && (
        <div className="pointer-events-none absolute inset-0 z-[95] flex items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/15 bg-slate-950/80 px-8 py-6 text-center">
            <p className="text-xs tracking-[0.32em] text-cyan-200/80">已暂停</p>
            <p className="mt-3 text-sm text-white/80">按 P 或 ESC 继续飞行</p>
          </div>
        </div>
      )}
      {gameOver && (
        <div className="pointer-events-auto absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="w-[min(420px,90vw)] rounded-3xl border border-white/15 bg-slate-950/85 p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <p className="text-[10px] tracking-[0.32em] text-rose-300/80">任务失败</p>
            <h2 className="mt-3 text-2xl font-semibold">飞船已失去控制</h2>
            <p className="mt-2 text-sm text-white/72">{planet.name} 近地轨道的障碍过于密集，当前航段已中断。</p>
            <p className="mt-4 text-3xl font-semibold tabular-nums">{score}</p>
            <p className="text-[10px] tracking-[0.32em] text-white/55">最终得分</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={restart}
                className="rounded-full border border-cyan-300/40 bg-cyan-400/15 px-5 py-2 text-xs tracking-[0.28em] text-cyan-100 transition hover:bg-cyan-400/25"
              >
                再来一次
              </button>
              <button
                type="button"
                onClick={onExit}
                className="rounded-full border border-white/25 bg-white/[0.04] px-5 py-2 text-xs tracking-[0.28em] text-white/90 transition hover:bg-white/15"
              >
                返回任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
