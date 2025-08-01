"use client";

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import * as THREE from 'three';
import { TextureLoader } from 'three';

import {
  Edges,
  Environment,
  OrbitControls,
  Plane,
  Text,
} from '@react-three/drei';
import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
} from '@react-three/fiber';

import {
  convertInchesToMeters,
  degreesToRadians,
  PREDEFINED_LAYOUTS,
} from './_data';

// Type Definitions
type Vector3Tuple = [number, number, number];
type EulerTuple = [number, number, number];

interface Size {
  width: number;
  height: number;
}

interface NotchConfig {
  height: number;
  width: number; // This width is now specific to the notch being passed
  side: "left" | "right";
  distanceFromBottom: number;
}

interface GlassPanelProps {
  size: Size;
  position: Vector3Tuple;
  rotation?: EulerTuple;
  isDoor?: boolean;
  isOpen?: boolean;
  showEdges?: boolean;
  glassThickness: number;
  glassType: "clear" | "frosted" | "tinted";
  hingeSide?: "left" | "right";
  notchConfig?: NotchConfig | null; // This now carries global height/distance, and specific width
  panelType?: "front" | "return" | "back";
  type?: "panel" | "door";
}

interface Config {
  height: number;
  doorWidth: number;
  doorCount: number;
  panelDepth: number;
  returnDepth: number;
  leftReturn: boolean;
  rightReturn: boolean;
  showEdges: boolean;
  leftPanel: boolean;
  rightPanel: boolean;
  glassType: "clear" | "frosted" | "tinted";
  glassThickness: number;
  leftPanelHeight: number;
  rightPanelHeight: number;
  leftReturnHeight: number;
  rightReturnHeight: number;
  doorPlacement: "left" | "right";

  backPanel: boolean;
  backPanelHeight: number;
  backPanelWidth: number; // New: Manual back panel width

  notchEnabled: boolean;
  notchHeight: number;
  notchDistanceFromBottom: number;
  notchSide: "left" | "right";

  leftPanelNotchEnabled: boolean;
  leftPanelNotchWidth: number;
  rightPanelNotchEnabled: boolean;
  rightPanelNotchWidth: number;
  leftReturnNotchEnabled: boolean;
  leftReturnNotchWidth: number;
  rightReturnNotchEnabled: boolean;
  rightReturnNotchWidth: number;

  // New angle properties
  leftReturnAngle: number; // in radians
  rightReturnAngle: number; // in radians
}

interface UiState {
  isAnimating: boolean;
  showMeasurements: boolean;
  enableIndividualHeights: boolean;
}

interface MeasurementLineProps {
  start: Vector3Tuple;
  end: Vector3Tuple;
  text: string;
  type: string;
  color: string;
  fontSize: number;
  textPosition: Vector3Tuple;
  textRotation: EulerTuple;
}

interface SceneProps {
  config: Config;
  isAnimating: boolean;
  showMeasurements: boolean;
  onGlReady: (gl: THREE.WebGLRenderer) => void;
}

// Updated Color palette for a softer, more modern look
const COLORS = {
  glass: "#E8F0EE", // Light, cool grey-green for the panel background
  glassEdge: "#6A8C80", // Muted teal-green for accents and borders
  panel: "#DDEEEB", // Very light, slightly desaturated green for glass panels (non-door)
  background: "#F4F8F7", // Soft, very light grey-green for the overall background (HTML background)
  sceneBackground: "#F0F0F0", // Light grey for the 3D scene background
  text: "#3A5C50", // Darker teal-green for primary text
  handle: "#4A4A4A", // Dark grey for metallic handle
  measurement: "#B82F2F", // Slightly desaturated red for measurements
  floor: "#C0C0C0", // Slightly darker neutral grey for the floor
  wall: "#F8F8F8", // Very light neutral grey wall
  buttonHover: "#7D9D95", // Slightly darker shade for button hover
  inputFocus: "#8CBBAF", // A slightly brighter green for input focus
  doorMeasurement: "#4CAF50", // Green color for door specific measurement
  notchColor: "#6A8C80", // Changed to theme-like color (glassEdge)
};

// Conversion factor from meters to inches
const METERS_TO_INCHES: number = 39.3701;
const INCHES_TO_METERS: number = 1 / METERS_TO_INCHES;


// New MeasurementLine component to draw lines with text
const MeasurementLine = ({
  start,
  end,
  text,
  color,
  fontSize,
  textPosition,
  textRotation,
}: MeasurementLineProps) => {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>
      <Text
        position={textPosition}
        rotation={textRotation}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#ffffff"
      >
        {text}
      </Text>
    </group>
  );
};

const GlassPanel = ({
  size,
  position,
  rotation = [0, 0, 0],
  isDoor = false,
  isOpen = false,
  showEdges = true,
  glassThickness,
  glassType,
  hingeSide = "left",
  notchConfig = null,
  panelType = "front",
}: GlassPanelProps) => {
  const pivotRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const [animationState, setAnimationState] = useState<number>(0);

  useFrame(() => {
    if (!isDoor || !pivotRef.current) return;

    const currentRotation = pivotRef.current.rotation.y;
    const actualMaxOpenAngle = (Math.PI / 2) * 0.85;
    const lerpFactor = 0.05;

    const openInwardsTarget =
      hingeSide === "left" ? actualMaxOpenAngle : -actualMaxOpenAngle;
    const openOutwardsTarget =
      hingeSide === "left" ? -actualMaxOpenAngle : actualMaxOpenAngle;

    if (isOpen) {
      let targetRotation: number;

      switch (animationState) {
        case 0:
          targetRotation = openInwardsTarget;
          if (Math.abs(currentRotation - openInwardsTarget) < 0.01) {
            setAnimationState(1);
          }
          break;
        case 1:
          targetRotation = 0;
          if (Math.abs(currentRotation) < 0.01) {
            setAnimationState(2);
          }
          break;
        case 2:
          targetRotation = openOutwardsTarget;
          if (Math.abs(currentRotation - openOutwardsTarget) < 0.01) {
            setAnimationState(3);
          }
          break;
        case 3:
          targetRotation = 0;
          if (Math.abs(currentRotation) < 0.01) {
            setAnimationState(0);
          }
          break;
        default:
          targetRotation = 0;
      }

      pivotRef.current.rotation.y = THREE.MathUtils.lerp(
        currentRotation,
        targetRotation,
        lerpFactor
      );
    } else {
      pivotRef.current.rotation.y = THREE.MathUtils.lerp(
        currentRotation,
        0,
        0.1
      );
      if (Math.abs(currentRotation) < 0.01) {
        setAnimationState(0);
      }
    }
  });

  useEffect(() => {
    if (materialRef.current) {
      switch (glassType) {
        case "clear":
          materialRef.current.color.set(COLORS.panel);
          materialRef.current.transmission = 0.9;
          materialRef.current.roughness = 0.1;
          materialRef.current.opacity = 0.92;
          materialRef.current.clearcoat = 1;
          break;
        case "frosted":
          materialRef.current.color.set(COLORS.panel);
          materialRef.current.transmission = 0.5;
          materialRef.current.roughness = 0.8;
          materialRef.current.opacity = 0.95;
          materialRef.current.clearcoat = 0;
          break;
        case "tinted":
          materialRef.current.color.set("#78909c");
          materialRef.current.transmission = 0.7;
          materialRef.current.roughness = 0.2;
          materialRef.current.opacity = 0.9;
          materialRef.current.clearcoat = 0.5;
          break;
        default:
          break;
      }
      materialRef.current.needsUpdate = true;
    }
  }, [glassType]);

  const pivotPosition: Vector3Tuple =
    hingeSide === "left" ? [-size.width / 2, 0, 0] : [size.width / 2, 0, 0];
  const meshPosition: Vector3Tuple =
    hingeSide === "left" ? [size.width / 2, 0, 0] : [-size.width / 2, 0, 0];

  let notchRelativeX: number = 0;
  let notchRelativeY: number = 0;
  let isNotched: boolean = false;

  if (notchConfig) {
    isNotched = true;
    if (notchConfig.side === "left") {
      notchRelativeX = -size.width / 2 + notchConfig.width / 2;
    } else {
      notchRelativeX = size.width / 2 - notchConfig.width / 2;
    }
    notchRelativeY =
      -size.height / 2 +
      notchConfig.distanceFromBottom +
      notchConfig.height / 2;
  }

  return (
    <group position={position} rotation={rotation}>
      <group ref={pivotRef} position={pivotPosition}>
        <mesh position={meshPosition}>
          <boxGeometry args={[size.width, size.height, glassThickness]} />
          <meshPhysicalMaterial
            ref={materialRef}
            color={isDoor ? COLORS.panel : COLORS.panel}
            transmission={isDoor ? 0.9 : 0.6}
            roughness={0.1}
            thickness={glassThickness * 10}
            ior={1.5}
            clearcoat={1}
            opacity={0.92}
            envMapIntensity={0.8}
          />
          {showEdges && (
            <Edges scale={1.01} threshold={15} color={COLORS.glassEdge} />
          )}
        </mesh>

        {isDoor && (
          <>
            {/* Handle */}
            <mesh
              position={[
                hingeSide === "left" ? size.width - 0.05 : -size.width + 0.05,
                0,
                glassThickness / 2 + 0.02,
              ]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.15, 16]} />
              <meshStandardMaterial
                color={COLORS.handle}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>

            {/* Hinges */}
            {/* Top Hinge */}
            <mesh
              position={[0, size.height / 2 - 0.1, glassThickness / 2 + 0.005]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.015, 0.015, 0.05, 8]} />
              <meshStandardMaterial
                color={COLORS.handle}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            {/* Bottom Hinge */}
            <mesh
              position={[0, -size.height / 2 + 0.1, glassThickness / 2 + 0.005]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.015, 0.015, 0.05, 8]} />
              <meshStandardMaterial
                color={COLORS.handle}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </>
        )}

        {/* Notch visual cutout */}
        {isNotched && (
          <mesh
            position={[
              meshPosition[0] + notchRelativeX,
              meshPosition[1] + notchRelativeY,
              meshPosition[2],
            ]}
          >
            <boxGeometry
              args={[
                notchConfig?.width,
                notchConfig?.height,
                glassThickness * 1.1,
              ]}
            />
            <meshBasicMaterial color={COLORS.notchColor} />
          </mesh>
        )}
      </group>
    </group>
  );
};

