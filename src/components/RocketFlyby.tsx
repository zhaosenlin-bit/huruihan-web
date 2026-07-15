import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { SolarSystemHandle } from "./SolarSystemStage";

type RocketFlybyProps = {
  className?: string;
  handle?: SolarSystemHandle | null;
  targetPlanet?: string;
};

const ROCKET_MODEL_URL =
  "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/explorer-jupiter-c-rocket/Explorer%20Jupiter-C%20Rocket.glb";

type RocketState = {
  mesh: THREE.Group;
  speed: number;
  phase: number;
  roll: number;
  wobble: number;
  baseScale: number;
  orbitRadiusX: number;
  orbitRadiusZ: number;
  orbitTilt: number;
  heightOffset: number;
  escortRadius: number;
  escortAngle: number;
};

function createFallbackRocket() {
  const rocket = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 2.3, 24),
    new THREE.MeshStandardMaterial({
      color: 0xe8eefc,
      emissive: new THREE.Color("#7db7ff"),
      emissiveIntensity: 0.18,
      metalness: 0.35,
      roughness: 0.45,
    }),
  );
  rocket.add(body);
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.56, 24),
    new THREE.MeshStandardMaterial({
      color: 0xcfdcff,
      emissive: new THREE.Color("#4f8fff"),
      emissiveIntensity: 0.15,
      metalness: 0.2,
      roughness: 0.35,
    }),
  );
  nose.position.y = 1.43;
  rocket.add(nose);
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x7dc1ff,
    emissive: new THREE.Color("#51a6ff"),
    emissiveIntensity: 0.28,
    metalness: 0.15,
    roughness: 0.55,
  });
  for (let i = 0; i < 4; i += 1) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.42), finMaterial);
    fin.position.y = -0.82;
    fin.rotation.y = (Math.PI / 2) * i;
    fin.position.x = Math.cos(fin.rotation.y) * 0.18;
    fin.position.z = Math.sin(fin.rotation.y) * 0.18;
    rocket.add(fin);
  }
  const plume = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.75, 18),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.72 }),
  );
  plume.rotation.x = Math.PI;
  plume.position.y = -1.55;
  rocket.add(plume);
  return rocket;
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
  const maxAxis = Math.max(size.x || 1, size.y || 1, size.z || 1);
  const fitScale = 4.8 / maxAxis;
  model.position.sub(center);
  model.scale.setScalar(fitScale);
  const fittedBounds = new THREE.Box3().setFromObject(root);
  const fittedSize = new THREE.Vector3();
  fittedBounds.getSize(fittedSize);
  root.rotation.z = -Math.PI / 2;
  root.rotation.y = Math.PI / 2;
  root.position.y = fittedSize.y * 0.08;
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = false;
      child.receiveShadow = false;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if ("emissive" in material) {
          material.emissive = new THREE.Color("#1d4ed8");
          material.emissiveIntensity = Math.max(material.emissiveIntensity ?? 0, 0.08);
        }
      });
    }
  });
  return root;
}

// Approximate planet sizes (same units as SolarSystemStage sphere radius).
// Used to scale the escort orbit so rockets never clip inside a planet or fly
// out of the visible scene.
const PLANET_SIZE: Record<string, number> = {
  Mercury: 0.32, Venus: 0.55, Earth: 0.6, Mars: 0.46,
  Jupiter: 1.4, Saturn: 1.2, Uranus: 0.95, Neptune: 0.92,
};

// Escort angular speed in radians/second. Slightly faster than the planet
// motion in SolarSystemStage (0.32 * speed) so the fleet visibly circles the
// planet instead of freezing relative to it.
const ESCORT_ANGULAR_SPEED: Record<string, number> = {
  Mercury: 1.4, Venus: 1.1, Earth: 0.95, Mars: 0.85,
  Jupiter: 0.7, Saturn: 0.6, Uranus: 0.55, Neptune: 0.5,
};

