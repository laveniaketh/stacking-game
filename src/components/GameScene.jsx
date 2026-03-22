import { useRef, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useBox } from "@react-three/cannon";
import * as THREE from "three";
import { useMediaQuery } from "react-responsive";
import { useGame, BOX_HEIGHT, ORIGINAL_BOX_SIZE } from "../store/gameStore";

const SPEED = 0.008;
// Snap moving block if it is nearly aligned.
const SNAP_THRESHOLD = 0.15;

// ─── Color palette
const LAYERS_PER_CYCLE = 80;
const PALETTE = [
  new THREE.Color("#f4a7a7"),
  new THREE.Color("#f4b8a0"),
  new THREE.Color("#f4cfa0"),
  new THREE.Color("#f4e4a0"),
  new THREE.Color("#d4eda0"),
  new THREE.Color("#a8dba8"),
  new THREE.Color("#a0d4c8"),
  new THREE.Color("#a0c8d4"),
  new THREE.Color("#a0b4e8"),
  new THREE.Color("#b8a0e8"),
  new THREE.Color("#d0a0e4"),
  new THREE.Color("#e8a0d0"),
  new THREE.Color("#f4a7bc"),
  new THREE.Color("#f4a7a7"),
];

function getBlockColor(layerIndex) {
  const segments = PALETTE.length - 1;
  const t = (layerIndex % LAYERS_PER_CYCLE) / LAYERS_PER_CYCLE;
  const pos = t * segments;
  const i = Math.floor(pos);
  const frac = pos - i;
  const color = new THREE.Color();
  color.lerpColors(PALETTE[i], PALETTE[i + 1], frac);
  return color;
}

// ─── Block