const Scene = ({
  config,
  isAnimating,
  showMeasurements,
  onGlReady,
}: SceneProps) => {
  const { camera, gl } = useThree();
  // Load the background texture
  const backgroundTexture = useLoader(TextureLoader, '/bg-Image.jpg');

  useEffect(() => {
    const totalStructureWidth: number =
      (config.leftPanel ? config.panelDepth : 0) +
      config.doorCount * config.doorWidth +
      (config.rightPanel ? config.panelDepth : 0);

    const returnDepth: number = config.returnDepth;

    camera.position.set(
      0,
      config.height * 1.5,
      Math.max(totalStructureWidth, returnDepth) * 3.0
    );
    camera.lookAt(0, config.height / 2, 0);

    onGlReady(gl);
  }, [config, camera, gl, onGlReady]);

  const [elements, measurements] = (function () {
    const newElements: GlassPanelProps[] = [];
    const newMeasurements: MeasurementLineProps[] = [];
    const measurementOffset: number = 0.15;
    const labelFontSize: number = 0.12;

    const totalStructureWidth: number =
      (config.leftPanel ? config.panelDepth : 0) +
      config.doorCount * config.doorWidth +
      (config.rightPanel ? config.panelDepth : 0);

    const structureStartX: number = -totalStructureWidth / 2;
    const structureEndX: number = totalStructureWidth / 2;

    let doorsStartX: number, doorsEndX: number;

    if (config.doorPlacement === "left") {
      doorsStartX =
        structureStartX + (config.leftPanel ? config.panelDepth : 0);
      doorsEndX = doorsStartX + config.doorCount * config.doorWidth;
    } else {
      doorsEndX = structureEndX - (config.rightPanel ? config.panelDepth : 0);
      doorsStartX = doorsEndX - config.doorCount * config.doorWidth;
    }

    // Height Measurement for Left Panel (if exists) or first door
    if (showMeasurements && config.leftPanel) {
      const heightX: number = structureStartX - measurementOffset;
      newMeasurements.push({
        type: "line",
        text: `${(config.leftPanelHeight * METERS_TO_INCHES).toFixed(0)}`,
        start: [heightX, 0, 0],
        end: [heightX, config.leftPanelHeight, 0],
        fontSize: labelFontSize,
        color: COLORS.measurement,
        textPosition: [heightX, config.leftPanelHeight / 2, measurementOffset],
        textRotation: [0, 0, 0],
      });
    } else if (showMeasurements && config.doorCount > 0) {
      const heightX: number = doorsStartX - measurementOffset;
      newMeasurements.push({
        type: "line",
        text: `${(config.height * METERS_TO_INCHES).toFixed(0)}`,
        start: [heightX, 0, 0],
        end: [heightX, config.height, 0],
        fontSize: labelFontSize,
        color: COLORS.measurement,
        textPosition: [heightX, config.height / 2, measurementOffset],
        textRotation: [0, 0, 0],
      });
    }

    // Height Measurement for Right Panel (if exists) or last door
    if (showMeasurements && config.rightPanel) {
      const heightX: number = structureEndX + measurementOffset;
      newMeasurements.push({
        type: "line",
        text: `${(config.rightPanelHeight * METERS_TO_INCHES).toFixed(0)}`,
        start: [heightX, 0, 0],
        end: [heightX, config.rightPanelHeight, 0],
        fontSize: labelFontSize,
        color: COLORS.measurement,
        textPosition: [heightX, config.rightPanelHeight / 2, measurementOffset],
        textRotation: [0, 0, 0],
      });
    } else if (showMeasurements && config.doorCount > 0) {
      const heightX: number = doorsEndX + measurementOffset;
      newMeasurements.push({
        type: "line",
        text: `${(config.height * METERS_TO_INCHES).toFixed(0)}`,
        start: [heightX, 0, 0],
        end: [heightX, config.height, 0],
        fontSize: labelFontSize,
        color: COLORS.measurement,
        textPosition: [heightX, config.height / 2, measurementOffset],
        textRotation: [0, 0, 0],
      });
    }

    // NEW: Door(s) Width Measurement (Green Line) - Positioned highest
    if (showMeasurements && config.doorCount > 0) {
      const doorWidthY: number = config.height + measurementOffset / 2.5;
      const doorWidthZ: number = 0;

      newMeasurements.push({
        type: "line",
        text: `${(
          config.doorCount *
          config.doorWidth *
          METERS_TO_INCHES
        ).toFixed(0)}`,
        start: [doorsStartX, doorWidthY, doorWidthZ],
        end: [doorsEndX, doorWidthY, doorWidthZ],
        fontSize: labelFontSize,
        color: COLORS.doorMeasurement,
        textPosition: [
          (doorsStartX + doorsEndX) / 2,
          doorWidthY,
          measurementOffset,
        ],
        textRotation: [0, 0, 0],
      });
    }

    // Overall Width Measurement (Front Top) - Positioned lower than green line
    if (showMeasurements) {
      const widthY: number = config.height + measurementOffset * 1.5;
      newMeasurements.push({
        type: "line",
        text: `${(totalStructureWidth * METERS_TO_INCHES).toFixed(0)}`,
        start: [structureStartX, widthY, 0],
        end: [structureEndX, widthY, 0],
        fontSize: labelFontSize,
        color: COLORS.measurement,
        textPosition: [
          (structureStartX + structureEndX) / 2,
          widthY,
          measurementOffset,
        ],
        textRotation: [0, 0, 0],
      });
    }

    // Overall Width Measurement (Front Bottom)
    if (showMeasurements) {
      const widthY: number = -measurementOffset;
      newMeasurements.push({
        type: "line",
        text: `${(totalStructureWidth * METERS_TO_INCHES).toFixed(0)}`,
        start: [structureStartX, widthY, 0],
        end: [structureEndX, widthY, 0],
        fontSize: labelFontSize,
        color: COLORS.measurement,
        textPosition: [
          (structureStartX + structureEndX) / 2,
          widthY,
          measurementOffset,
        ],
        textRotation: [0, 0, 0],
      });
    }

    // Left Panel
    if (config.leftPanel) {
      newElements.push({
        type: "panel",
        size: { width: config.panelDepth, height: config.leftPanelHeight },
        position: [
          structureStartX + config.panelDepth / 2,
          config.leftPanelHeight / 2,
          0,
        ],
        rotation: [0, 0, 0],
        panelType: "front",
        notchConfig:
          config.notchEnabled && config.leftPanelNotchEnabled
            ? {
                height: config.notchHeight,
                width: config.leftPanelNotchWidth, // Use specific width
                side: config.notchSide,
                distanceFromBottom: config.notchDistanceFromBottom,
              }
            : null,
        glassThickness: config.glassThickness,
        glassType: config.glassType,
      });
    }

    // Left Return Panel
    if (config.leftReturn) {
      const pivotX = structureStartX;
      const pivotY = config.leftReturnHeight / 2;
      const pivotZ = 0; // This is the front edge of the main structure

      const halfReturnDepth = config.returnDepth / 2;
      const angle = config.leftReturnAngle; // Angle from the front plane (X-Z plane)

      // Calculate the panel's center position relative to the pivot after rotation
      // If angle = 0, panel is along +X, center is at (pivotX + halfReturnDepth, pivotY, pivotZ)
      // If angle = PI/2, panel is along -Z, center is at (pivotX, pivotY, pivotZ - halfReturnDepth)
      const rotatedOffsetX = halfReturnDepth * Math.cos(angle);
      const rotatedOffsetZ = -halfReturnDepth * Math.sin(angle);

      newElements.push({
        type: "panel",
        size: { width: config.returnDepth, height: config.leftReturnHeight },
        position: [
          pivotX  - rotatedOffsetX,
          pivotY,
          pivotZ + rotatedOffsetZ,
        ],
        rotation: [0, -angle, 0], // Negative angle for clockwise rotation from +X
        panelType: "return",
        notchConfig:
          config.notchEnabled && config.leftReturnNotchEnabled
            ? {
                height: config.notchHeight,
                width: config.leftReturnNotchWidth, // Use specific width
                side: config.notchSide,
                distanceFromBottom: config.notchDistanceFromBottom,
              }
            : null,
        glassThickness: config.glassThickness,
        glassType: config.glassType,
      });

      if (showMeasurements) {
        // Left Return Depth Measurement (Top)
        const depthY: number = config.leftReturnHeight + measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
          start: [pivotX, depthY, pivotZ],
          end: [pivotX - rotatedOffsetX * 2, depthY, pivotZ + rotatedOffsetZ * 2],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [
            pivotX - rotatedOffsetX,
            depthY + measurementOffset,
            pivotZ + rotatedOffsetZ,
          ],
          textRotation: [0, -angle, 0], // Match panel rotation
        });
        // Left Return Depth Measurement (Bottom)
        const depthYBottom: number = -measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
          start: [pivotX, depthYBottom, pivotZ],
          end: [pivotX - rotatedOffsetX * 2, depthYBottom, pivotZ + rotatedOffsetZ * 2],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [
            pivotX - rotatedOffsetX,
            depthYBottom - measurementOffset,
            pivotZ + rotatedOffsetZ,
          ],
          textRotation: [0, -angle, 0], // Match panel rotation
        });

        // Left Return Height Measurement
        const outerEdgeX = pivotX - rotatedOffsetX * 2;
        const outerEdgeZ = pivotZ + rotatedOffsetZ * 2;

        // Offset perpendicular to the panel's outer edge
        const heightMeasurementOffsetX = -measurementOffset * Math.sin(angle);
        const heightMeasurementOffsetZ = measurementOffset * Math.cos(angle);

        newMeasurements.push({
          type: "line",
          text: `${(config.leftReturnHeight * METERS_TO_INCHES).toFixed(0)}`,
          start: [outerEdgeX + heightMeasurementOffsetX, 0, outerEdgeZ + heightMeasurementOffsetZ],
          end: [outerEdgeX + heightMeasurementOffsetX, config.leftReturnHeight, outerEdgeZ + heightMeasurementOffsetZ],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [
            outerEdgeX + heightMeasurementOffsetX,
            config.leftReturnHeight / 2,
            outerEdgeZ + heightMeasurementOffsetZ + measurementOffset,
          ],
          textRotation: [0, -angle, 0], // Text should align with the panel's rotation
        });
      }
    }

    // Doors
    let currentDoorX: number = doorsStartX;
    for (let i = 0; i < config.doorCount; i++) {
      let currentHingeSide: "left" | "right";
      if (config.doorPlacement === "left") {
        currentHingeSide = i % 2 === 0 ? "left" : "right";
      } else {
        currentHingeSide = i % 2 === 0 ? "right" : "left";
      }

      newElements.push({
        type: "door",
        size: { width: config.doorWidth, height: config.height },
        position: [currentDoorX + config.doorWidth / 2, config.height / 2, 0],
        rotation: [0, 0, 0],
        isOpen: isAnimating,
        hingeSide: currentHingeSide,
        glassThickness: config.glassThickness,
        glassType: config.glassType,
      });
      currentDoorX += config.doorWidth;
    }

    // Right side panel (parallel to doors)
    if (config.rightPanel) {
      newElements.push({
        type: "panel",
        size: { width: config.panelDepth, height: config.rightPanelHeight },
        position: [
          doorsEndX + config.panelDepth / 2,
          config.rightPanelHeight / 2,
          0,
        ],
        rotation: [0, 0, 0],
        panelType: "front",
        notchConfig:
          config.notchEnabled && config.rightPanelNotchEnabled
            ? {
                height: config.notchHeight,
                width: config.rightPanelNotchWidth, // Use specific width
                side: config.notchSide,
                distanceFromBottom: config.notchDistanceFromBottom,
              }
            : null,
        glassThickness: config.glassThickness,
        glassType: config.glassType,
      });
    }

    // Right Return Panel
    if (config.rightReturn) {
      const pivotX = structureEndX;
      const pivotY = config.rightReturnHeight / 2;
      const pivotZ = 0; // This is the front edge of the main structure

      const halfReturnDepth = config.returnDepth / 2;
      const angle = config.rightReturnAngle; // Angle from the front plane (X-Z plane)

      // Calculate the panel's center position relative to the pivot after rotation
      // If angle = 0, panel is along -X, center is at (pivotX - halfReturnDepth, pivotY, pivotZ)
      // If angle = PI/2, panel is along -Z, center is at (pivotX, pivotY, pivotZ - halfReturnDepth)
      const rotatedOffsetX = halfReturnDepth * Math.cos(angle);
      const rotatedOffsetZ = -halfReturnDepth * Math.sin(angle);

      newElements.push({
        type: "panel",
        size: { width: config.returnDepth, height: config.rightReturnHeight },
        position: [
          pivotX + rotatedOffsetX,
          pivotY,
          pivotZ + rotatedOffsetZ,
        ],
        rotation: [0, angle, 0], // Positive angle for counter-clockwise rotation from -X
        panelType: "return",
        notchConfig:
          config.notchEnabled && config.rightReturnNotchEnabled
            ? {
                height: config.notchHeight,
                width: config.rightReturnNotchWidth, // Use specific width
                side: config.notchSide,
                distanceFromBottom: config.notchDistanceFromBottom,
              }
            : null,
        glassThickness: config.glassThickness,
        glassType: config.glassType,
      });

      if (showMeasurements) {
        // Right Return Depth Measurement (Top)
        const depthY: number = config.rightReturnHeight + measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
          start: [pivotX, depthY, pivotZ],
          end: [pivotX + rotatedOffsetX * 2, depthY, pivotZ + rotatedOffsetZ * 2],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [
            pivotX + rotatedOffsetX,
            depthY + measurementOffset,
            pivotZ + rotatedOffsetZ,
          ],
          textRotation: [0, angle, 0], // Match panel rotation
        });
        // Right Return Depth Measurement (Bottom)
        const depthYBottom: number = -measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
          start: [pivotX, depthYBottom, pivotZ],
          end: [pivotX + rotatedOffsetX * 2, depthYBottom, pivotZ + rotatedOffsetZ * 2],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [
            pivotX + rotatedOffsetX,
            depthYBottom - measurementOffset,
            pivotZ + rotatedOffsetZ,
          ],
          textRotation: [0, angle, 0], // Match panel rotation
        });

        // Right Return Height Measurement
        const outerEdgeX = pivotX + rotatedOffsetX * 2;
        const outerEdgeZ = pivotZ + rotatedOffsetZ * 2;

        // Offset perpendicular to the panel's outer edge
        const heightMeasurementOffsetX = measurementOffset * Math.sin(angle);
        const heightMeasurementOffsetZ = measurementOffset * Math.cos(angle);

        newMeasurements.push({
          type: "line",
          text: `${(config.rightReturnHeight * METERS_TO_INCHES).toFixed(0)}`,
          start: [outerEdgeX + heightMeasurementOffsetX, 0, outerEdgeZ + heightMeasurementOffsetZ],
          end: [outerEdgeX + heightMeasurementOffsetX, config.rightReturnHeight, outerEdgeZ + heightMeasurementOffsetZ],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [
            outerEdgeX + heightMeasurementOffsetX,
            config.rightReturnHeight / 2,
            outerEdgeZ + heightMeasurementOffsetZ + measurementOffset,
          ],
          textRotation: [0, angle, 0], // Text should align with the panel's rotation
        });
      }
    }

    // Back Panel
    if (config.backPanel) {
      newElements.push({
        type: "panel",
        size: { width: config.backPanelWidth, height: config.backPanelHeight }, // Use backPanelWidth
        position: [0, config.backPanelHeight / 2, -config.returnDepth], // Centered X, half height Y, at the back of return depth
        rotation: [0, Math.PI, 0], // Rotate 180 degrees around Y to face forward
        panelType: "back",
        glassThickness: config.glassThickness,
        glassType: config.glassType,
      });

      if (showMeasurements) {
        // Back Panel Width Measurement
        const backPanelWidthY: number =
          config.backPanelHeight + measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.backPanelWidth * METERS_TO_INCHES).toFixed(0)}`, // Use backPanelWidth
          start: [
            -config.backPanelWidth / 2, // Use backPanelWidth
            backPanelWidthY,
            -config.returnDepth,
          ],
          end: [config.backPanelWidth / 2, backPanelWidthY, -config.returnDepth], // Use backPanelWidth
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [
            0,
            backPanelWidthY,
            -config.returnDepth - measurementOffset,
          ],
          textRotation: [0, Math.PI, 0], // Rotate text to face forward
        });

        // Back Panel Height Measurement
        const backPanelHeightX: number =
          config.backPanelWidth / 2 + measurementOffset; // Use backPanelWidth
        newMeasurements.push({
          type: "line",
          text: `${(config.backPanelHeight * METERS_TO_INCHES).toFixed(0)}`,
          start: [backPanelHeightX, 0, -config.returnDepth],
          end: [backPanelHeightX, config.backPanelHeight, -config.returnDepth],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [
            backPanelHeightX,
            config.backPanelHeight / 2,
            -config.returnDepth - measurementOffset,
          ],
          textRotation: [0, Math.PI / 2, 0], // Rotate text to face side
        });
      }
    }

    return [newElements, newMeasurements];
  })();

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 10, 7]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Environment preset="city" />

      {/* Background Sphere */}
      <mesh position={[0, config.height / 2, 0]}> {/* Center the sphere around the layout height */}
        <sphereGeometry args={[200, 60, 40]} /> {/* Increased radius to 200 */}
        <meshBasicMaterial map={backgroundTexture} side={THREE.BackSide} /> {/* Render texture on inside */}
      </mesh>

      {elements.map((el, i) => (
        <GlassPanel
          key={`element-${i}`}
          size={el.size}
          position={el.position}
          rotation={el.rotation}
          isDoor={el.type === "door"}
          isOpen={el.isOpen}
          showEdges={config.showEdges}
          glassThickness={config.glassThickness}
          glassType={el.glassType}
          hingeSide={el.hingeSide}
          notchConfig={el.notchConfig}
          panelType={el.panelType}
        />
      ))}

      {showMeasurements &&
        measurements.map((m, i) => (
          <MeasurementLine
            key={`measurement-${i}`}
            start={m.start}
            end={m.end}
            text={m.text}
            type={m.type}
            fontSize={m.fontSize}
            color={m.color}
            textPosition={m.textPosition}
            textRotation={m.textRotation}
          />
        ))}

      <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial
          color={COLORS.floor}
          roughness={0.6}
          metalness={0.1}
        />
      </Plane>

      <gridHelper
        args={[10, 10, 0xcccccc, 0x888888]}
        position={[0, 0.001, 0]}
      />

      <OrbitControls
        minDistance={1}
        maxDistance={15}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </>
  );
};

// Helper function to get the width of a specific element
const getElementWidth = (
  currentConfig: Config,
  elementName: "leftPanel" | "rightPanel" | "leftReturn" | "rightReturn"
): number => {
  switch (elementName) {
    case "leftPanel":
    case "rightPanel":
      return currentConfig.panelDepth;
    case "leftReturn":
    case "rightReturn":
      return currentConfig.returnDepth;
    default:
      return convertInchesToMeters(4); // Default notch width if none selected or invalid
  }
};

// Function to convert meter value back to fractional inches for display
const getFractionalInches = (meters: number): string => {
  const inches: number = meters * METERS_TO_INCHES;
  if (Math.abs(inches - 3 / 8) < 0.001) return "3/8";
  if (Math.abs(inches - 1 / 2) < 0.001) return "1/2";
  if (Math.abs(inches - 1 / 4) < 0.001) return "1/4";
  if (Math.abs(inches - 1 / 8) < 0.001) return "1/8";
  return inches.toFixed(3);
};

export default function ShowerConfigurator() {
  const [config, setConfig] = useState<Config>(PREDEFINED_LAYOUTS["default"]);
  const [currentLayoutName, setCurrentLayoutName] = useState<string>("default");

  const [uiState, setUiState] = useState<UiState>({
    isAnimating: false,
    showMeasurements: true,
    enableIndividualHeights: false,
  });

  const [glInstance, setGlInstance] = useState<THREE.WebGLRenderer | null>(
    null
  );

  // New state to track if backPanelWidth has been manually set
  const [isBackPanelWidthManuallySet, setIsBackPanelWidthManuallySet] = useState(false);

  // Effect to synchronize backPanelWidth when backPanel is unchecked or when not manually set
  useEffect(() => {
    // Calculate the current total front structure width
    const currentTotalStructureWidth =
      (config.leftPanel ? config.panelDepth : 0) +
      config.doorCount * config.doorWidth +
      (config.rightPanel ? config.panelDepth : 0);

    // Only update backPanelWidth if it's not manually set OR if backPanel is currently unchecked (forcing synchronization)
    if (!isBackPanelWidthManuallySet || !config.backPanel) {
      if (config.backPanelWidth !== currentTotalStructureWidth) {
        setConfig(prev => ({
          ...prev,
          backPanelWidth: currentTotalStructureWidth
        }));
      }
    }
  }, [
    config.backPanel, // If backPanel checkbox changes
    config.doorWidth,
    config.doorCount,
    config.panelDepth,
    config.leftPanel,
    config.rightPanel,
    config.backPanelWidth, // To detect external changes (though this effect is the source)
    isBackPanelWidthManuallySet // To react to manual set flag changes
  ]);


  const handleConfigChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;

    setConfig((prev) => {
      let newConfig = { ...prev };

      if (type === "checkbox") {
        if (name === "enableIndividualHeights") {
          setUiState((prevUi) => ({
            ...prevUi,
            [name]: checked,
          }));
          if (!checked) {
            newConfig.leftPanelHeight = newConfig.height;
            newConfig.rightPanelHeight = newConfig.height;
            newConfig.leftReturnHeight = newConfig.height;
            newConfig.rightReturnHeight = newConfig.height;
            newConfig.backPanelHeight = newConfig.height; // Reset back panel height too
          }
        } else if (name === "notchEnabled") {
          newConfig.notchEnabled = checked;
          // When global notch is disabled, disable all individual notches
          if (!checked) {
            newConfig.leftPanelNotchEnabled = false;
            newConfig.rightPanelNotchEnabled = false;
            newConfig.leftReturnNotchEnabled = false;
            newConfig.rightReturnNotchEnabled = false;
          }
        } else if (name.endsWith("NotchEnabled")) {
          // Handle individual notch enable/disable
          const panelName = name.replace("NotchEnabled", ""); // e.g., "leftPanel"
          (newConfig as any)[name] = checked; // Update the boolean flag

          // If enabling an individual notch, set its default width
          if (checked) {
            const defaultWidth = getElementWidth(
              newConfig,
              panelName as
                | "leftPanel"
                | "rightPanel"
                | "leftReturn"
                | "rightReturn"
            );
            (newConfig as any)[`${panelName}NotchWidth`] = defaultWidth;
          }
        } else if (name === "backPanel") {
          newConfig.backPanel = checked;
          const currentTotalStructureWidth =
            (newConfig.leftPanel ? newConfig.panelDepth : 0) +
            newConfig.doorCount * newConfig.doorWidth +
            (newConfig.rightPanel ? newConfig.panelDepth : 0);

          if (checked) {
            // When back panel is enabled, initialize its width and reset manual flag
            newConfig.backPanelWidth = currentTotalStructureWidth;
            setIsBackPanelWidthManuallySet(false); // Reset to automatic when enabling
          } else {
            // When back panel is disabled, ensure it synchronizes and reset manual flag
            newConfig.backPanelWidth = currentTotalStructureWidth;
            setIsBackPanelWidthManuallySet(false);
          }
        } else {
          (newConfig as any)[name] = checked;
        }
      } else if (name === "doorCount") {
        const numValue = parseInt(value, 10);
        // Allow 0 doors
        newConfig.doorCount = Math.max(0, isNaN(numValue) ? 0 : numValue);
      } else if (name === "glassThickness") {
        let thicknessInInches: number;
        switch (value) {
          case "3/8":
            thicknessInInches = 3 / 8;
            break;
          case "1/2":
            thicknessInInches = 1 / 2;
            break;
          case "1/4":
            thicknessInInches = 1 / 4;
            break;
          case "1/8":
            thicknessInInches = 1 / 8;
            break;
          default:
            thicknessInInches = 3 / 8;
        }
        newConfig.glassThickness = convertInchesToMeters(thicknessInInches);
      } else if (name === "doorPlacement" || name === "notchSide") {
        (newConfig as any)[name] = value;
      } else if (name === "leftReturnAngle" || name === "rightReturnAngle") {
        // Convert selected degree value to radians for the model
        (newConfig as any)[name] = degreesToRadians(parseFloat(value));
      }
      else if (name === "predefinedLayout") { // Handle predefined layout selection
        const selectedLayout = PREDEFINED_LAYOUTS[value as keyof typeof PREDEFINED_LAYOUTS];
        if (selectedLayout) {
          newConfig = { ...selectedLayout }; // Load the predefined layout
          setCurrentLayoutName(value); // Update the dropdown's selected value
          // Optionally reset UI state related to individual heights if the predefined layout
          // doesn't explicitly manage them or if we want to force consistency.
          setUiState(prevUi => ({ ...prevUi, enableIndividualHeights: false }));
        }
      }
      else {
        // For all other number inputs (dimensions)
        const newValueInMeters: number = parseFloat(value) * INCHES_TO_METERS;
        (newConfig as any)[name] = newValueInMeters;

        // If it's the backPanelWidth input, set the manual override flag
        if (name === "backPanelWidth") {
          setIsBackPanelWidthManuallySet(true);
        }

        if (!uiState.enableIndividualHeights && name === "height") {
          newConfig.leftPanelHeight = newValueInMeters;
          newConfig.rightPanelHeight = newValueInMeters;
          newConfig.leftReturnHeight = newValueInMeters;
          newConfig.rightReturnHeight = newValueInMeters;
          newConfig.backPanelHeight = newValueInMeters; // Synchronize back panel height
        }
      }
      return newConfig;
    });
  };

  const handleGlassTypeChange = (type: "clear" | "frosted" | "tinted") => {
    setConfig((prev) => ({
      ...prev,
      glassType: type,
      ...(type === "frosted" && { showEdges: true }),
    }));
  };

  const toggleAnimation = () => {
    setUiState((prev) => ({ ...prev, isAnimating: !prev.isAnimating }));
  };

  const toggleMeasurements = () => {
    setUiState((prev) => ({
      ...prev,
      showMeasurements: !prev.showMeasurements,
    }));
  };

  const handleDownloadImage = () => {
    if (glInstance) {
      const canvas = glInstance.domElement;
      const imageUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "shower_layout.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("WebGLRenderer instance is not available for download.");
    }
  };

  const getFractionalInches = (meters: number): string => {
    const inches: number = meters * METERS_TO_INCHES;
    if (Math.abs(inches - 3 / 8) < 0.001) return "3/8";
    if (Math.abs(inches - 1 / 2) < 0.001) return "1/2";
    if (Math.abs(inches - 1 / 4) < 0.001) return "1/4";
    if (Math.abs(inches - 1 / 8) < 0.001) return "1/8";
    return inches.toFixed(3);
  };

  const totalWidthInches: number =
    (config.leftPanel
      ? config.panelDepth
      : 0 +
        config.doorCount * config.doorWidth +
        (config.rightPanel ? config.panelDepth : 0)) * METERS_TO_INCHES;
  const totalDepthInches: number =
    Math.max(
      config.leftReturn ? config.returnDepth : 0,
      config.rightReturn ? config.returnDepth : 0
    ) * METERS_TO_INCHES;

  // Helper to convert radians back to degrees for display
  const radiansToDegrees = (radians: number): string =>
    (radians * 180 / Math.PI).toFixed(0);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: COLORS.background,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Control Panel */}
      <div
        style={{
          width: "350px",
          padding: "30px",
          borderRight: `1px solid ${COLORS.glassEdge}`,
          backgroundColor: COLORS.glass,
          overflowY: "auto",
          boxShadow: "4px 0 15px rgba(0,0,0,0.05)",
          borderRadius: "0 12px 12px 0",
          display: "flex",
          flexDirection: "column",
          gap: "25px",
        }}
      >
        <h2
          style={{
            color: COLORS.text,
            marginBottom: "10px",
            borderBottom: `2px solid ${COLORS.glassEdge}`,
            paddingBottom: "15px",
            fontSize: "1.8rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Glass Layout Configurator
        </h2>

        {/* Predefined Layouts Dropdown */}
        <div>
          <h3 style={{ color: COLORS.text, marginBottom: "12px", fontSize: "1.1rem" }}>
            Predefined Layouts
          </h3>
          <select
            name="predefinedLayout"
            onChange={handleConfigChange}
            value={currentLayoutName}
            style={{
              width: "100%",
              padding: "10px",
              border: `1px solid ${COLORS.glassEdge}`,
              borderRadius: "6px",
              backgroundColor: "#fff",
              color: COLORS.text,
              fontSize: "1rem",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${COLORS.text.substring(1)}'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3Csvg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "18px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              cursor: "pointer",
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onFocus={(e: React.FocusEvent<HTMLSelectElement>) => {
              e.currentTarget.style.borderColor = COLORS.inputFocus;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
            }}
            onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
              e.currentTarget.style.borderColor = COLORS.glassEdge;
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
            }}
          >
            {Object.keys(PREDEFINED_LAYOUTS).map((key) => (
              <option key={key} value={key}>
                {key.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
              </option>
            ))}
          </select>
        </div>


        {/* Glass Type Selector */}
        <div>
          <h3
            style={{
              color: COLORS.text,
              marginBottom: "12px",
              fontSize: "1.1rem",
            }}
          >
            Glass Type
          </h3>
          <div style={{ display: "flex", gap: "12px" }}>
            {(
              ["clear", "frosted", "tinted"] as Array<
                "clear" | "frosted" | "tinted"
              >
            ).map((type) => (
              <button
                key={type}
                onClick={() => handleGlassTypeChange(type)}
                style={{
                  flex: 1,
                  padding: "10px 15px",
                  backgroundColor:
                    config.glassType === type ? COLORS.glassEdge : "#fff",
                  color: config.glassType === type ? "#fff" : COLORS.text,
                  border: `1px solid ${COLORS.glassEdge}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
                onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) =>
                  (e.currentTarget.style.backgroundColor =
                    config.glassType === type
                      ? COLORS.glassEdge
                      : COLORS.buttonHover)
                }
                onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) =>
                  (e.currentTarget.style.backgroundColor =
                    config.glassType === type ? COLORS.glassEdge : "#fff")
                }
                onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
                  (e.currentTarget.style.transform = "translateY(1px)")
                }
                onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Glass Thickness Selector */}
        <div>
          <h3
            style={{
              color: COLORS.text,
              marginBottom: "12px",
              fontSize: "1.1rem",
            }}
          >
            Glass Thickness
          </h3>
          <select
            name="glassThickness"
            value={getFractionalInches(config.glassThickness)}
            onChange={handleConfigChange}
            style={{
              width: "100%",
              padding: "10px",
              border: `1px solid ${COLORS.glassEdge}`,
              borderRadius: "6px",
              backgroundColor: "#fff",
              color: COLORS.text,
              fontSize: "1rem",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${COLORS.text.substring(
                1
              )}'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3Csvg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "18px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              cursor: "pointer",
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onFocus={(e: React.FocusEvent<HTMLSelectElement>) => {
              e.currentTarget.style.borderColor = COLORS.inputFocus;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
            }}
            onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
              e.currentTarget.style.borderColor = COLORS.glassEdge;
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
            }}
          >
            {["3/8", "1/2", "1/4", "1/8"].map((thickness: string) => (
              <option key={thickness} value={thickness}>
                {thickness} inches
              </option>
            ))}
          </select>
        </div>

        {/* Configuration Controls */}
        {[
          {
            label: "Height (Doors)",
            name: "height",
            step: 0.5,
            unit: "inches",
          },
          { label: "Door Width", name: "doorWidth", step: 0.5, unit: "inches" },
          {
            label: "Panel Depth",
            name: "panelDepth",
            step: 0.5,
            unit: "inches",
          },
          {
            label: "Return Depth",
            name: "returnDepth",
            step: 0.5,
            unit: "inches",
          },
        ].map((input) => (
          <div key={input.name}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: COLORS.text,
                fontWeight: "600",
                fontSize: "1.1rem",
              }}
            >
              {input.label} (
              <span style={{ color: COLORS.text }}>{input.unit}</span>):
            </label>
            <input
              type="number"
              name={input.name}
              step={input.step}
              value={(
                (config[input.name as keyof Config] as number) *
                METERS_TO_INCHES
              ).toFixed(2)}
              onChange={handleConfigChange}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${COLORS.glassEdge}`,
                borderRadius: "6px",
                backgroundColor: "#fff",
                color: COLORS.text,
                fontSize: "1rem",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.currentTarget.style.borderColor = COLORS.inputFocus;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                e.currentTarget.style.borderColor = COLORS.glassEdge;
                e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
              }}
            />
          </div>
        ))}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: COLORS.text,
              fontWeight: "600",
              fontSize: "1.1rem",
            }}
          >
            Number of Doors:
          </label>
          <input
            type="number"
            name="doorCount"
            step="1"
            min="0"
            value={config.doorCount}
            onChange={handleConfigChange}
            style={{
              width: "100%",
              padding: "10px",
              border: `1px solid ${COLORS.glassEdge}`,
              borderRadius: "6px",
              backgroundColor: "#fff",
              color: COLORS.text,
              fontSize: "1rem",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.currentTarget.style.borderColor = COLORS.inputFocus;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              e.currentTarget.style.borderColor = COLORS.glassEdge;
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
            }}
          />
        </div>

        {/* Door Placement Radio Buttons */}
        <div>
          <h3
            style={{
              color: COLORS.text,
              marginBottom: "12px",
              fontSize: "1.1rem",
            }}
          >
            Door Placement
          </h3>
          <div style={{ display: "flex", gap: "15px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                color: COLORS.text,
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="doorPlacement"
                value="left"
                checked={config.doorPlacement === "left"}
                onChange={handleConfigChange}
                style={{
                  marginRight: "8px",
                  accentColor: COLORS.glassEdge,
                  cursor: "pointer",
                }}
              />
              Left (Alternating)
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                color: COLORS.text,
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="doorPlacement"
                value="right"
                checked={config.doorPlacement === "right"}
                onChange={handleConfigChange}
                style={{
                  marginRight: "8px",
                  accentColor: COLORS.glassEdge,
                  cursor: "pointer",
                }}
              />
              Right (Alternating)
            </label>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          {[
            { name: "leftReturn", label: "Left Return" },
            { name: "rightReturn", label: "Right Return" },
            {
              name: "backPanel",
              label: "Back Panel",
            } /* Added back panel checkbox */,
            { name: "showEdges", label: "Show Edges" },
            { name: "leftPanel", label: "Left Panel" },
            { name: "rightPanel", label: "Right Panel" },
          ].map((checkbox) => (
            <label
              key={checkbox.name}
              style={{
                display: "flex",
                alignItems: "center",
                color: COLORS.text,
                fontWeight: "500",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name={checkbox.name}
                checked={config[checkbox.name as keyof Config] as boolean}
                onChange={handleConfigChange}
                style={{
                  marginRight: "10px",
                  accentColor: COLORS.glassEdge,
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                }}
              />
              {checkbox.label}
            </label>
          ))}
        </div>

        {/* New Angle Controls for Return Panels */}
        {config.leftReturn && (
          <div style={{ marginTop: "25px" }}>
            <h3 style={{ color: COLORS.text, marginBottom: "12px", fontSize: "1.1rem" }}>
              Left Return Angle:
            </h3>
            <select
              name="leftReturnAngle"
              value={radiansToDegrees(config.leftReturnAngle)}
              onChange={handleConfigChange}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${COLORS.glassEdge}`,
                borderRadius: "6px",
                backgroundColor: "#fff",
                color: COLORS.text,
                fontSize: "1rem",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${COLORS.text.substring(1)}'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3Csvg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                backgroundSize: "18px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onFocus={(e: React.FocusEvent<HTMLSelectElement>) => {
              e.currentTarget.style.borderColor = COLORS.inputFocus;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
            }}
            onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
              e.currentTarget.style.borderColor = COLORS.glassEdge;
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
            }}
          >
              <option value="90">90 Degrees</option>
              <option value="60">60 Degrees</option>
              <option value="40">40 Degrees</option>
              <option value="30">30 Degrees</option>
            </select>
          </div>
        )}

        {config.rightReturn && (
          <div style={{ marginTop: "25px" }}>
            <h3 style={{ color: COLORS.text, marginBottom: "12px", fontSize: "1.1rem" }}>
              Right Return Angle:
            </h3>
            <select
              name="rightReturnAngle"
              value={radiansToDegrees(config.rightReturnAngle)}
              onChange={handleConfigChange}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${COLORS.glassEdge}`,
                borderRadius: "6px",
                backgroundColor: "#fff",
                color: COLORS.text,
                fontSize: "1rem",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${COLORS.text.substring(1)}'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3Csvg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                backgroundSize: "18px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onFocus={(e: React.FocusEvent<HTMLSelectElement>) => {
              e.currentTarget.style.borderColor = COLORS.inputFocus;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
            }}
            onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
              e.currentTarget.style.borderColor = COLORS.glassEdge;
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
            }}
          >
                <option value="90">90 Degrees</option>
              <option value="60">60 Degrees</option>
              <option value="40">40 Degrees</option>
              <option value="30">30 Degrees</option>
            </select>
          </div>
        )}


        {/* New checkbox for individual height control */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            color: COLORS.text,
            fontWeight: "600",
            fontSize: "1.1rem",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          <input
            type="checkbox"
            name="enableIndividualHeights"
            checked={uiState.enableIndividualHeights}
            onChange={handleConfigChange}
            style={{
              marginRight: "10px",
              accentColor: COLORS.glassEdge,
              width: "18px",
              height: "18px",
              cursor: "pointer",
            }}
          />
          Enable Individual Heights
        </label>

        {/* Individual Height Controls - Conditionally enabled */}
        {[
          {
            label: "Left Panel Height",
            name: "leftPanelHeight",
            step: 0.5,
            unit: "inches",
          },
          {
            label: "Right Panel Height",
            name: "rightPanelHeight",
            step: 0.5,
            unit: "inches",
          },
          {
            label: "Left Return Height",
            name: "leftReturnHeight",
            step: 0.5,
            unit: "inches",
          },
          {
            label: "Right Return Height",
            name: "rightReturnHeight",
            step: 0.5,
            unit: "inches",
          },
          {
            label: "Back Panel Height",
            name: "backPanelHeight",
            step: 0.5,
            unit: "inches",
            enabledBy: config.backPanel,
          }, // Added back panel height
        ].map((input) => (
          <div key={input.name}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: COLORS.text,
                fontWeight: "600",
                fontSize: "1.1rem",
                opacity:
                  uiState.enableIndividualHeights &&
                  (input.enabledBy === undefined || input.enabledBy)
                    ? 1
                    : 0.5,
              }}
            >
              {input.label} (
              <span style={{ color: COLORS.text }}>{input.unit}</span>):
            </label>
            <input
              type="number"
              name={input.name}
              step={input.step}
              value={(
                (config[input.name as keyof Config] as number) *
                METERS_TO_INCHES
              ).toFixed(2)}
              onChange={handleConfigChange}
              disabled={
                !uiState.enableIndividualHeights ||
                (input.enabledBy !== undefined && !input.enabledBy)
              }
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${COLORS.glassEdge}`,
                borderRadius: "6px",
                backgroundColor: "#fff",
                color: COLORS.text,
                fontSize: "1rem",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                transition:
                  "border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
                opacity:
                  uiState.enableIndividualHeights &&
                  (input.enabledBy === undefined || input.enabledBy)
                    ? 1
                    : 0.5,
                cursor:
                  uiState.enableIndividualHeights &&
                  (input.enabledBy === undefined || input.enabledBy)
                    ? "text"
                    : "not-allowed",
              }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  uiState.enableIndividualHeights &&
                  (input.enabledBy === undefined || input.enabledBy)
                ) {
                  e.currentTarget.style.borderColor = COLORS.inputFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
                }
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                if (uiState.enableIndividualHeights) {
                  e.currentTarget.style.borderColor = COLORS.glassEdge;
                  e.currentTarget.style.boxShadow =
                    "0 2px 5px rgba(0,0,0,0.05)";
                }
              }}
            />
          </div>
        ))}

        {/* New Back Panel Width Control */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: COLORS.text,
              fontWeight: "600",
              fontSize: "1.1rem",
              opacity: config.backPanel ? 1 : 0.5, // Dim label if disabled
            }}
          >
            Back Panel Width (inches):
          </label>
          <input
            type="number"
            name="backPanelWidth"
            step={0.5}
            value={(config.backPanelWidth * METERS_TO_INCHES).toFixed(2)}
            onChange={handleConfigChange}
            disabled={!config.backPanel} // Only enabled if backPanel is checked
            style={{
              width: "100%",
              padding: "10px",
              border: `1px solid ${COLORS.glassEdge}`,
              borderRadius: "6px",
              backgroundColor: "#fff",
              color: COLORS.text,
              fontSize: "1rem",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              transition: "border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
              opacity: config.backPanel ? 1 : 0.5,
              cursor: config.backPanel ? "text" : "not-allowed",
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              if (config.backPanel) {
                e.currentTarget.style.borderColor = COLORS.inputFocus;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
              }
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              if (config.backPanel) {
                e.currentTarget.style.borderColor = COLORS.glassEdge;
                e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
              }
            }}
          />
        </div>

        {/* Notch Configuration Controls */}
        <div
          style={{
            borderTop: `1px solid ${COLORS.glassEdge}`,
            paddingTop: "25px",
            marginTop: "25px",
          }}
        >
          <h3
            style={{
              color: COLORS.text,
              marginBottom: "12px",
              fontSize: "1.1rem",
            }}
          >
            Notch Configuration
          </h3>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              color: COLORS.text,
              fontWeight: "600",
              fontSize: "1.1rem",
              cursor: "pointer",
              marginBottom: "15px",
            }}
          >
            <input
              type="checkbox"
              name="notchEnabled"
              checked={config.notchEnabled}
              onChange={handleConfigChange}
              style={{
                marginRight: "10px",
                accentColor: COLORS.glassEdge,
                width: "18px",
                height: "18px",
                cursor: "pointer",
              }}
            />
            Enable Notch Feature
          </label>

          {/* Global Notch Height and Distance from Bottom */}
          {[
            {
              label: "Notch Height",
              name: "notchHeight",
              step: 0.5,
              unit: "inches",
            },
            {
              label: "Distance from Bottom",
              name: "notchDistanceFromBottom",
              step: 0.5,
              unit: "inches",
            },
          ].map((input) => (
            <div key={input.name} style={{ marginTop: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: COLORS.text,
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  opacity: config.notchEnabled ? 1 : 0.5,
                }}
              >
                {input.label} (
                <span style={{ color: COLORS.text }}>{input.unit}</span>):
              </label>
              <input
                type="number"
                name={input.name}
                step={input.step}
                value={(
                  (config[input.name as keyof Config] as number) *
                  METERS_TO_INCHES
                ).toFixed(2)}
                onChange={handleConfigChange}
                disabled={!config.notchEnabled}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: `1px solid ${COLORS.glassEdge}`,
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  color: COLORS.text,
                  fontSize: "1rem",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  transition:
                    "border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
                  opacity: config.notchEnabled ? 1 : 0.5,
                  cursor: config.notchEnabled ? "text" : "not-allowed",
                }}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  if (config.notchEnabled) {
                    e.currentTarget.style.borderColor = COLORS.inputFocus;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
                  }
                }}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  if (config.notchEnabled) {
                    e.currentTarget.style.borderColor = COLORS.glassEdge;
                    e.currentTarget.style.boxShadow =
                      "0 2px 5px rgba(0,0,0,0.05)";
                  }
                }}
              />
            </div>
          ))}

          {/* Notch Side Radio Buttons (Global for now) */}
          <div style={{ marginTop: "15px" }}>
            <h3
              style={{
                color: COLORS.text,
                marginBottom: "12px",
                fontSize: "1.1rem",
                opacity: config.notchEnabled ? 1 : 0.5,
              }}
            >
              Notch Side (Global):
            </h3>
            <div style={{ display: "flex", gap: "15px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: COLORS.text,
                  fontWeight: "500",
                  cursor: config.notchEnabled ? "pointer" : "not-allowed",
                  opacity: config.notchEnabled ? 1 : 0.5,
                }}
              >
                <input
                  type="radio"
                  name="notchSide"
                  value="left"
                  checked={config.notchSide === "left"}
                  onChange={handleConfigChange}
                  disabled={!config.notchEnabled}
                  style={{
                    marginRight: "8px",
                    accentColor: COLORS.glassEdge,
                    cursor: config.notchEnabled ? "pointer" : "not-allowed",
                  }}
                />
                Left
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: COLORS.text,
                  fontWeight: "500",
                  cursor: config.notchEnabled ? "pointer" : "not-allowed",
                  opacity: config.notchEnabled ? 1 : 0.5,
                }}
              >
                <input
                  type="radio"
                  name="notchSide"
                  value="right"
                  checked={config.notchSide === "right"}
                  onChange={handleConfigChange}
                  disabled={!config.notchEnabled}
                  style={{
                    marginRight: "8px",
                    accentColor: COLORS.glassEdge,
                    cursor: config.notchEnabled ? "pointer" : "not-allowed",
                  }}
                />
                Right
              </label>
            </div>
          </div>

          {/* Individual Notch Controls */}
          <div
            style={{
              borderTop: `1px dashed ${COLORS.glassEdge}`,
              paddingTop: "20px",
              marginTop: "20px",
              opacity: config.notchEnabled ? 1 : 0.5,
              pointerEvents: config.notchEnabled ? "auto" : "none",
            }}
          >
            <h3
              style={{
                color: COLORS.text,
                marginBottom: "15px",
                fontSize: "1.1rem",
                fontWeight: "600",
              }}
            >
              Individual Panel Notches
            </h3>
            {[
              {
                label: "Left Panel Notch",
                nameEnabled: "leftPanelNotchEnabled",
                nameWidth: "leftPanelNotchWidth",
                panelExists: config.leftPanel,
              },
              {
                label: "Right Panel Notch",
                nameEnabled: "rightPanelNotchEnabled",
                nameWidth: "rightPanelNotchWidth",
                panelExists: config.rightPanel,
              },
              {
                label: "Left Return Notch",
                nameEnabled: "leftReturnNotchEnabled",
                nameWidth: "leftReturnNotchWidth",
                isReturn: true, // Added for conditional rendering
                panelExists: config.leftReturn,
              },
              {
                label: "Right Return Notch",
                nameEnabled: "rightReturnNotchEnabled",
                nameWidth: "rightReturnNotchWidth",
                isReturn: true, // Added for conditional rendering
                panelExists: config.rightReturn,
              },
            ].map(
              (notchControl) =>
                notchControl.panelExists && ( // Only show if the panel itself exists
                  <div
                    key={notchControl.nameEnabled}
                    style={{ marginBottom: "15px" }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: COLORS.text,
                        fontWeight: "500",
                        fontSize: "1rem",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        name={notchControl.nameEnabled}
                        checked={
                          config[
                            notchControl.nameEnabled as keyof Config
                          ] as boolean
                        }
                        onChange={handleConfigChange}
                        disabled={!config.notchEnabled}
                        style={{
                          marginRight: "10px",
                          accentColor: COLORS.glassEdge,
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                      {notchControl.label}
                    </label>
                    {(config[
                      notchControl.nameEnabled as keyof Config
                    ] as boolean) && (
                      <div style={{ marginTop: "10px", marginLeft: "28px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            color: COLORS.text,
                            fontWeight: "500",
                            fontSize: "0.95rem",
                          }}
                        >
                          Notch Width (
                          {notchControl.label.replace(" Notch", "")}) (inches):
                        </label>
                        <input
                          type="number"
                          name={notchControl.nameWidth}
                          step={0.5}
                          value={(
                            (config[
                              notchControl.nameWidth as keyof Config
                            ] as number) * METERS_TO_INCHES
                          ).toFixed(2)}
                          onChange={handleConfigChange}
                          disabled={
                            !config.notchEnabled ||
                            !(config[
                              notchControl.nameEnabled as keyof Config
                            ] as boolean)
                          }
                          style={{
                            width: "calc(100% - 28px)", // Adjust width for left margin
                            padding: "8px",
                            border: `1px solid ${COLORS.glassEdge}`,
                            borderRadius: "4px",
                            backgroundColor: "#fff",
                            color: COLORS.text,
                            fontSize: "0.9rem",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            transition:
                              "border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
                            opacity: (config[
                              notchControl.nameEnabled as keyof Config
                            ] as boolean)
                              ? 1
                              : 0.5,
                            cursor: (config[
                              notchControl.nameEnabled as keyof Config
                            ] as boolean)
                              ? "text"
                              : "not-allowed",
                          }}
                          onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                            if (
                              config.notchEnabled &&
                              (config[
                                notchControl.nameEnabled as keyof Config
                              ] as boolean)
                            ) {
                              e.currentTarget.style.borderColor =
                                COLORS.inputFocus;
                              e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
                            }
                          }}
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            if (config.notchEnabled) {
                              e.currentTarget.style.borderColor =
                                COLORS.glassEdge;
                              e.currentTarget.style.boxShadow =
                                "0 1px 3px rgba(0,0,0,0.05)";
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button
            onClick={toggleAnimation}
            style={{
              flex: 1,
              padding: "12px 15px",
              backgroundColor: uiState.isAnimating
                ? COLORS.text
                : COLORS.glassEdge,
              color: "#fff",
              border: "none",
              borderRadius: "66px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background-color 0.3s ease, transform 0.1s ease-out",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) =>
              (e.currentTarget.style.backgroundColor = uiState.isAnimating
                ? COLORS.text
                : COLORS.buttonHover)
            }
            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) =>
              (e.currentTarget.style.backgroundColor = uiState.isAnimating
                ? COLORS.text
                : COLORS.glassEdge)
            }
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
              (e.currentTarget.style.transform = "translateY(1px)")
            }
            onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            {uiState.isAnimating ? (
              <>
                <span>◼</span> Stop Animation
              </>
            ) : (
              <>
                <span>▶</span> Animate Doors
              </>
            )}
          </button>
          <button
            onClick={toggleMeasurements}
            style={{
              flex: 1,
              padding: "12px 15px",
              backgroundColor: uiState.showMeasurements
                ? COLORS.text
                : COLORS.glassEdge,
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.3s ease, transform 0.1s ease-out",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) =>
              (e.currentTarget.style.backgroundColor = uiState.showMeasurements
                ? COLORS.text
                : COLORS.buttonHover)
            }
            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) =>
              (e.currentTarget.style.backgroundColor = uiState.showMeasurements
                ? COLORS.text
                : COLORS.glassEdge)
            }
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
              (e.currentTarget.style.transform = "translateY(1px)")
            }
            onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            {uiState.showMeasurements ? "Hide Measures" : "Show Measures"}
          </button>
        </div>

       
      </div>

      {/* 3D Viewer */}
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [0, 2, 5], fov: 60 }}
        >
          <Scene
            config={config}
            isAnimating={uiState.isAnimating}
            showMeasurements={uiState.showMeasurements}
            onGlReady={setGlInstance}
          />
        </Canvas>
        <button
          onClick={handleDownloadImage}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "12px 15px",
            backgroundColor: COLORS.text,
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s ease, transform 0.1s ease-out",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            zIndex: 10,
          }}
          onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) =>
            (e.currentTarget.style.backgroundColor = COLORS.buttonHover)
          }
          onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) =>
            (e.currentTarget.style.backgroundColor = COLORS.text)
          }
          onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
            (e.currentTarget.style.transform = "translateY(1px)")
          }
          onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          Download Image
        </button>
         {/* Current Configuration Summary */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "20px",
            padding: "14px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: `1px solid ${COLORS.glassEdge}`,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              color: COLORS.text,
              fontSize: "1.2rem",
              fontWeight: "600",
            }}
          >
            Current Configuration
          </h3>
          <div style={{ color: COLORS.text, lineHeight: "1.6" }}>
            <p>
              <span style={{ fontWeight: "bold" }}>Height (Doors):</span>{" "}
              {config.height.toFixed(2)}m (
              {(config.height * METERS_TO_INCHES).toFixed(2)} inches)
            </p>
            {config.leftPanel && (
              <p>
                <span style={{ fontWeight: "bold" }}>Left Panel Height:</span>{" "}
                {(config.leftPanelHeight * METERS_TO_INCHES).toFixed(2)} inches
              </p>
            )}
            {config.rightPanel && (
              <p>
                <span style={{ fontWeight: "bold" }}>Right Panel Height:</span>{" "}
                {(config.rightPanelHeight * METERS_TO_INCHES).toFixed(2)} inches
              </p>
            )}
            {config.leftReturn && (
              <p>
                <span style={{ fontWeight: "bold" }}>Left Return Height:</span>{" "}
                {(config.leftReturnHeight * METERS_TO_INCHES).toFixed(2)} inches
              </p>
            )}
            {config.rightReturn && (
              <p>
                <span style={{ fontWeight: "bold" }}>Right Return Height:</span>{" "}
                {(config.rightReturnHeight * METERS_TO_INCHES).toFixed(2)}{" "}
                inches
              </p>
            )}
            {config.backPanel && (
              <p>
                <span style={{ fontWeight: "bold" }}>Back Panel Height:</span>{" "}
                {(config.backPanelHeight * METERS_TO_INCHES).toFixed(2)} inches
              </p>
            )}
            <p>
              <span style={{ fontWeight: "bold" }}>Width:</span>{" "}
              {(config.doorCount * config.doorWidth).toFixed(2)}m (
              {totalWidthInches.toFixed(2)} inches)
            </p>
            <p>
              <span style={{ fontWeight: "bold" }}>Depth:</span>{" "}
              {Math.max(
                config.leftReturn ? config.returnDepth : 0,
                config.rightReturn ? config.returnDepth : 0
              ).toFixed(2)}
              m ({totalDepthInches.toFixed(2)} inches)
            </p>
            <p>
              <span style={{ fontWeight: "bold" }}>Glass Type:</span>{" "}
              {config.glassType.charAt(0).toUpperCase() +
                config.glassType.slice(1)}
            </p>
            <p>
              <span style={{ fontWeight: "bold" }}>Glass Thickness:</span>{" "}
              {getFractionalInches(config.glassThickness)} inches
            </p>
            <p>
              <span style={{ fontWeight: "bold" }}>Door Placement:</span>{" "}
              {config.doorPlacement.charAt(0).toUpperCase() +
                config.doorPlacement.slice(1)}
            </p>
            {config.leftReturn && (
              <p>
                <span style={{ fontWeight: "bold" }}>Left Return Angle:</span>{" "}
                {radiansToDegrees(config.leftReturnAngle)} Degrees
              </p>
            )}
            {config.rightReturn && (
              <p>
                <span style={{ fontWeight: "bold" }}>Right Return Angle:</span>{" "}
                {radiansToDegrees(config.rightReturnAngle)} Degrees
              </p>
            )}
            {config.backPanel && (
              <p>
                <span style={{ fontWeight: "bold" }}>Back Panel Width:</span>{" "}
                {(config.backPanelWidth * METERS_TO_INCHES).toFixed(2)} inches
              </p>
            )}
            {config.notchEnabled && (
              <>
                <p>
                  <span style={{ fontWeight: "bold" }}>Notch Height:</span>{" "}
                  {(config.notchHeight * METERS_TO_INCHES).toFixed(2)} inches
                </p>
                <p>
                  <span style={{ fontWeight: "bold" }}>
                    Notch Distance from Bottom:
                  </span>{" "}
                  {(config.notchDistanceFromBottom * METERS_TO_INCHES).toFixed(
                    2
                  )}{" "}
                  inches
                </p>
                <p>
                  <span style={{ fontWeight: "bold" }}>
                    Notch Side (Global):
                  </span>{" "}
                  {config.notchSide.charAt(0).toUpperCase() +
                    config.notchSide.slice(1)}
                </p>
                {config.leftPanelNotchEnabled && config.leftPanel && (
                  <p>
                    <span style={{ fontWeight: "bold" }}>
                      Left Panel Notch Width:
                    </span>{" "}
                    {(config.leftPanelNotchWidth * METERS_TO_INCHES).toFixed(2)}{" "}
                    inches
                  </p>
                )}
                {config.rightPanelNotchEnabled && config.rightPanel && (
                  <p>
                    <span style={{ fontWeight: "bold" }}>
                      Right Panel Notch Width:
                    </span>{" "}
                    {(config.rightPanelNotchWidth * METERS_TO_INCHES).toFixed(
                      2
                    )}{" "}
                    inches
                  </p>
                )}
                {config.leftReturnNotchEnabled && config.leftReturn && (
                  <p>
                    <span style={{ fontWeight: "bold" }}>
                      Left Return Notch Width:
                    </span>{" "}
                    {(config.leftReturnNotchWidth * METERS_TO_INCHES).toFixed(
                      2
                    )}{" "}
                    inches
                  </p>
                )}
                {config.rightReturnNotchEnabled && config.rightReturn && (
                  <p>
                    <span style={{ fontWeight: "bold" }}>
                      Right Return Notch Width:
                    </span>{" "}
                    {(config.rightReturnNotchWidth * METERS_TO_INCHES).toFixed(
                      2
                    )}{" "}
                    inches
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "12px 18px",
            borderRadius: "6px",
            border: `1px solid ${COLORS.glassEdge}`,
            color: COLORS.text,
            fontSize: "15px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <strong>Controls:</strong> Right-click + drag to rotate | Scroll to
          zoom | Left-click + drag to pan
        </div>
      </div>
    </div>
  );
}
