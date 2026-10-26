import { Clone, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useScroll, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { CanvasTexture, NoToneMapping, SRGBColorSpace } from "three";
const ultraUrl = "/models/satin-ultra.glb?v=3";
const pinkUrl = "/models/satin-xl7.glb?v=2";
const regularUrl = "/models/satin-regular.glb?v=3";
const carryUrl = "/models/satin-pack-of-2.glb?v=1";
const ultraEightUrl = "/models/satin-ultra-8.glb?v=1";
const bandOffset = ["start end", "end start"];
const heroOffset = ["start start", "end start"];
const bandSize = "mx-auto h-[min(38svh,340px)] w-full desk:h-[min(58vh,520px)]";
const heroSize = "mx-auto h-[min(42svh,380px)] w-full desk:h-[min(78vh,700px)]";

// `front` is the Y rotation that faces the printed front at the camera. Band views reach it
// mid-scroll (half a turn in), lead views show it on load. Pinned views start on the front and
// turn by `pinSweep` while held: half a turn to the printed back for flat packs, three quarters
// to the directions panel for the near-cube Ultra box.

export function UltraBoxView(props) {
  return (
    <PackModelView
      {...props}
      modelUrl={ultraUrl}
      halfX={0.0475}
      halfY={0.055}
      halfZ={0.045}
      front={Math.PI}
      leadFit={1}
      pinSweep={Math.PI * 1.5}
      shadow={{ radius: 0.055, scale: [1, 1, 1], color: "#072633", opacity: 0.22 }}
    />
  );
}

export function RegularBoxView(props) {
  return (
    <PackModelView
      {...props}
      modelUrl={regularUrl}
      halfX={0.1125}
      halfY={0.0375}
      halfZ={0.025}
      front={Math.PI + 0.5}
      fit={0.98}
      lift={0.2}
      shadow={{ radius: 0.13, scale: [1.05, 1, 0.75], color: "#160010", opacity: 0.92, soft: true }}
    />
  );
}

export function CarryBoxView(props) {
  return (
    <PackModelView
      {...props}
      modelUrl={carryUrl}
      halfX={0.055}
      halfY={0.0625}
      halfZ={0.025}
      front={-0.45}
      fit={1.28}
      frameClass="mx-auto h-[min(36svh,320px)] w-full desk:h-[min(58vh,540px)]"
      shadow={{ radius: 0.038, scale: [1.15, 1, 0.58], color: "#020a18", opacity: 0.7, soft: true }}
    />
  );
}

export function UltraEightBoxView(props) {
  return (
    <PackModelView
      {...props}
      modelUrl={ultraEightUrl}
      halfX={0.0475}
      halfY={0.055}
      halfZ={0.025}
      front={-0.45}
      fit={1.18}
      shadow={{ radius: 0.045, scale: [1.3, 1, 0.75], color: "#2c5f7c", opacity: 0.22 }}
    />
  );
}

export function PinkBoxView(props) {
  return (
    <PackModelView
      {...props}
      modelUrl={pinkUrl}
      halfX={0.1275}
      halfY={0.035}
      halfZ={0.02}
      front={0.58}
      fit={1.02}
      lift={0.22}
      shadow={{ radius: 0.06, scale: [1.3, 1, 0.5], color: "#a8604f", opacity: 0.24 }}
    />
  );
}

function PackModelView({
  sectionRef,
  reduce,
  lead = false,
  pin = false,
  pinTop = 64,
  pinSweep = Math.PI,
  modelUrl,
  halfX,
  halfY,
  halfZ,
  front = 0,
  fit = 1.32,
  leadFit = fit,
  lift = 0.16,
  shadow,
  stand,
  frameClass,
}) {
  const turn = lead || pin ? front : front - Math.PI;
  const offset = pin ? [`start ${pinTop}px`, "end end"] : lead ? heroOffset : bandOffset;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.3, restDelta: 0.0008 });
  const sweep = pin ? pinSweep : Math.PI * 2;
  const rotation = useTransform(reduce ? scrollYProgress : smooth, (value) => (reduce ? front : turn + value * sweep));

  const canvas = (
      <Canvas
        frameloop="demand"
        resize={{ offsetSize: true }}
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: NoToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{ fov: 30, position: [0, 0.12, 0.45], near: 0.01, far: 10 }}
        style={{ width: "100%", height: "100%", background: "transparent", touchAction: "pan-y" }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = NoToneMapping;
          gl.toneMappingExposure = 1;
          gl.outputColorSpace = SRGBColorSpace;
          gl.setClearColor(0x000000, 0);
          scene.background = null;
          scene.environment = null;
        }}
      >
        <Suspense fallback={null}>
          <Studio />
          <Frame halfX={halfX} halfY={halfY} halfZ={halfZ} fit={lead ? leadFit : fit} lift={lift} floor={stand ? -0.003 - stand.height : 0} base={stand?.radius} />
          {shadow.soft ? (
            <SoftShadow {...shadow} />
          ) : (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} scale={shadow.scale}>
              <circleGeometry args={[shadow.radius, 48]} />
              <meshBasicMaterial color={shadow.color} transparent opacity={shadow.opacity} depthWrite={false} />
            </mesh>
          )}
          {stand && <Stand {...stand} />}
          <ScrollSpin rotation={rotation} modelUrl={modelUrl} />
        </Suspense>
      </Canvas>
  );

  return (
    <div className={frameClass || (lead ? heroSize : bandSize)}>{canvas}</div>
  );
}

