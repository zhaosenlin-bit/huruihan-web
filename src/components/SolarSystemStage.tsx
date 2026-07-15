import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

let sharedMaxAnisotropy = 16;
/**
 * SolarSystemStage
 * Three.js stage that mimics NASA Eyes on the Solar System:
 *  - tilted ecliptic plane with a glowing sun (textured)
 *  - eight planets drifting on tilted elliptical orbits, each wearing
 *    a real NASA-published equirectangular map
 *  - soft starfield + bloom-like glow
 *  - drag to orbit, wheel to zoom
 */
export type SolarSystemHandle = { scene: THREE.Scene; camera: THREE.Camera; renderer: THREE.WebGLRenderer; planetMeshes: THREE.Object3D[]; clock: THREE.Clock };

type Props = {
  className?: string;
  onPlanetEnter?: (planetId: string) => void;
};
type PlanetDef = {
  name: string;
  nameZh: string;
  distance: number;
  size: number;
  speed: number;
  tilt: number;
  map: string;
  specular?: string;
  hasRing?: boolean;
  ringColor?: string;
};
const SUN_MAP = "/planets/sun.jpg";
const SUN_NAME_ZH = "太阳";

async function ensureCanvasLabelFonts() {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  await Promise.allSettled([
    document.fonts.ready,
    document.fonts.load("700 72px 'Noto Sans SC'"),
    document.fonts.load("700 72px 'Microsoft YaHei'"),
  ]);
}

function createLabelTexture(text: string) {
  const canvas = document.createElement("canvas");
  const dpr = 2;
  canvas.width = 512 * dpr;
  canvas.height = 256 * dpr;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.scale(dpr, dpr);
  const w = 512;
  const h = 256;
  const padX = 24;
  const padY = 18;
  const radius = 36;
  ctx.clearRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(padX, padY, padX, h - padY);
  grad.addColorStop(0, "rgba(8, 16, 38, 0.78)");
  grad.addColorStop(1, "rgba(2, 4, 12, 0.86)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(padX, padY, w - padX * 2, h - padY * 2, radius);
  } else {
    ctx.rect(padX, padY, w - padX * 2, h - padY * 2);
  }
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(148, 197, 255, 0.45)";
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.font = "bold 72px 'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(96, 165, 250, 0.55)";
  ctx.shadowBlur = 16;
  ctx.fillText(text, w / 2, h / 2);
  ctx.shadowBlur = 0;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}
function buildLabel(text: string, planetSize: number) {
  const tex = createLabelTexture(text);
  const material = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  const scaleY = planetSize * 1.05;
  const scaleX = scaleY * 2;
  sprite.scale.set(scaleX, scaleY, 1);
  sprite.position.set(0, planetSize * 1.55, 0);
  sprite.renderOrder = 999;
  return sprite;
}
const PLANETS: PlanetDef[] = [
  {
    name: "Mercury",
    nameZh: "水星",
    distance: 6,
    size: 0.32,
    speed: 1.6,
    tilt: 0.12,
    map: "/planets/mercury.jpg",
  },
  {
    name: "Venus",
    nameZh: "金星",
    distance: 9,
    size: 0.55,
    speed: 1.18,
    tilt: -0.1,
    map: "/planets/venus.jpg",
  },
  {
    name: "Earth",
    nameZh: "地球",
    distance: 12,
    size: 0.6,
    speed: 1.0,
    tilt: 0.2,
    map: "/planets/earth.jpg",
  },
  {
    name: "Mars",
    nameZh: "火星",
    distance: 15,
    size: 0.46,
    speed: 0.82,
    tilt: -0.15,
    map: "/planets/mars.jpg",
  },
  {
    name: "Jupiter",
    nameZh: "木星",
    distance: 22,
    size: 1.4,
    speed: 0.43,
    tilt: 0.08,
    map: "/planets/jupiter.jpg",
  },
  {
    name: "Saturn",
    nameZh: "土星",
    distance: 28,
    size: 1.2,
    speed: 0.32,
    tilt: -0.18,
    map: "/planets/saturn.jpg",
    hasRing: true,
    ringColor: "#d6c388",
  },
  {
    name: "Uranus",
    nameZh: "天王星",
    distance: 34,
    size: 0.95,
    speed: 0.22,
    tilt: 0.3,
    map: "/planets/uranus.jpg",
  },
  {
    name: "Neptune",
    nameZh: "海王星",
    distance: 40,
    size: 0.92,
    speed: 0.18,
    tilt: -0.25,
    map: "/planets/neptune.jpg",
  },
];
function buildSphere(planet: PlanetDef): THREE.Group {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = "anonymous";
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.85,
    metalness: 0.0,
  });
  loader.load(planet.map, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = sharedMaxAnisotropy > 0 ? sharedMaxAnisotropy : 16;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    mat.map = tex;
    mat.needsUpdate = true;
  });
  const sphereSeg = planet.size >= 1.0 ? 96 : 72;
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(planet.size, sphereSeg, sphereSeg),
    mat,
  );
  mesh.userData = { kind: "planet", id: planet.name };
  group.add(mesh);
  group.userData = { kind: "planet", id: planet.name };
  if (planet.hasRing) {
    const ringGeo = new THREE.RingGeometry(planet.size * 1.4, planet.size * 2.4, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(planet.ringColor || "#d6c388"),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2 - 0.42;
    group.add(ring);
  }
  // Chinese label sprite hovering above each planet
  group.add(buildLabel(planet.nameZh, planet.size));
  return group;
}

