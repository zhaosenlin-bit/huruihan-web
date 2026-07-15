import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { SolarPlanet } from "./SolarSystem";

type MissionLaunchSceneProps = {
  planet: SolarPlanet;
  onComplete: () => void;
};

const ROCKET_MODEL_URL =
  "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/explorer-jupiter-c-rocket/Explorer%20Jupiter-C%20Rocket.glb";

const DURATION_MS = 5000;

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function normalizeRocketModel(source: THREE.Object3D) {
  // The mission scene flies along -Z. We want the rocket horizontal with its
  // head pointing along -Z. We measure the bounding box and rotate whichever
  // world axis is the longest onto -Z, regardless of how the GLB was authored.
  const root = new THREE.Group();
  const model = source.clone(true);
  root.add(model);

  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  const fitScale = 7 / Math.max(size.x || 1, size.y || 1, size.z || 1);
  model.position.sub(center);
  model.scale.setScalar(fitScale);

  // Re-measure after centering + scaling so the longest axis is accurate.
  const fitted = new THREE.Box3().setFromObject(root);
  const fittedSize = new THREE.Vector3();
  fitted.getSize(fittedSize);
  const longest =
    fittedSize.y >= fittedSize.x && fittedSize.y >= fittedSize.z
      ? "y"
      : fittedSize.x >= fittedSize.z
        ? "x"
        : "z";
  // Rotate so the longest axis ends up along the world -Z axis with the
  // nose pointing forward (towards -Z).
  if (longest === "y") {
    root.rotation.x = Math.PI / 2;
  } else if (longest === "x") {
    root.rotation.y = Math.PI / 2;
  }
  // z: leave as-is.

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
  // Head points along -Z (forward), tail along +Z. Same orientation as the GLB
  // once normalizeRocketModel aligns its longest axis onto -Z, so the chase
  // camera and the cockpit cutover both look correct.
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
  body.rotation.x = Math.PI / 2; // lay the cylinder along Z
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
  nose.rotation.x = -Math.PI / 2; // cone tip points along -Z (forward)
  nose.position.z = -2.03;
  rocket.add(nose);

  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x84c8ff,
    emissive: new THREE.Color("#5ea9ff"),
    emissiveIntensity: 0.22,
    metalness: 0.18,
    roughness: 0.55,
  });
  for (let i = 0; i < 4; i += 1) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.72, 0.08), finMaterial);
    fin.position.z = 1.18; // sit near the tail
    fin.rotation.y = (Math.PI / 2) * i;
    fin.position.x = Math.cos(fin.rotation.y) * 0.2;
    fin.position.y = Math.sin(fin.rotation.y) * 0.2;
    rocket.add(fin);
  }

  return rocket;
}