function SoftShadow({ radius, scale, color, opacity, y = -0.002 }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d");
    const fade = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    fade.addColorStop(0, "rgba(255,255,255,1)");
    fade.addColorStop(0.35, "rgba(255,255,255,0.75)");
    fade.addColorStop(0.7, "rgba(255,255,255,0.22)");
    fade.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = fade;
    context.fillRect(0, 0, 128, 128);
    return new CanvasTexture(canvas);
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} scale={scale}>
      <planeGeometry args={[radius * 2, radius * 2]} />
      <meshBasicMaterial map={texture} color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

function paint(width, height, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function mix(from, to, amount) {
  return from.map((value, index) => Math.round(value + (to[index] - value) * amount));
}

// Shading is baked into the textures, so the stone reads the same on every GPU and light setup.
// Cylinder UVs start at +z (facing the camera) and wrap through +x, so u maps to the angle.
function stoneWall(dark, light) {
  return paint(256, 32, (context, width, height) => {
    const key = [0.45, 0, 0.89];
    for (let x = 0; x < width; x += 1) {
      const angle = (x / width) * Math.PI * 2;
      const lambert = Math.max(0, Math.sin(angle) * key[0] + Math.cos(angle) * key[2]);
      const shade = 0.3 + 0.7 * lambert ** 0.8;
      const column = context.createLinearGradient(0, 0, 0, height);
      column.addColorStop(0, `rgb(${mix(dark, light, Math.min(1, shade + 0.25))})`);
      column.addColorStop(0.18, `rgb(${mix(dark, light, shade)})`);
      column.addColorStop(1, `rgb(${mix(dark, light, shade * 0.72)})`);
      context.fillStyle = column;
      context.fillRect(x, 0, 1, height);
    }
  });
}

function stoneFace(edge, centre) {
  return paint(256, 256, (context, width) => {
    const glow = context.createRadialGradient(width * 0.56, width * 0.6, 0, width / 2, width / 2, width / 2);
    glow.addColorStop(0, centre);
    glow.addColorStop(0.7, centre);
    glow.addColorStop(1, edge);
    context.fillStyle = glow;
    context.fillRect(0, 0, width, width);
  });
}

// A round stone stand whose top sits just under the pack, so it lines up at any canvas size.
function Stand({ radius, height }) {
  const top = -0.003;
  const textures = useMemo(
    () => ({
      wall: stoneWall([226, 192, 175], [250, 236, 228]),
      face: stoneFace("#f2ddd1", "#faefe9"),
    }),
    [],
  );

  return (
    <>
      <SoftShadow radius={radius} scale={[0.92, 1.4, 1]} color="#9a5a4c" opacity={0.4} y={top - height - 0.0005} />
      <mesh position={[0, top - height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 128, 1, true]} />
        <meshBasicMaterial map={textures.wall} />
      </mesh>
      <mesh position={[0, top, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 128]} />
        <meshBasicMaterial map={textures.face} />
      </mesh>
      <mesh position={[0, top, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.0008, 8, 192]} />
        <meshBasicMaterial color="#fdf5f1" />
      </mesh>
    </>
  );
}

function Studio() {
  return (
    <>
      <ambientLight intensity={Math.PI * 1.12} />
      <directionalLight position={[0.6, 1.4, 2.2]} intensity={0.45} />
      <directionalLight position={[-1.8, 0.8, 0.5]} intensity={0.35} />
    </>
  );
}

function Frame({ halfX, halfY, halfZ, fit, lift, floor = 0, base = 0 }) {
  const { camera, size, invalidate } = useThree();

  useLayoutEffect(() => {
    // `base` is the radius of a stand under the pack, which must stay inside the frame too.
    const halfWidth = Math.max(Math.hypot(halfX, halfZ), base);
    const aspect = Math.max(size.width, 1) / Math.max(size.height, 1);
    const fov = (camera.fov * Math.PI) / 180;
    const tan = Math.tan(fov / 2);
    const spread = tan * aspect;
    // A spinning corner sweeps a circle of radius halfWidth; this is the closest the camera can
    // sit before that circle's perspective silhouette leaves the frame.
    const clear = (halfWidth * Math.hypot(1, spread)) / spread;
    let distance = Math.max((Math.max(halfY / tan, halfWidth / spread) || 0.4) * fit, clear);
    const pitch = Math.atan(lift);
    const reach = (fov / 2) * 0.96;
    // `floor` is the lowest point to keep in view, below the pack when it stands on something.
    const middle = (floor + halfY * 2) / 2;
    const fits = (d) =>
      [floor, halfY * 2].every((y) => Math.abs(Math.atan2(middle + d * lift - y, d - halfWidth) - pitch) <= reach);
    for (let step = 0; step < 80 && !fits(distance); step += 1) distance *= 1.02;
    camera.position.set(0, middle + distance * lift, distance);
    camera.lookAt(0, middle, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate, halfX, halfY, halfZ, fit, lift, floor, base]);

  return null;
}

function ScrollSpin({ rotation, modelUrl }) {
  const group = useRef(null);
  const { invalidate } = useThree();

  useLayoutEffect(() => {
    if (group.current) group.current.rotation.y = rotation.get();
    invalidate();
  }, [invalidate, rotation]);

  useMotionValueEvent(rotation, "change", (value) => {
    if (!group.current) return;
    group.current.rotation.y = value;
    invalidate();
  });

  return (
    <group ref={group}>
      <BoxModel modelUrl={modelUrl} />
    </group>
  );
}

function BoxModel({ modelUrl }) {
  const { scene } = useGLTF(modelUrl);
  const { invalidate, gl } = useThree();
  const clone = useRef(null);

  useLayoutEffect(() => {
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    clone.current?.traverse((node) => {
      if (!node.isMesh || !node.material) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        material.metalness = 0;
        material.roughness = 1;
        material.envMapIntensity = 0;
        if (material.map) {
          material.map.colorSpace = SRGBColorSpace;
          material.map.anisotropy = anisotropy;
          material.map.needsUpdate = true;
        }
        material.needsUpdate = true;
      });
    });
    invalidate();
  }, [gl, invalidate]);

  return <Clone ref={clone} object={scene} />;
}

useGLTF.preload(ultraUrl);
useGLTF.preload(pinkUrl);
useGLTF.preload(regularUrl);
useGLTF.preload(carryUrl);
useGLTF.preload(ultraEightUrl);
