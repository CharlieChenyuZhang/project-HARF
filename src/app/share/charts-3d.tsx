"use client";

import { OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CanvasTexture, SRGBColorSpace, type Group, type Mesh } from "three";

// Three.js needs the DOM, so this file is loaded only through next/dynamic with ssr: false.

export type Bar = { label: string; value: number; display: string; mine: boolean };

const SETTLE_MS = 1500;

const BAR_COLOR = "#6b7694";
const MINE_COLOR = "#a51c30";
const FLOOR_COLOR = "#e3e5e5";

const INK = "#1e1e1e";
const INK_SOFT = "#3d4046";

const BAR_LENGTH = 8.6;
const BAR_HEIGHT = 0.4;
const BAR_DEPTH = 0.62;
const BARS_UNITS = 10.6;
const TONE_UNITS = 11;
const ROW_PIXELS = 60;
const CAMERA: [number, number, number] = [-0.7, 11, 13];
// How much of a distance along the depth axis survives on screen at this camera angle.
const DEPTH_ON_SCREEN = CAMERA[1] / Math.hypot(...CAMERA);

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canDrag = () => window.matchMedia("(pointer: fine)").matches;

/**
 * Orthographic on purpose: with no perspective, parallel bars keep their true
 * length ratios from every angle, so the depth never changes what the data says.
 */
function Stage({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const [draggable] = useState(canDrag);
  const { ref, frameloop } = useFrameloop();
  return (
    <div ref={ref} style={{ height }}>
      <Canvas
        orthographic
        frameloop={frameloop}
        dpr={[1, 2]}
        camera={{ position: CAMERA, near: 0.1, far: 100 }}
        style={{ height }}
      >
        <FitToWidth units={width} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[-5, 12, 8]} intensity={1.8} />
        {children}
        {/* Touch screens need the swipe to scroll the page, so only a mouse can turn the chart. */}
        {draggable ? (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={0.6}
            maxPolarAngle={1.05}
            minAzimuthAngle={-0.6}
            maxAzimuthAngle={0.4}
          />
        ) : null}
      </Canvas>
    </div>
  );
}

/** Sleeps until scrolled into view, runs while the chart settles, then draws only when something changes. */
function useFrameloop() {
  const ref = useRef<HTMLDivElement>(null);
  const [frameloop, setFrameloop] = useState<"never" | "always" | "demand">("never");
  useEffect(() => {
    let settle: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setFrameloop("always");
      settle = setTimeout(() => setFrameloop("demand"), SETTLE_MS);
    });
    observer.observe(ref.current!);
    return () => {
      observer.disconnect();
      clearTimeout(settle);
    };
  }, []);
  return { ref, frameloop };
}

function FitToWidth({ units }: { units: number }) {
  useFrame(({ camera, size, invalidate }) => {
    const zoom = size.width / units;
    if (!zoom || camera.zoom === zoom) return;
    camera.zoom = zoom;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  });
  return null;
}

/** Grows from the baseline once. */
function useGrowth() {
  const [reduced] = useState(prefersReducedMotion);
  const progress = useRef(reduced ? 1 : 0);
  // Keeps asking for frames itself, so a tab switched away mid-growth can't leave bars half-grown.
  useFrame(({ invalidate }, delta) => {
    if (progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + delta / 0.8);
    invalidate();
  });
  return progress;
}

function BarMesh({ bar, z, scale }: { bar: Bar; z: number; scale: number }) {
  const mesh = useRef<Group>(null);
  const progress = useGrowth();
  const length = Math.max(0.2, bar.value * scale * BAR_LENGTH);
  useFrame(() => {
    if (!mesh.current) return;
    const eased = 1 - (1 - progress.current) ** 3;
    mesh.current.scale.x = Math.max(0.001, eased);
  });
  return (
    <group ref={mesh} position={[-BAR_LENGTH / 2, 0, z]}>
      <RoundedBox
        args={[length, BAR_HEIGHT, BAR_DEPTH]}
        radius={0.09}
        smoothness={3}
        position={[length / 2, BAR_HEIGHT / 2, 0]}
      >
        <meshStandardMaterial color={bar.mine ? MINE_COLOR : BAR_COLOR} roughness={0.55} />
      </RoundedBox>
    </group>
  );
}

type LabelPart = { text: string; color: string; weight?: number };