export default function SolarSystemStage({ className = "", onPlanetEnter }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onPlanetEnterRef = useRef(onPlanetEnter);
  useEffect(() => { onPlanetEnterRef.current = onPlanetEnter; }, [onPlanetEnter]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [labelFontsReady, setLabelFontsReady] = useState(false);
  const setSelectedIdRef = useRef<(id: string | null) => void>(setSelectedId);
  useEffect(() => { setSelectedIdRef.current = setSelectedId; });
  const resetViewRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let active = true;
    void ensureCanvasLabelFonts().finally(() => {
      if (active) setLabelFontsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!labelFontsReady) return;
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#02040c");
    scene.fog = new THREE.FogExp2("#02040c", 0.012);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 46);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    sharedMaxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    container.appendChild(renderer.domElement);
    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.32));
    const sunLight = new THREE.PointLight(0xffe2a8, 4.2, 0, 1.4);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    const rimLight = new THREE.DirectionalLight(0x6090ff, 0.65);
    rimLight.position.set(-20, 30, 20);
    scene.add(rimLight);
    // Sun (textured)
    const sunGroup = new THREE.Group();
    const sunMapLoader = new THREE.TextureLoader();
    sunMapLoader.crossOrigin = "anonymous";
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfff3d0,
      toneMapped: false,
    });
    sunMapLoader.load(SUN_MAP, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = sharedMaxAnisotropy > 0 ? sharedMaxAnisotropy : 16;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      sunMat.map = tex;
      sunMat.needsUpdate = true;
    });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 96, 96), sunMat);
    sun.userData = { kind: "sun", id: "sun" };
    sunGroup.add(sun);
    sunGroup.userData = { kind: "sun", id: "sun" };
    const sunHalo = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 96, 96),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#f59e0b"),
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    sunGroup.add(sunHalo);
    // Chinese label for the Sun
    {
      const sunLabelTex = createLabelTexture(SUN_NAME_ZH);
      const sunLabelMat = new THREE.SpriteMaterial({
        map: sunLabelTex,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      const sunLabel = new THREE.Sprite(sunLabelMat);
      sunLabel.scale.set(8, 4, 1);
      sunLabel.position.set(0, 8.5, 0);
      sunLabel.renderOrder = 999;
      sunGroup.add(sunLabel);
    }
    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, 48, 48),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#e8702a"),
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    sunGroup.add(sunGlow);
    scene.add(sunGroup);
    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1600;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 120 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.18,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
      }),
    );
    scene.add(stars);
    // Planets + orbit rings
    const planetMeshes: THREE.Group[] = [];
    const orbitLines: THREE.Line[] = [];
    const labelSprites: Array<{ id: string; sprite: THREE.Sprite }> = [];
    PLANETS.forEach((p, idx) => {
      // Orbit ellipse (tilted plane)
      const ringGeom = new THREE.BufferGeometry();
      const ringPoints: number[] = [];
      const segments = 128;
      const a = p.distance;
      const b = p.distance * 0.78;
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        ringPoints.push(Math.cos(t) * a, 0, Math.sin(t) * b);
      }
      ringGeom.setAttribute("position", new THREE.Float32BufferAttribute(ringPoints, 3));
      const ringMat = new THREE.LineBasicMaterial({
        color: 0x4d6cb5,
        transparent: true,
        opacity: 0.18,
      });
      const ring = new THREE.Line(ringGeom, ringMat);
      ring.rotation.z = p.tilt;
      scene.add(ring);
      orbitLines.push(ring);
      // Planet body
      const planetGroup = buildSphere(p);
      planetGroup.userData = {
        distance: p.distance,
        speed: p.speed,
        tilt: p.tilt,
        angle: Math.random() * Math.PI * 2,
        index: idx,
        kind: "planet",
        id: p.name,
      };
      scene.add(planetGroup);
      planetMeshes.push(planetGroup);
      const label = planetGroup.children.find((child) => child instanceof THREE.Sprite);
      if (label && label instanceof THREE.Sprite) {
        labelSprites.push({ id: p.name, sprite: label });
      }
    });
    // Camera focus point + animation state.
    // - cameraTarget: where the camera looks at (default = scene origin).
    // - camAnim: when set, the camera flies from its current spherical pose to
    //   the target pose over a duration, easing in/out.
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    let camAnim: {
      fromYaw: number; toYaw: number;
      fromPitch: number; toPitch: number;
      fromRadius: number; toRadius: number;
      fromTarget: THREE.Vector3; toTarget: THREE.Vector3;
      t: number; duration: number;
    } | null = null;
    // Camera controls (manual orbit + zoom)
    let yaw = 0.0;
    let pitch = 0.35;
    let radius = 50;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const updateCamera = () => {
      const x = cameraTarget.x + radius * Math.cos(pitch) * Math.sin(yaw);
      const y = cameraTarget.y + radius * Math.sin(pitch);
      const z = cameraTarget.z + radius * Math.cos(pitch) * Math.cos(yaw);
      camera.position.set(x, y, z);
      camera.lookAt(cameraTarget);
    };
    updateCamera();
    // Read the current spherical pose (camera relative to cameraTarget) and
    // store it for animation origin.
    const snapshotCurrentPose = () => ({
      yaw,
      pitch,
      radius,
      target: cameraTarget.clone(),
    });
    // Compute a good viewing pose for a given target position + body radius,
    // then animate the camera there.
    const setIntroVisibility = (active: boolean, activeId?: string) => {
      orbitLines.forEach((line) => {
        line.visible = !active;
      });
      labelSprites.forEach(({ id, sprite }) => {
        sprite.visible = !active || id === activeId;
      });
    };
    const focusOn = (worldPos: THREE.Vector3, bodyRadius: number, targetId: string, duration = 1.15) => {
      const start = snapshotCurrentPose();
      const desiredRadius = targetId === "sun"
        ? 16
        : Math.max(8.5, Math.min(26, bodyRadius * 8.5 + 4.5));
      const desiredPitch = targetId === "sun" ? 0.22 : 0.16;
      const desiredYaw = yaw - 0.28;
      setIntroVisibility(true, targetId);
      camAnim = {
        fromYaw: start.yaw,
        toYaw: desiredYaw,
        fromPitch: start.pitch,
        toPitch: desiredPitch,
        fromRadius: start.radius,
        toRadius: desiredRadius,
        fromTarget: start.target,
        toTarget: worldPos.clone(),
        t: 0,
        duration,
      };
    };
    const resetView = () => {
      const start = snapshotCurrentPose();
      setIntroVisibility(false);
      camAnim = {
        fromYaw: start.yaw,
        toYaw: 0,
        fromPitch: start.pitch,
        toPitch: 0.35,
        fromRadius: start.radius,
        toRadius: 50,
        fromTarget: start.target,
        toTarget: new THREE.Vector3(0, 0, 0),
        t: 0,
        duration: 1.05,
      };
    };
    resetViewRef.current = resetView;
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      yaw -= dx * 0.005;
      pitch = Math.max(-1.2, Math.min(1.2, pitch + dy * 0.004));
      updateCamera();
    };
    const onPointerUp = () => { dragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(20, Math.min(120, radius + e.deltaY * 0.05));
      updateCamera();
    };
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    // ---- Click (tap) detection: distinguish a real click from a drag ----
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let pointerDownX = 0;
    let pointerDownY = 0;
    let pointerDownTime = 0;
    let pointerMoved = false;
    const pickAt = (clientX: number, clientY: number): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const targets = [sun, ...planetMeshes.map((g) => g.children[0])];
      const hits = raycaster.intersectObjects(targets, false);
      if (hits.length === 0) return null;
      const hit = hits[0].object;
      const ud = hit.userData;
      if (ud && ud.kind && ud.id) return ud.id;
      let p = hit.parent;
      while (p) {
        const pud = p.userData;
        if (pud && pud.kind && pud.id) return pud.id;
        p = p.parent;
      }
      return null;
    };
    const onPointerDownForClick = (e: PointerEvent) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      pointerDownTime = e.timeStamp;
      pointerMoved = false;
    };
    const onPointerMoveForClick = (e: PointerEvent) => {
      if (pointerDownTime === 0) return;
      const dx = e.clientX - pointerDownX;
      const dy = e.clientY - pointerDownY;
      if (Math.hypot(dx, dy) > 6) pointerMoved = true;
    };
    const onClick = (e: MouseEvent) => {
      if (pointerMoved) return;
      if (e.timeStamp - pointerDownTime > 600) return;
      const id = pickAt(e.clientX, e.clientY);
      if (!id) return;
      let worldPos = new THREE.Vector3();
      let bodyRadius = 1;
      if (id === "sun") {
        worldPos.set(0, 0, 0);
        bodyRadius = 2.2;
      } else {
        const planet = planetMeshes.find((g) => (g.userData as { id?: string }).id === id);
        if (planet) {
          planet.getWorldPosition(worldPos);
          const def = PLANETS.find((p) => p.name === id);
          bodyRadius = def ? def.size : 1;
        }
      }
      // Briefly fly the camera in for a satisfying "lock-on" feel,
      // then route to the dedicated PlanetDescentScene for the 5s first-person dive.
      focusOn(worldPos, bodyRadius, id);
      if (onPlanetEnterRef.current) {
        onPlanetEnterRef.current(id);
      } else {
        setSelectedIdRef.current?.(id);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDownForClick);
    renderer.domElement.addEventListener("pointermove", onPointerMoveForClick);
    renderer.domElement.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);
    // Animation
    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;
    const frameHooks: Array<(t: number, delta: number) => void> = [];
    const easeInOut = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
    const animate = () => {
      if (!running) return;
      raf = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const t = clock.elapsedTime;
      sun.rotation.y += delta * 0.18;
      sunHalo.scale.setScalar(1 + Math.sin(t * 1.6) * 0.04);
      sunGlow.scale.setScalar(1 + Math.sin(t * 1.1 + 1.2) * 0.06);
      sunGlow.rotation.y -= delta * 0.05;
      stars.rotation.y += delta * 0.01;
      planetMeshes.forEach((m) => {
        const u = m.userData as { distance: number; speed: number; tilt: number; angle: number };
        u.angle += delta * 0.32 * u.speed;
        const a = u.distance;
        const b = u.distance * 0.78;
        m.position.set(Math.cos(u.angle) * a, 0, Math.sin(u.angle) * b);
        m.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), u.tilt);
        m.rotation.y += delta * 0.6;
      });
      // ---- Camera fly animation ----
      if (camAnim) {
        camAnim.t += delta;
        const k = easeInOut(camAnim.t / camAnim.duration);
        yaw = camAnim.fromYaw + (camAnim.toYaw - camAnim.fromYaw) * k;
        pitch = camAnim.fromPitch + (camAnim.toPitch - camAnim.fromPitch) * k;
        radius = camAnim.fromRadius + (camAnim.toRadius - camAnim.fromRadius) * k;
        cameraTarget.lerpVectors(camAnim.fromTarget, camAnim.toTarget, k);
        if (camAnim.t >= camAnim.duration) camAnim = null;
        updateCamera();
      
      
      } else if (!dragging) {
        // gentle camera idle drift so the scene feels alive even without input
        yaw += delta * 0.04;
        updateCamera();
      }
      for (let i = 0; i < frameHooks.length; i += 1) {
        try { frameHooks[i](t, delta); } catch (err) { console.warn("[solar] frame hook failed", err); }
      }
      renderer.render(scene, camera);
    };
    animate();
    const visibilityObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => { running = e.isIntersecting; if (running) animate(); }),
      { threshold: 0 },
    );
    visibilityObserver.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      visibilityObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("pointerdown", onPointerDownForClick);
      renderer.domElement.removeEventListener("pointermove", onPointerMoveForClick);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      resetViewRef.current = null;
      renderer.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const m = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
        else m?.dispose();
      });
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [labelFontsReady]);

  const close = useCallback(() => {
    resetViewRef.current?.();
    setSelectedId(null);
  }, []);

  const selectedBody = useMemo(() => {
    if (!selectedId) return null;
    if (selectedId === "sun") {
      return { id: "sun", name: "太阳", nameEn: "Sun", map: "/planets/sun.jpg", tag: "我们的恒星", meta: "一颗 G2V 型主序星，年龄约 46 亿年。", excerpt: "独占太阳系总质量的 99.86%。", facts: ["表面温度约 5,500 ℃；核心约 1,500 万 ℃。", "每秒将约 400 万吨物质转化为能量。", "阳光到达地球需 8 分 20 秒左右。"], color: "#fb923c" };    }
    const p = PLANETS.find((x) => x.name === selectedId);
    if (!p) return null;
    return { id: p.name, name: p.nameZh, nameEn: p.name, map: p.map, tag: "行星", meta: `距离太阳 ${p.distance} 个相对单位`, excerpt: "在 NASA 太阳系探索门户中查看这颗行星的更多资料。", facts: [`自转倾角：${p.tilt} 弧度`, `公转速度：${p.speed}`, `视觉尺寸：${p.size} 个单位`], color: "#7dd3fc" };  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      resetViewRef.current?.();
      setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);



  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ touchAction: "none" }}
    >
      {selectedBody && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-end justify-end p-3 sm:p-5" role="dialog" aria-modal="false">
          <div className="pointer-events-auto w-[min(360px,92vw)] overflow-hidden rounded-2xl border border-white/15 bg-slate-950/85 text-white shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl fade-in-up">
            <div className="relative h-28 w-full overflow-hidden sm:h-32">
              <img src={selectedBody.map} alt={selectedBody.name} className="h-full w-full object-cover" draggable={false} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,4,12,0) 30%, rgba(2,4,12,0.9) 100%)" }} />
              <button type="button" onClick={close} aria-label="close" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-slate-950/70 text-lg leading-none text-white/85 transition hover:bg-white/20">×</button>
              <div className="absolute bottom-2 left-3 right-12">
                <div className="text-[10px] tracking-[0.32em] text-white/65">{selectedBody.tag}</div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-xl font-semibold">{selectedBody.name}</span>
                  <span className="text-[11px] tracking-[0.18em] text-white/60">{selectedBody.nameEn.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 px-4 py-4">
              <p className="text-[11px] leading-relaxed text-white/70">{selectedBody.meta}</p>
              <p className="text-[12.5px] leading-relaxed text-white/90">{selectedBody.excerpt}</p>
              <div className="space-y-1.5 pt-1">
                {selectedBody.facts.map((f: string, i: number) => (
                  <div key={i} className="flex gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] leading-relaxed text-white/85">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: selectedBody.color }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={close} className="mt-1 w-full rounded-full border border-white/20 bg-white/[0.04] py-2 text-[11px] tracking-[0.22em] text-white/90 transition hover:bg-white/15">关闭 · ESC</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

