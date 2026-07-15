import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { SolarPlanet } from "./SolarSystem";

type BaseLandingProps = {
  planet: SolarPlanet;
  onComplete: () => void;
};

const ROCKET_MODEL_URL =
  "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/explorer-jupiter-c-rocket/Explorer%20Jupiter-C%20Rocket.glb";

const DURATION_MS = 4500;

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function normalizeRocketModel(source: THREE.Object3D) {
  const root = new THREE.Group();
  const model = source.clone(true);
  root.add(model);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  const fitScale = 6 / Math.max(size.x || 1, size.y || 1, size.z || 1);
  model.position.sub(center);
  model.scale.setScalar(fitScale);
  const fitted = new THREE.Box3().setFromObject(root);
  const fittedSize = new THREE.Vector3();
  fitted.getSize(fittedSize);
  const longest =
    fittedSize.y >= fittedSize.x && fittedSize.y >= fittedSize.z
      ? "y"
      : fittedSize.x >= fittedSize.z
        ? "x"
        : "z";
  if (longest === "y") root.rotation.x = Math.PI / 2;
  else if (longest === "x") root.rotation.y = Math.PI / 2;
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = false;
    child.receiveShadow = false;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if ("emissive" in material) {
        material.emissive = new THREE.Color("#1d4ed8");
        material.emissiveIntensity = Math.max(material.emissiveIntensity ?? 0, 0.08);
      }
    });
  });
  return root;
}

function createFallbackRocket() {
  const rocket = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 3.3, 28),
    new THREE.MeshStandardMaterial({
      color: 0xe7efff,
      emissive: new THREE.Color("#7db7ff"),
      emissiveIntensity: 0.16,
      metalness: 0.3,
      roughness: 0.42,
    }),
  );
  body.rotation.x = Math.PI / 2;
  rocket.add(body);
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.8, 28),
    new THREE.MeshStandardMaterial({
      color: 0xd7e5ff,
      emissive: new THREE.Color("#4f8fff"),
      emissiveIntensity: 0.16,
      metalness: 0.2,
      roughness: 0.34,
    }),
  );
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -2.03;
  rocket.add(nose);
  return rocket;
}

export default function BaseLanding({ planet, onComplete }: BaseLandingProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(planet.color);
    scene.fog = new THREE.Fog(planet.color, 30, 180);

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 400);
    camera.position.set(0, 6, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(8, 12, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(new THREE.Color(planet.glow), 1.4);
    fillLight.position.set(-8, 4, -6);
    scene.add(fillLight);

    // Ground plane: a circular pad the base sits on, with a runway stripe.
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(60, 64),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(planet.color).multiplyScalar(0.35),
        roughness: 0.95,
        metalness: 0.0,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    scene.add(ground);

    // Base: a glowing landing pad with side lights.
    const baseGroup = new THREE.Group();
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(7, 7, 0.6, 48),
      new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        emissive: new THREE.Color("#7dd3fc"),
        emissiveIntensity: 0.32,
        metalness: 0.4,
        roughness: 0.5,
      }),
    );
    baseGroup.add(pad);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(7.4, 0.18, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.32;
    baseGroup.add(ring);
    // Runway lights around the pad.
    for (let i = 0; i < 12; i += 1) {
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfde68a }),
      );
      const a = (i / 12) * Math.PI * 2;
      light.position.set(Math.cos(a) * 7.6, 0.5, Math.sin(a) * 7.6);
      baseGroup.add(light);
    }
    // Antenna.
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.6, roughness: 0.4 }),
    );
    antenna.position.set(8, 2.5, 0);
    baseGroup.add(antenna);
    const antennaLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfb7185 }),
    );
    antennaLight.position.set(8, 5.6, 0);
    baseGroup.add(antennaLight);
    baseGroup.position.set(0, -1.7, 0);
    scene.add(baseGroup);

    // Rocket: comes in from above and lowers onto the pad.
    const rocketPivot = new THREE.Group();
    rocketPivot.position.set(0, 26, 14);
    scene.add(rocketPivot);

    const exhaust = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 2.6, 18),
      new THREE.MeshBasicMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.78,
      }),
    );
    exhaust.rotation.x = -Math.PI / 2;
    exhaust.position.z = 2.0;
    rocketPivot.add(exhaust);

    const attachRocket = (template: THREE.Object3D) => {
      const rocket = template.clone(true);
      rocket.scale.setScalar(1.0);
      rocketPivot.add(rocket);
    };

    let disposed = false;
    let raf = 0;
    let finished = false;
    const loader = new GLTFLoader();
    loader.load(
      ROCKET_MODEL_URL,
      (gltf) => { if (!disposed) attachRocket(normalizeRocketModel(gltf.scene)); },
      undefined,
      () => { if (!disposed) attachRocket(createFallbackRocket()); },
    );
    const fallbackId = window.setTimeout(() => {
      if (!disposed && rocketPivot.children.length <= 1) attachRocket(createFallbackRocket());
    }, 2000);

    const clock = new THREE.Clock();
    const finish = () => {
      if (finished) return;
      finished = true;
      onCompleteRef.current();
    };
    const timeoutId = window.setTimeout(finish, DURATION_MS);

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const progress = clamp01(elapsed / (DURATION_MS / 1000));
      const eased = easeOutCubic(progress);

      // Lower the rocket from the start height down onto the pad and slow its forward motion.
      const y = THREE.MathUtils.lerp(26, 0.4, eased);
      const z = THREE.MathUtils.lerp(14, 0, eased);
      rocketPivot.position.set(0, y, z);
      // Slight wobble that fades out as we land.
      const wobble = (1 - progress) * 0.04;
      rocketPivot.rotation.set(
        Math.sin(elapsed * 1.6) * wobble,
        0,
        Math.sin(elapsed * 2.2) * wobble,
      );
      exhaust.scale.setScalar(1 + Math.sin(elapsed * 18) * 0.08);
      exhaust.material.opacity = 0.7 + Math.sin(elapsed * 12) * 0.12;
      // Pulse the landing ring near touchdown.
      ring.scale.setScalar(1 + (1 - progress) * 0.4 + Math.sin(elapsed * 4) * 0.04);

      // Camera slides in with the rocket.
      const camY = THREE.MathUtils.lerp(8, 5, eased);
      const camZ = THREE.MathUtils.lerp(34, 22, eased);
      camera.position.set(0, camY, camZ);
      camera.lookAt(0, THREE.MathUtils.lerp(8, 0.5, eased), 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      window.clearTimeout(timeoutId);
      window.clearTimeout(fallbackId);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
          return;
        }
        obj.material.dispose();
      });
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [planet.color, planet.glow]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#02040d] text-white">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,transparent_40%,rgba(2,4,13,0.5)_78%,rgba(2,4,13,0.95)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 z-10 -translate-x-1/2 text-center">
        <p className="text-[10px] tracking-[0.32em] text-cyan-200/80">BASE APPROACH</p>
        <p className="mt-2 text-2xl font-semibold">返回 {planet.name} 基地</p>
      </div>
    </div>
  );
}

