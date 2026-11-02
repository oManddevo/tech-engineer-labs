import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const PARTICLE_COUNT = 12000;
const MOUSE_RADIUS = 12;
const MAX_TEXT_WIDTH = 760; // canvas px, about "ENGINEER" at 150px; wider text is shrunk to fit the hero
const SCREEN_FILL = 0.88; // share of the visible width the text may take on narrow screens

// Evenly spreads `count` points over a sphere (Fibonacci spiral).
const generateSpherePositions = (count, radius) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
    positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  return positions;
};

// Samples the pixels of `text` drawn on a canvas; leftover particles are scattered far away.
// Canvas px map to world units at 1/20, shrunk further so the text is at most `maxWorldWidth` wide.
const generateTextPositions = (text, count, fontSize = 100, maxWorldWidth = Infinity) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Float32Array(count * 3);

  canvas.width = 2000;
  canvas.height = 1000;
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  const fittedSize = Math.min(fontSize, (fontSize * MAX_TEXT_WIDTH) / ctx.measureText(text).width);
  ctx.font = `bold ${fittedSize}px Inter, sans-serif`;
  const worldScale = Math.min(1 / 20, maxWorldWidth / ctx.measureText(text).width);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const points = [];
  for (let y = 0; y < canvas.height; y += 4) {
    for (let x = 0; x < canvas.width; x += 4) {
      if (data[(y * canvas.width + x) * 4 + 3] > 128) {
        points.push({ x: (x - canvas.width / 2) * worldScale, y: -(y - canvas.height / 2) * worldScale });
      }
    }
  }

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    if (i < points.length) {
      positions[i * 3] = points[i].x;
      positions[i * 3 + 1] = points[i].y;
      positions[i * 3 + 2] = 0;
    } else if (Math.random() < 0.05) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    } else {
      const r = 10000;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
  }
  return positions;
};

// A spinning particle sphere that morphs into `text` once expanded; particles flee the cursor
// and a click sends a shockwave ring through them.
const ParticleText = ({ text = "VIBEK", isExpanded }) => {
  const pointsRef = useRef(null);
  const { camera, size, viewport } = useThree();
  const scale = size.width < 768 ? 0.55 : 1;
  const count = PARTICLE_COUNT;
  // Widest the text may be in the points' own (scaled) units so it stays on screen; rounded to limit re-sampling on resize.
  const maxTextWidth = Math.round(((viewport.width * SCREEN_FILL) / scale) * 10) / 10;

  const spherePositions = useMemo(() => generateSpherePositions(count, 12), []);
  const textPositions = useMemo(() => generateTextPositions(text, count, 150, maxTextWidth), [text, maxTextWidth]);
  const offsets = useRef(new Float32Array(count * 3));
  const colors = useMemo(() => new Float32Array(count * 3).fill(1), [count]);
  const mouse3D = useMemo(() => new THREE.Vector3(10000, 10000, 10000), []);
  const pointer = useMemo(() => new THREE.Vector3(), []);
  const rayDir = useMemo(() => new THREE.Vector3(), []);
  const shockwave = useRef(0);
  const morph = useRef({ progress: 0 });

  useEffect(() => {
    const handleClick = () => {
      gsap.fromTo(shockwave, { current: 1 }, { current: 0, duration: 1.5, ease: "power2.out" });
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!isExpanded || !pointsRef.current) return;
    gsap.to(morph.current, { progress: 1, duration: 2.5, ease: "power3.inOut", delay: 0.5 });
    gsap.to(pointsRef.current.rotation, { x: 0, y: 0, z: 0, duration: 2, ease: "power3.out" });
  }, [isExpanded]);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;

    const positions = points.geometry.attributes.position.array;
    const colorArray = points.geometry.attributes.color.array;
    const progress = morph.current.progress;
    const scrollY = window.scrollY;

    // Push the particles toward the camera and fade them out as the page scrolls.
    points.position.z = THREE.MathUtils.lerp(points.position.z, scrollY * 0.05, 0.1);
    points.material.opacity = Math.max(0, 1 - Math.max(0, scrollY - 200) / 600);

    // Project the cursor onto the particles' plane.
    if (progress > 0.8 && !(state.pointer.x === 0 && state.pointer.y === 0)) {
      pointer.set(state.pointer.x, state.pointer.y, 0.5);
      pointer.unproject(camera);
      rayDir.copy(pointer).sub(camera.position).normalize();
      const distance = (points.position.z - camera.position.z) / rayDir.z;
      mouse3D.copy(camera.position).add(rayDir.multiplyScalar(distance));
    }

    if (progress < 0.1) points.rotation.y += 0.002;

    const baseColor = new THREE.Color("#67e8f9");
    const hotColor = new THREE.Color("#ffffff");

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const x = spherePositions[ix] + (textPositions[ix] - spherePositions[ix]) * progress;
      const y = spherePositions[iy] + (textPositions[iy] - spherePositions[iy]) * progress;
      const z = spherePositions[iz] + (textPositions[iz] - spherePositions[iz]) * progress;

      let dx = 0;
      let dy = 0;
      let dz = 0;
      let heat = 0;

      if (progress > 0.8) {
        const mx = x - mouse3D.x;
        const my = y - mouse3D.y;
        const dist = Math.sqrt(mx * mx + my * my);

        if (dist < MOUSE_RADIUS) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) ** 2;
          const angle = Math.atan2(my, mx);
          dx += Math.cos(angle) * force * 6;
          dy += Math.sin(angle) * force * 6;
          dz += force * 4;
          heat = force;
        }

        if (shockwave.current > 0.01) {
          const ringRadius = (1 - shockwave.current) * 50;
          const ringDist = Math.abs(dist - ringRadius);
          if (ringDist < 5) {
            const push = (1 - ringDist / 5) * shockwave.current * 10;
            const angle = Math.atan2(my, mx);
            dx += Math.cos(angle) * push;
            dy += Math.sin(angle) * push;
            dz += push * 0.5;
            heat = Math.max(heat, push * 0.5);
          }
        }
      }

      const offset = offsets.current;
      offset[ix] += (dx - offset[ix]) * 0.1;
      offset[iy] += (dy - offset[iy]) * 0.1;
      offset[iz] += (dz - offset[iz]) * 0.1;

      positions[ix] = x + offset[ix];
      positions[iy] = y + offset[iy];
      positions[iz] = z + offset[iz];

      colorArray[ix] = baseColor.r + (hotColor.r - baseColor.r) * heat;
      colorArray[iy] = baseColor.g + (hotColor.g - baseColor.g) * heat;
      colorArray[iz] = baseColor.b + (hotColor.b - baseColor.b) * heat;

      if (progress > 0.8) {
        positions[ix] += Math.sin(state.clock.elapsedTime * 0.5 + positions[iy]) * 0.005;
        positions[iz] += Math.cos(state.clock.elapsedTime * 0.3 + positions[ix]) * 0.005;
      } else {
        positions[ix] += Math.sin(state.clock.elapsedTime + positions[iy]) * 0.02;
      }
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} scale={[scale, scale, scale]} position={[0, 2, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={new Float32Array(count * 3)} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleText;