export default function MissionLaunchScene({
  planet,
  onComplete,
}: MissionLaunchSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(false);
  const timeLeftRef = useRef(5);
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#02040d");
    scene.fog = new THREE.FogExp2("#02040d", 0.0026);

    const camera = new THREE.PerspectiveCamera(56, width / height, 0.1, 2400);
    camera.position.set(0, 1.6, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xc9e5ff, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(10, 6, 16);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x60a5fa, 1.4);
    fillLight.position.set(-12, -4, 10);
    scene.add(fillLight);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      starPositions[index * 3] = (Math.random() - 0.5) * 180;
      starPositions[index * 3 + 1] = (Math.random() - 0.5) * 110;
      starPositions[index * 3 + 2] = -Math.random() * 1800;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xdbeafe,
        size: 0.7,
        transparent: true,
        opacity: 0.92,
        sizeAttenuation: true,
      }),
    );
    scene.add(stars);

    const destination = new THREE.Group();
    const planetRadius = Math.max(9, planet.size * 1.8);
    const planetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(planetRadius, 80, 80),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(planet.color),
        emissive: new THREE.Color(planet.color),
        emissiveIntensity: 0.16,
        roughness: 0.92,
        metalness: 0.02,
      }),
    );
    destination.add(planetMesh);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(planetRadius * 1.18, 64, 64),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(planet.color),
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    destination.add(atmosphere);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(planetRadius * 1.68, 48, 48),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(planet.color),
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    destination.add(halo);
    destination.position.set(0, 0, -420);
    scene.add(destination);

    const rocketPivot = new THREE.Group();
    rocketPivot.position.set(0, -1.4, 12);
    scene.add(rocketPivot);

    // Exhaust cone: head of the rocket is along -Z, so the tail flame sits at
    // +Z and the cone tip points back along +Z as well.
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

    const attachRocket = (template: THREE.Object3D) => {
      while (rocketPivot.children.length > 0) {
        rocketPivot.remove(rocketPivot.children[0]);
      }
      const rocket = template.clone(true);
      rocket.scale.setScalar(1.05);
      rocketPivot.add(rocket);
      rocketPivot.add(exhaust);
    };

    let disposed = false;
    let raf = 0;
    let timeoutId = 0;

    const loader = new GLTFLoader();
    loader.load(
      ROCKET_MODEL_URL,
      (gltf) => {
        if (disposed) return;
        attachRocket(normalizeRocketModel(gltf.scene));
      },
      undefined,
      () => {
        if (disposed) return;
        attachRocket(createFallbackRocket());
      },
    );

    const fallbackId = window.setTimeout(() => {
      if (!disposed && rocketPivot.children.length === 0) {
        attachRocket(createFallbackRocket());
      }
    }, 2200);

    const clock = new THREE.Clock();
    const temp = new THREE.Vector3();
    const cameraLookTarget = new THREE.Vector3();

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete();
    };

    timeoutId = window.setTimeout(finish, DURATION_MS);

    const onResize = () => {
      const nextWidth = container.clientWidth || window.innerWidth;
      const nextHeight = container.clientHeight || window.innerHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const progress = clamp01(elapsed / (DURATION_MS / 1000));
      const eased = easeInOutCubic(progress);
      const firstPersonBlend = clamp01((progress - 0.18) / 0.28);

      const nextTimeLeft = Math.max(1, 5 - Math.floor(elapsed));
      if (nextTimeLeft !== timeLeftRef.current) {
        timeLeftRef.current = nextTimeLeft;
        setTimeLeft(nextTimeLeft);
      }

      const travelZ = THREE.MathUtils.lerp(12, -112, eased);
      const sway = Math.sin(elapsed * 3.4) * (1 - progress) * 0.22;
      const pitch = 0.08 + Math.cos(elapsed * 2.8) * 0.02;

      rocketPivot.position.set(sway, -1.4 + Math.sin(elapsed * 2.2) * 0.16, travelZ);
      // Slight pitch up/down + roll into the lateral sway, but no yaw flip:
      // the head is already pointing along -Z (the direction of travel).
      rocketPivot.rotation.set(pitch, 0, sway * 0.08);
      exhaust.scale.setScalar(1 + Math.sin(elapsed * 18) * 0.08);
      exhaust.material.opacity = 0.68 + Math.sin(elapsed * 12) * 0.12;

      destination.position.z = THREE.MathUtils.lerp(-420, -48, eased);
      destination.position.y = Math.sin(elapsed * 0.9) * 1.4;
      destination.rotation.y += 0.0032;
      atmosphere.scale.setScalar(1 + Math.sin(elapsed * 2.4) * 0.02);
      halo.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.04);

      const starArray = starGeometry.attributes.position.array as Float32Array;
      const starSpeed = THREE.MathUtils.lerp(11, 48, progress);
      for (let index = 0; index < starCount; index += 1) {
        const zIndex = index * 3 + 2;
        starArray[zIndex] += starSpeed;
        if (starArray[zIndex] > 26) {
          starArray[index * 3] = (Math.random() - 0.5) * 180;
          starArray[index * 3 + 1] = (Math.random() - 0.5) * 110;
          starArray[zIndex] = -1800 - Math.random() * 260;
        }
      }
      starGeometry.attributes.position.needsUpdate = true;

      rocketPivot.getWorldPosition(temp);
      const chasePosition = new THREE.Vector3(temp.x * 0.2, temp.y + 2.8, temp.z + 16);
      const cockpitPosition = new THREE.Vector3(
        temp.x * 0.05,
        temp.y + 0.55,
        temp.z + 1.3,
      );
      camera.position.lerpVectors(chasePosition, cockpitPosition, firstPersonBlend);

      destination.getWorldPosition(cameraLookTarget);
      cameraLookTarget.x *= 0.08;
      cameraLookTarget.y *= 0.18;
      camera.lookAt(cameraLookTarget);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      doneRef.current = false;
      window.clearTimeout(timeoutId);
      window.clearTimeout(fallbackId);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
          return;
        }
        object.material.dispose();
      });
      starGeometry.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onComplete, planet]);

  return (
    <div className="absolute inset-0 z-[110] overflow-hidden bg-[radial-gradient(circle_at_50%_36%,rgba(54,111,255,0.16),transparent_30%),linear-gradient(180deg,rgba(2,4,12,0.92),rgba(2,4,12,0.98))]">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_48%,rgba(2,4,12,0.2)_72%,rgba(2,4,12,0.84)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgba(2,4,12,0.9),transparent)]" />

      <div className="pointer-events-none absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
        <div className="rounded-2xl border border-cyan-300/18 bg-slate-950/54 px-4 py-3 text-white/92 backdrop-blur-xl">
          <div className="text-[10px] tracking-[0.34em] text-cyan-200/72">MISSION LAUNCH</div>
          <div className="mt-2 text-xl font-semibold text-white">{planet.nameEn}</div>
          <div className="mt-1 text-[11px] tracking-[0.2em] text-white/56">
            FIRST PERSON DESCENT
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/58 px-5 py-2 text-[11px] tracking-[0.28em] text-white/74 backdrop-blur-xl sm:bottom-7">
        ETA {timeLeft}s
      </div>
    </div>
  );
}