function Block({ position, width, depth, color, falls = false }) {
  const [ref] = useBox(() => ({
    mass: falls
      ? 5 * (width / ORIGINAL_BOX_SIZE) * (depth / ORIGINAL_BOX_SIZE)
      : 0,
    position,
    args: [width, BOX_HEIGHT, depth],
  }));

  return (
    <mesh ref={ref} position={position} castShadow receiveShadow>
      <boxGeometry args={[width, BOX_HEIGHT, depth]} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}

// ─── Moving top block

function MovingTopBlock({ layer, blockRef, onMiss, gamePhase, color }) {
  const { direction, width, depth, y, x, z } = layer;
  const posRef = useRef(-10);
  const missedRef = useRef(false);

  const initPosition = direction === "x" ? [-10, y, z] : [x, y, -10];

  useFrame((_, delta) => {
    if (!blockRef.current || gamePhase === "dead") return;
    posRef.current += SPEED * delta * 1000;
    blockRef.current.position[direction] = posRef.current;
    if (posRef.current > 10 && !missedRef.current) {
      missedRef.current = true;
      onMiss();
    }
  });

  return (
    <mesh ref={blockRef} position={initPosition} castShadow>
      <boxGeometry args={[width, BOX_HEIGHT, depth]} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}

function OrthoCamera({
  stackLength,
  gamePhase,
  orthoZoom,
  cameraBasePos,
  groupScale,
  groupPositionY,
}) {
  const { camera, size } = useThree();
  const prevPhase = useRef(gamePhase);

  const getTargetY = useCallback(() => {
    const scaledStackTop =
      (stackLength - 1) * BOX_HEIGHT * groupScale + groupPositionY;
    return scaledStackTop + cameraBasePos[1];
  }, [stackLength, groupScale, groupPositionY, cameraBasePos]);

  const applyOrtho = useCallback(() => {
    const aspect = size.width / size.height;
    const halfH = orthoZoom;
    const halfW = halfH * aspect;

    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
    camera.near = 0.1;
    camera.far = 200;
    camera.zoom = 1;
    camera.updateProjectionMatrix();
  }, [camera, size, orthoZoom]);

  const resetCamera = useCallback(() => {
    const y = getTargetY();
    camera.position.set(cameraBasePos[0], y, cameraBasePos[2]);
    applyOrtho();
    camera.lookAt(0, y - cameraBasePos[1], 0);
  }, [camera, getTargetY, cameraBasePos, applyOrtho]);

  useEffect(() => {
    resetCamera();
  }, []);

  useEffect(() => {
    const wasOver =
      prevPhase.current === "dead" || prevPhase.current === "intro";
    if (wasOver && gamePhase === "playing") resetCamera();
    prevPhase.current = gamePhase;
  }, [gamePhase, resetCamera]);

  useEffect(() => {
    applyOrtho();
  }, [applyOrtho]);

  useFrame((_, delta) => {
    const targetY = getTargetY();

    if (camera.position.y < targetY) {
      camera.position.y = Math.min(
        camera.position.y + SPEED * delta * 1000,
        targetY,
      );
    } else if (camera.position.y > targetY) {
      camera.position.y = targetY;
    }

    camera.lookAt(0, camera.position.y - cameraBasePos[1], 0);
  });

  return null;
}

const SKY_STOPS = [
  { at: 0, color: new THREE.Color("#87ceeb") },
  { at: 8, color: new THREE.Color("#4a9eca") },
  { at: 18, color: new THREE.Color("#1a3a5c") },
  { at: 30, color: new THREE.Color("#0d1b2a") },
  { at: 50, color: new THREE.Color("#050810") },
];

function getSkyColor(stackLength) {
  const height = Math.max(0, stackLength - 1);
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    const a = SKY_STOPS[i];
    const b = SKY_STOPS[i + 1];
    if (height >= a.at && height < b.at) {
      const t = (height - a.at) / (b.at - a.at);
      const c = new THREE.Color();
      c.lerpColors(a.color, b.color, t);
      return c;
    }
  }
  return SKY_STOPS[SKY_STOPS.length - 1].color.clone();
}

function SkyBackground() {
  const { scene } = useThree();
  const { state } = useGame();
  const colorRef = useRef(new THREE.Color("#87ceeb"));

  useFrame(() => {
    const target = getSkyColor(state.stack.length);
    colorRef.current.lerp(target, 0.02);
    scene.background = colorRef.current;
  });

  return null;
}

function PerfectFlash({ trigger }) {
  const ambientRef = useRef();
  const dirRef = useRef();
  const tRef = useRef(0);
  const baseAmbient = 0.6;
  const baseDirectional = 0.6;
  const flashColor = useRef(new THREE.Color("#fff7d1"));
  const ambientBaseColor = useRef(new THREE.Color("#fffbe8"));
  const directionalBaseColor = useRef(new THREE.Color("#ffffff"));
  const workingColor = useRef(new THREE.Color());

  useEffect(() => {
    if (trigger > 0) tRef.current = 1;
  }, [trigger]);

  useFrame((_, delta) => {
    if (!ambientRef.current || !dirRef.current) return;

    if (tRef.current <= 0) {
      ambientRef.current.intensity = baseAmbient;
      ambientRef.current.color.copy(ambientBaseColor.current);
      dirRef.current.intensity = baseDirectional;
      dirRef.current.color.copy(directionalBaseColor.current);
      return;
    }

    // Ease-out cubic curve keeps the flash bright at the beginning and smooths the fade.
    tRef.current = Math.max(0, tRef.current - delta * 2.8);
    const eased = 1 - Math.pow(1 - tRef.current, 3);

    workingColor.current
      .copy(flashColor.current)
      .lerp(ambientBaseColor.current, 1 - eased * 0.85);

    ambientRef.current.intensity = baseAmbient + eased * 2.6;
    ambientRef.current.color.copy(workingColor.current);

    dirRef.current.intensity = baseDirectional + eased * 3.2;
    dirRef.current.color.copy(workingColor.current);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={baseAmbient} color="#fffbe8" />
      <directionalLight
        ref={dirRef}
        intensity={baseDirectional}
        position={[10, 20, 0]}
        color="#ffffff"
      />
    </>
  );
}

// ─── Scene content

function SceneContent({
  onAction,
  groupScale,
  groupPosition,
  orthoZoom,
  cameraBasePos,
}) {
  const groupPositionY = groupPosition[1];
  const { state, dispatch } = useGame();
  const movingBlockRef = useRef();
  const perfectCountRef = useRef(0);
  const [perfectFlash, setPerfectFlash] = useState(0);

  const fixedLayers = state.stack.slice(0, -1);
  const topLayer = state.stack[state.stack.length - 1];
  const previousLayer = state.stack[state.stack.length - 2];

  const handleMiss = useCallback(() => {
    if (!topLayer) return;
    if (state.phase === "intro" || state.autopilot) {
      dispatch({ type: "AUTOPILOT_INIT" });
      return;
    }
    dispatch({ type: "GAME_OVER" });
  }, [topLayer, dispatch, state.phase, state.autopilot]);

  useEffect(() => {
    if (!onAction) return;
    onAction.current = () => {
      if (!movingBlockRef.current || !topLayer || !previousLayer) return;
      if (state.phase === "dead") return;

      const direction = topLayer.direction;
      const movingPos = movingBlockRef.current.position[direction];
      const prevPos = direction === "x" ? previousLayer.x : previousLayer.z;
      const size = direction === "x" ? topLayer.width : topLayer.depth;
      const rawDelta = movingPos - prevPos;
      const overhangSize = Math.abs(rawDelta);
      const overlap = size - overhangSize;

      // Perfect placement keeps full size.
      const isPerfect = overhangSize <= SNAP_THRESHOLD;
      const delta = isPerfect ? 0 : rawDelta;

      if (isPerfect || overlap > 0) {
        const newWidth =
          direction === "x"
            ? isPerfect
              ? topLayer.width
              : overlap
            : topLayer.width;
        const newDepth =
          direction === "z"
            ? isPerfect
              ? topLayer.depth
              : overlap
            : topLayer.depth;

        if (isPerfect) {
          movingBlockRef.current.position[direction] = prevPos;

          perfectCountRef.current += 1;
          if (navigator.vibrate) navigator.vibrate(40);

          dispatch({ type: "PERFECT_PLACEMENT" });
          setPerfectFlash((f) => f + 1);
        } else {
          const overhangShift =
            (overlap / 2 + overhangSize / 2) * Math.sign(delta);
          dispatch({
            type: "ADD_OVERHANG",
            overhang: {
              x:
                direction === "x"
                  ? movingPos - delta / 2 + overhangShift
                  : topLayer.x,
              z:
                direction === "z"
                  ? movingPos - delta / 2 + overhangShift
                  : topLayer.z,
              y: topLayer.y,
              width: direction === "x" ? overhangSize : topLayer.width,
              depth: direction === "z" ? overhangSize : topLayer.depth,
              id: `overhang-${Date.now()}`,
            },
          });
        }

        const newX =
          direction === "x"
            ? isPerfect
              ? prevPos
              : movingPos - delta / 2
            : topLayer.x;
        const newZ =
          direction === "z"
            ? isPerfect
              ? prevPos
              : movingPos - delta / 2
            : topLayer.z;
        dispatch({
          type: "UPDATE_TOP_LAYER",
          updates: { width: newWidth, depth: newDepth, x: newX, z: newZ },
        });

        const nextDirection = direction === "x" ? "z" : "x";
        dispatch({
          type: "ADD_LAYER",
          layer: {
            x: direction === "x" ? newX : -10,
            z: direction === "z" ? newZ : -10,
            y: BOX_HEIGHT * state.stack.length,
            width: newWidth,
            depth: newDepth,
            direction: nextDirection,
            id: `layer-${Date.now()}`,
          },
          score: state.stack.length - 1,
        });
        dispatch({ type: "SET_ROBOT_PRECISION" });
      } else {
        if (state.phase === "intro" || state.autopilot) {
          dispatch({ type: "AUTOPILOT_INIT" });
        } else {
          dispatch({ type: "GAME_OVER" });
        }
      }
    };
  }, [state, topLayer, previousLayer, dispatch]);

  useFrame(() => {
    if (!state.autopilot || state.phase === "dead") return;
    if (!movingBlockRef.current || !topLayer || !previousLayer) return;
    const direction = topLayer.direction;
    const movingPos = movingBlockRef.current.position[direction];
    const prevPos = direction === "x" ? previousLayer.x : previousLayer.z;
    if (movingPos >= prevPos + state.robotPrecision) onAction?.current?.();
  });

  return (
    <>
      <OrthoCamera
        stackLength={state.stack.length}
        gamePhase={state.phase}
        orthoZoom={orthoZoom}
        cameraBasePos={cameraBasePos}
        groupScale={groupScale}
        groupPositionY={groupPositionY}
      />

      <SkyBackground />
      <PerfectFlash trigger={perfectFlash} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 0]} intensity={0.6} castShadow />

      <group scale={groupScale} position={groupPosition}>
        {fixedLayers.map((layer, i) => (
          <Block
            key={layer.id}
            position={[layer.x, layer.y, layer.z]}
            width={layer.width}
            depth={layer.depth}
            color={getBlockColor(i)}
            falls={false}
          />
        ))}

        {state.overhangs.map((oh) => (
          <Block
            key={oh.id}
            position={[oh.x, oh.y, oh.z]}
            width={oh.width}
            depth={oh.depth}
            color={getBlockColor(state.stack.length)}
            falls={true}
          />
        ))}

        {topLayer && state.phase !== "dead" && (
          <MovingTopBlock
            key={topLayer.id}
            layer={topLayer}
            blockRef={movingBlockRef}
            onMiss={handleMiss}
            gamePhase={state.phase}
            color={getBlockColor(state.stack.length - 1)}
          />
        )}
      </group>
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function GameScene({ onAction }) {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });

  const groupScale = isMobile ? 0.55 : isTablet ? 0.75 : 1;
  const groupPosition = isMobile
    ? [0, -3.5, 0]
    : isTablet
      ? [0, -2, 0]
      : [0, 0, 0];

  const orthoZoom = isMobile ? 7 : isTablet ? 6 : 5;
  const cameraBasePos = [4, 4, 4];

  return (
    <Canvas
      orthographic
      camera={{
        position: cameraBasePos,
        near: 0.1,
        far: 200,
        left: -10,
        right: 10,
        top: 10,
        bottom: -10,
      }}
      shadows
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0, 0);
      }}
    >
      <Physics gravity={[0, -10, 0]}>
        <SceneContent
          onAction={onAction}
          groupScale={groupScale}
          groupPosition={groupPosition}
          orthoZoom={orthoZoom}
          cameraBasePos={cameraBasePos}
        />
      </Physics>
    </Canvas>
  );
}