export default function RocketFlyby({
  className = "",
  handle = null,
  targetPlanet = "Earth",
}: RocketFlybyProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = handle ? handle.scene : new THREE.Scene();
    const camera = handle ? handle.camera : new THREE.PerspectiveCamera(38, width / height, 0.1, 300);
    const renderer = handle ? handle.renderer : (() => {
      const r = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.setSize(width, height);
      r.outputColorSpace = THREE.SRGBColorSpace;
      r.domElement.style.filter = "drop-shadow(0 0 18px rgba(125, 211, 252, 0.25))";
      container.appendChild(r.domElement);
      return r;
    })();

    const ownLights = !handle;
    if (ownLights) {
      camera.position.set(0, 0, 30);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.AmbientLight(0xdbeafe, 2.2));
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
      keyLight.position.set(14, 10, 20);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0x60a5fa, 1.45);
      fillLight.position.set(-18, -6, 14);
      scene.add(fillLight);
    }

    const rockets: RocketState[] = [];
    const loader = new GLTFLoader();
    let disposed = false;
    let raf = 0;

    // Look up the target planet mesh in the shared SolarSystemStage scene so
    // the fleet follows the planet through its orbit. If the handle/scene is
    // missing, we fall back to a stand-in "earth"-style position.
    const targetMesh: THREE.Object3D | null = handle
      ? handle.planetMeshes.find((g) => (g.userData as { id?: string }).id === targetPlanet) ?? null
      : null;
    const targetBodyRadius = PLANET_SIZE[targetPlanet] ?? 0.6;
    const escortAngularSpeed = ESCORT_ANGULAR_SPEED[targetPlanet] ?? 0.85;

    // Escort orbit: a small ellipse wrapping the planet. Outer/inner radius
    // scales with planet size so the formation stays proportionate.
    const outerR = Math.max(2.2, targetBodyRadius * 4.5);
    const innerR = outerR * 0.78;
    const formationTilt = 0.18; // slight tilt so the formation reads in 3D

    // Three rocket slots: lead (wide front), wingman (right rear), trail (left
    // rear). Their escort radius and angle are spread so the formation looks
    // like a wing, not a stack.
    const slots: Array<{ escortRadius: number; escortAngle: number; phase: number; speedMul: number; baseScale: number; roll: number; height: number }> = [
      { escortRadius: outerR,        escortAngle: 0,           phase: 0,            speedMul: 1.0,  baseScale: 0.36, roll: -0.18, height: 0.0  },
      { escortRadius: outerR * 0.78, escortAngle:  Math.PI * 0.62,  phase: 0.42,         speedMul: 0.92, baseScale: 0.30, roll: 0.12,  height: 0.45 },
      { escortRadius: outerR * 0.78, escortAngle: -Math.PI * 0.62,  phase: -0.32,        speedMul: 0.92, baseScale: 0.30, roll: -0.42, height: -0.45 },
    ];

    const addRocket = (template: THREE.Object3D, index: number) => {
      const rocket = new THREE.Group();
      const model = template.clone(true);
      rocket.add(model);
      rocket.renderOrder = 20 + index;
      scene.add(rocket);
      const slot = slots[index] ?? slots[0];
      rockets.push({
        mesh: rocket,
        speed: escortAngularSpeed * slot.speedMul,
        phase: slot.phase,
        roll: slot.roll,
        wobble: 0.55 + index * 0.08,
        baseScale: slot.baseScale,
        orbitRadiusX: innerR,
        orbitRadiusZ: innerR,
        orbitTilt: formationTilt + index * 0.06,
        heightOffset: slot.height,
        escortRadius: slot.escortRadius,
        escortAngle: slot.escortAngle,
      });
    };

    const spawnFleet = (template: THREE.Object3D) => {
      addRocket(template, 0);
      addRocket(template, 1);
      addRocket(template, 2);
    };

    loader.load(
      ROCKET_MODEL_URL,
      (gltf) => {
        if (disposed) return;
        spawnFleet(normalizeRocketModel(gltf.scene));
      },
      undefined,
      () => {
        if (disposed) return;
        spawnFleet(createFallbackRocket());
      },
    );

    const fallbackTimer = window.setTimeout(() => {
      if (!disposed && rockets.length === 0) {
        spawnFleet(createFallbackRocket());
      }
    }, 2500);

    const _planetPos = new THREE.Vector3();

    const updateRockets: (t: number) => void = (t: number) => {
      // Where is the planet right now? Used as the orbit centre for every
      // rocket in the formation.
      if (targetMesh) {
        targetMesh.getWorldPosition(_planetPos);
      } else {
        _planetPos.set(0, 0, 0);
      }

      rockets.forEach((rocket, index) => {
        // Each slot has its own offset angle around the planet, plus its own
        // escort radius. The lead slot has a slightly different speed so the
        // formation breathes as it orbits.
        const angle = t * rocket.speed + rocket.phase + rocket.escortAngle;
        const localX = Math.cos(angle) * rocket.escortRadius;
        const localZ = Math.sin(angle) * rocket.escortRadius;
        const localY =
          Math.sin(t * rocket.wobble + index * 0.7) * 0.22 + rocket.heightOffset;

        // Tilt the formation a touch (z-axis rotation) and add it to the planet
        // position so the rockets always stay anchored to the planet.
        const tiltedX = localX * Math.cos(rocket.orbitTilt) - localY * Math.sin(rocket.orbitTilt);
        const tiltedY = localX * Math.sin(rocket.orbitTilt) + localY * Math.cos(rocket.orbitTilt);
        rocket.mesh.position.set(
          _planetPos.x + tiltedX,
          _planetPos.y + tiltedY,
          _planetPos.z + localZ,
        );

        // Heading follows the orbital tangent.
        const dx = -Math.sin(angle) * rocket.escortRadius;
        const dz = Math.cos(angle) * rocket.escortRadius;
        const heading = Math.atan2(dx, dz);
        rocket.mesh.rotation.set(0, 0, 0);
        rocket.mesh.rotation.z = rocket.roll + Math.sin(t * 1.15 + index) * 0.05;
        rocket.mesh.rotation.x = 0.04 + Math.cos(t * 0.9 + index * 0.8) * 0.04;
        rocket.mesh.rotation.y = heading - Math.PI / 2;

        rocket.mesh.scale.setScalar(rocket.baseScale);
      });
    };

    const onResize = () => {
      const nextWidth = container.clientWidth || window.innerWidth;
      const nextHeight = container.clientHeight || window.innerHeight;
      const persp = camera as THREE.PerspectiveCamera;
      persp.aspect = nextWidth / nextHeight;
      persp.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };
    window.addEventListener("resize", onResize);
    const clock = new THREE.Clock();
    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      updateRockets(elapsed);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (handle) {
        rockets.forEach((r) => {
          scene.remove(r.mesh);
          r.mesh.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              obj.geometry.dispose();
              if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
              else obj.material.dispose();
            }
          });
        });
      } else {
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
            else obj.material.dispose();
          }
        });
        renderer.dispose();
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      }
    };
  }, [handle, targetPlanet]);

  return <div ref={containerRef} className={`h-full w-full ${className}`.trim()} />;
}