/** Text drawn into the scene, so it turns with the chart. Stays a fixed pixel size at any chart width. */
function Label({
  parts,
  position,
  center = [0, 0],
  maxPixels,
  stageUnits,
}: {
  parts: LabelPart[];
  position: [number, number, number];
  center?: [number, number];
  maxPixels: number;
  stageUnits: number;
}) {
  const width = useThree((state) => state.size.width);
  const invalidate = useThree((state) => state.invalidate);
  const signature = JSON.stringify(parts);
  const label = useMemo(() => {
    const scale = 3;
    const gap = 8;
    const family = getComputedStyle(document.body).fontFamily;
    const context = document.createElement("canvas").getContext("2d")!;
    const fontFor = (size: number, weight = 400) => `${weight} ${size * scale}px ${family}`;
    const measure = (size: number) =>
      (JSON.parse(signature) as LabelPart[]).reduce((sum, part) => {
        context.font = fontFor(size, part.weight);
        return sum + context.measureText(part.text).width / scale + gap;
      }, -gap);
    const fontSize = Math.min(12, (12 * maxPixels) / measure(12));
    const textWidth = Math.ceil(measure(fontSize));
    const height = 18;
    context.canvas.width = textWidth * scale;
    context.canvas.height = height * scale;
    let x = 0;
    context.textBaseline = "middle";
    for (const part of JSON.parse(signature) as LabelPart[]) {
      context.font = fontFor(fontSize, part.weight);
      context.fillStyle = part.color;
      context.fillText(part.text, x, (height / 2) * scale);
      x += context.measureText(part.text).width + gap * scale;
    }
    const texture = new CanvasTexture(context.canvas);
    texture.colorSpace = SRGBColorSpace;
    return { texture, textWidth, height };
  }, [signature, maxPixels]);
  useEffect(() => {
    invalidate();
    return () => label.texture.dispose();
  }, [label, invalidate]);

  const unitsPerPixel = stageUnits / width;
  return (
    <sprite
      position={position}
      center={center}
      scale={[label.textWidth * unitsPerPixel, label.height * unitsPerPixel, 1]}
      renderOrder={1}
    >
      <spriteMaterial map={label.texture} transparent depthTest={false} toneMapped={false} />
    </sprite>
  );
}

function BarsScene({ bars }: { bars: Bar[] }) {
  const width = useThree((state) => state.size.width);
  const pixelsPerUnit = width / BARS_UNITS;
  const rowDepth = ROW_PIXELS / (pixelsPerUnit * DEPTH_ON_SCREEN);
  const max = Math.max(...bars.map((b) => b.value), 0.01);
  const depth = bars.length * rowDepth;
  const startZ = -(depth - rowDepth) / 2 + rowDepth * 0.14;
  const labelGap = 3 / (pixelsPerUnit * DEPTH_ON_SCREEN);
  return (
    <>
      <RoundedBox args={[BAR_LENGTH + 0.8, 0.16, depth + 0.1]} radius={0.06} smoothness={3} position={[0, -0.08, 0]}>
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.9} />
      </RoundedBox>
      {bars.map((bar, i) => {
        const z = startZ + i * rowDepth;
        const weight = bar.mine ? 600 : 400;
        return (
          <group key={bar.label}>
            <BarMesh bar={bar} z={z} scale={1 / max} />
            <Label
              position={[-BAR_LENGTH / 2, BAR_HEIGHT, z - BAR_DEPTH / 2 - labelGap]}
              maxPixels={BAR_LENGTH * pixelsPerUnit}
              stageUnits={BARS_UNITS}
              parts={[
                { text: bar.mine ? `${bar.label} · You` : bar.label, color: INK, weight },
                { text: bar.display, color: INK_SOFT, weight },
              ]}
            />
          </group>
        );
      })}
    </>
  );
}

/** Horizontal 3D bars with every name and value labelled directly. */
export function Bars3D({ bars }: { bars: Bar[] }) {
  return (
    <Stage width={BARS_UNITS} height={bars.length * ROW_PIXELS + 64}>
      <BarsScene bars={bars} />
    </Stage>
  );
}

function ToneMarker({ score }: { score: number }) {
  const marker = useRef<Mesh>(null);
  const progress = useGrowth();
  const target = (score * BAR_LENGTH) / 2;
  useFrame(() => {
    if (marker.current) marker.current.position.x = target * (1 - (1 - progress.current) ** 3);
  });
  return (
    <mesh ref={marker} position={[0, 0.55, 0]}>
      <sphereGeometry args={[0.55, 40, 28]} />
      <meshStandardMaterial color={MINE_COLOR} roughness={0.35} />
    </mesh>
  );
}

/** A slab running from negative to positive, with a marker at this story's score. */
export function ToneScale3D({ score }: { score: number }) {
  return (
    <Stage width={TONE_UNITS} height={170}>
      <RoundedBox args={[BAR_LENGTH + 0.6, 0.3, 1.5]} radius={0.08} smoothness={3} position={[0, -0.15, 0]}>
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.05, 0.05, 1.5]} />
        <meshStandardMaterial color={BAR_COLOR} />
      </mesh>
      <ToneMarker score={score} />
      <Label
        parts={[{ text: "Negative", color: INK_SOFT }]}
        position={[-BAR_LENGTH / 2, 0, 1.2]}
        center={[0, 1]}
        maxPixels={200}
        stageUnits={TONE_UNITS}
      />
      <Label
        parts={[{ text: "Positive", color: INK_SOFT }]}
        position={[BAR_LENGTH / 2, 0, 1.2]}
        center={[1, 1]}
        maxPixels={200}
        stageUnits={TONE_UNITS}
      />
    </Stage>
  );
}
