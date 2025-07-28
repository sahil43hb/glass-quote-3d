// "use client";

// import {
//   useEffect,
//   useRef,
//   useState,
// } from 'react';

// import * as THREE from 'three';

// import {
//   Edges,
//   Environment,
//   OrbitControls,
//   Text,
// } from '@react-three/drei';
// import {
//   Canvas,
//   useFrame,
//   useThree,
// } from '@react-three/fiber';

// // Updated Color palette for a softer, more modern look
// const COLORS = {
//   glass: "#E8F0EE", // Light, cool grey-green for the panel background
//   glassEdge: "#6A8C80", // Muted teal-green for accents and borders
//   panel: "#DDEEEB", // Very light, slightly desaturated green for glass panels (non-door)
//   background: "#F4F8F7", // Soft, very light grey-green for the overall background
//   text: "#3A5C50", // Darker teal-green for primary text
//   handle: "#4A4A4A", // Dark grey for metallic handle
//   measurement: "#B82F2F", // Slightly desaturated red for measurements
//   floor: "#EFEFEF", // Light neutral grey floor
//   wall: "#F8F8F8", // Very light neutral grey wall
//   buttonHover: "#7D9D95", // Slightly darker shade for button hover
//   inputFocus: "#8CBBAF", // A slightly brighter green for input focus
//   doorMeasurement: "#4CAF50", // Green color for door specific measurement
// };

// // Conversion factor from meters to inches
// const METERS_TO_INCHES = 39.3701;
// const INCHES_TO_METERS = 1 / METERS_TO_INCHES;

// // Helper function to convert fractional inches to meters
// const convertInchesToMeters = (inches) => inches * INCHES_TO_METERS;

// // New MeasurementLine component to draw lines with text
// const MeasurementLine = ({ start, end, text, color, fontSize, textPosition, textRotation }) => {
//   const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
//   const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

//   return (
//     <group>
//       <lineSegments geometry={lineGeometry}>
//         <lineBasicMaterial color={color} linewidth={2} />
//       </lineSegments>
//       <Text
//         position={textPosition}
//         rotation={textRotation}
//         fontSize={fontSize}
//         color={color}
//         anchorX="center"
//         anchorY="middle"
//         outlineWidth={0.005}
//         outlineColor="#ffffff"
//         background
//         backgroundOpacity={0.7}
//         backgroundColor="#ffffff"
//         padding={0.03}
//         borderRadius={0.01}
//         billboard={false} // Crucial: Text orientation is fixed in world space
//       >
//         {text}
//       </Text>
//     </group>
//   );
// };


// const GlassPanel = ({
//   size,
//   position,
//   rotation = [0, 0, 0],
//   isDoor = false,
//   isOpen = false, // This prop now indicates if animation should be active (continuous)
//   showEdges = true,
//   glassThickness, // New prop for thickness
//   glassType, // New prop for glass type
// }) => {
//   const pivotRef = useRef();
//   const materialRef = useRef();

//   // Local state to manage continuous animation direction for doors
//   // 0: moving from closed to inwards open
//   // 1: moving from inwards open to closed
//   // 2: moving from closed to outwards open
//   // 3: moving from outwards open to closed
//   const [animationState, setAnimationState] = useState(0);

//   useFrame(() => {
//     if (!isDoor || !pivotRef.current) return;

//     const currentRotation = pivotRef.current.rotation.y;
//     const maxOpenAngle = (Math.PI / 2) * 0.85; // Max open angle for the door
//     const lerpFactor = 0.05; // Consistent lerp factor for smooth animation

//     if (isOpen) { // If the parent signals to animate (continuous)
//       let targetRotation;

//       switch (animationState) {
//         case 0: // Opening inwards (0 to maxOpenAngle)
//           targetRotation = maxOpenAngle;
//           if (currentRotation >= maxOpenAngle * 0.99) {
//             setAnimationState(1); // Next: Close inwards
//           }
//           break;
//         case 1: // Closing inwards (maxOpenAngle to 0)
//           targetRotation = 0;
//           if (currentRotation <= 0.01) {
//             setAnimationState(2); // Next: Open outwards
//           }
//           break;
//         case 2: // Opening outwards (0 to -maxOpenAngle)
//           targetRotation = -maxOpenAngle;
//           if (currentRotation <= -maxOpenAngle * 0.99) {
//             setAnimationState(3); // Next: Close outwards
//           }
//           break;
//         case 3: // Closing outwards (-maxOpenAngle to 0)
//           targetRotation = 0;
//           if (currentRotation >= -0.01) { // Check if it's almost back to 0 from negative side
//             setAnimationState(0); // Next: Open inwards (cycle repeats)
//           }
//           break;
//         default:
//           targetRotation = 0; // Should not happen
//       }

//       pivotRef.current.rotation.y = THREE.MathUtils.lerp(
//         currentRotation,
//         targetRotation,
//         lerpFactor
//       );
//     } else { // If the parent signals to stop animation
//       // Smoothly close the door, regardless of current state
//       pivotRef.current.rotation.y = THREE.MathUtils.lerp(
//         currentRotation,
//         0,
//         0.1 // Faster lerp to close when stopping
//       );
//       // Reset animation state once closed
//       if (Math.abs(currentRotation) < 0.01) {
//           setAnimationState(0); // Ensure it's ready to start from inwards open next time
//       }
//     }
//   });

//   // Update material properties based on glassType
//   useEffect(() => {
//     if (materialRef.current) {
//       switch (glassType) {
//         case "clear":
//           materialRef.current.color.set(COLORS.panel);
//           materialRef.current.transmission = 0.9;
//           materialRef.current.roughness = 0.1;
//           materialRef.current.opacity = 0.92;
//           materialRef.current.clearcoat = 1;
//           break;
//         case "frosted":
//           materialRef.current.color.set(COLORS.panel);
//           materialRef.current.transmission = 0.5;
//           materialRef.current.roughness = 0.8;
//           materialRef.current.opacity = 0.95;
//           materialRef.current.clearcoat = 0;
//           break;
//         case "tinted":
//           materialRef.current.color.set("#78909c"); // A subtle grey-blue tint
//           materialRef.current.transmission = 0.7;
//           materialRef.current.roughness = 0.2;
//           materialRef.current.opacity = 0.9;
//           materialRef.current.clearcoat = 0.5;
//           break;
//         default:
//           break;
//       }
//       materialRef.current.needsUpdate = true;
//     }
//   }, [glassType]);

//   return (
//     <group position={position} rotation={rotation}>
//       {/* Pivot set at door's hinge side */}
//       <group ref={pivotRef} position={[-size.width / 2, 0, 0]}>
//         <mesh position={[size.width / 2, 0, 0]}>
//           {/* Use glassThickness for the depth of the box geometry */}
//           <boxGeometry args={[size.width, size.height, glassThickness]} />
//           <meshPhysicalMaterial
//             ref={materialRef}
//             color={isDoor ? COLORS.panel : COLORS.panel} // Both door and panel use the panel color
//             transmission={isDoor ? 0.9 : 0.6}
//             roughness={0.1}
//             thickness={glassThickness * 10} // Scale thickness for visual effect
//             ior={1.5}
//             clearcoat={1}
//             opacity={0.92}
//             envMapIntensity={0.8}
//           />
//           {showEdges && (
//             <Edges scale={1.01} threshold={15} color={COLORS.glassEdge} />
//           )}
//         </mesh>

//         {isDoor && (
//           <mesh position={[size.width - 0.05, 0, 0]}>
//             <cylinderGeometry args={[0.02, 0.02, 0.15, 16]} />
//             <meshStandardMaterial
//               color={COLORS.handle}
//               metalness={0.9}
//               roughness={0.1}
//             />
//           </mesh>
//         )}
//       </group>
//     </group>
//   );
// };


// const Scene = ({ config, isAnimating, showMeasurements }) => {
//   const { camera } = useThree();

//   // Adjust camera to fit the scene only when config changes
//   useEffect(() => {
//     // Calculate total width of the entire structure including all panels and doors
//     const totalStructureWidth =
//       (config.leftPanel ? config.panelDepth : 0) +
//       (config.doorCount * config.doorWidth) +
//       (config.rightPanel ? config.panelDepth : 0);

//     const returnDepth = config.returnDepth;

//     camera.position.set(
//       0, // Center X for camera
//       config.height * 0.8,
//       Math.max(totalStructureWidth, returnDepth) * 1.2
//     );
//     camera.lookAt(0, config.height / 2, 0); // Look at the center of the structure
//   }, [config, camera]);

//   const [elements, measurements] = (function () {
//     const newElements = [];
//     const newMeasurements = [];
//   const measurementOffset = 0.15; // Offset for lines and text from the main structure
//     const labelFontSize = 0.12; // Font size for the measurement text

//     // Calculate total width of the entire structure including all panels and doors
//     const totalStructureWidth =
//       (config.leftPanel ? config.panelDepth : 0) +
//       (config.doorCount * config.doorWidth) +
//       (config.rightPanel ? config.panelDepth : 0);

//     // Calculate the world X-coordinates for the start and end of the entire structure
//     const structureStartX = -totalStructureWidth / 2;
//     const structureEndX = totalStructureWidth / 2;

//     // Calculate the world X-coordinates for the start and end of just the doors section
//     const doorsStartX = structureStartX + (config.leftPanel ? config.panelDepth : 0);
//     const doorsEndX = doorsStartX + (config.doorCount * config.doorWidth);


//     // Overall Height Measurement (Left Side)
//     if (showMeasurements) {
//       const heightX = structureStartX - measurementOffset;
//       newMeasurements.push({
//         type: "line",
//         text: `${(config.height * METERS_TO_INCHES).toFixed(0)}`, // Rounded to nearest inch
//         start: [heightX, 0, 0],
//         end: [heightX, config.height, 0],
//         fontSize: labelFontSize,
//         color: COLORS.measurement,
//         textPosition: [heightX, config.height / 2, measurementOffset], // Shift text forward
//         textRotation: [0, 0, 0], // Text faces front
//       });
//     }

//     // Overall Height Measurement (Right Side)
//     if (showMeasurements) {
//       const heightX = structureEndX + measurementOffset;
//       newMeasurements.push({
//         type: "line",
//         text: `${(config.height * METERS_TO_INCHES).toFixed(0)}`, // Rounded to nearest inch
//         start: [heightX, 0, 0],
//         end: [heightX, config.height, 0],
//         fontSize: labelFontSize,
//         color: COLORS.measurement,
//         textPosition: [heightX, config.height / 2, measurementOffset], // Shift text forward
//         textRotation: [0, 0, 0], // Text faces front
//       });
//     }

//     // NEW: Door(s) Width Measurement (Green Line) - Positioned highest
//     if (showMeasurements && config.doorCount > 0) {
//       const doorWidthY = config.height + measurementOffset / 2.5; // Highest horizontal line
//       const doorWidthZ = 0; // On the same plane as the doors

//       newMeasurements.push({
//         type: "line",
//         text: `${((config.doorCount * config.doorWidth) * METERS_TO_INCHES).toFixed(0)}`,
//         start: [doorsStartX, doorWidthY, doorWidthZ],
//         end: [doorsEndX, doorWidthY, doorWidthZ],
//         fontSize: labelFontSize,
//         color: COLORS.doorMeasurement, // Green color
//         textPosition: [(doorsStartX + doorsEndX) / 2, doorWidthY, measurementOffset], // Shift text forward
//         textRotation: [0, 0, 0], // Text faces front
//       });
//     }

//     // Overall Width Measurement (Front Top) - Positioned lower than green line
//     if (showMeasurements) {
//       const widthY = config.height + measurementOffset * 1.5; // Lower than green line
//       newMeasurements.push({
//         type: "line",
//         text: `${(totalStructureWidth * METERS_TO_INCHES).toFixed(0)}`, // Rounded to nearest inch
//         start: [structureStartX, widthY, 0],
//         end: [structureEndX, widthY, 0],
//         fontSize: labelFontSize,
//         color: COLORS.measurement,
//         textPosition: [(structureStartX + structureEndX) / 2, widthY, measurementOffset], // Shift text forward
//         textRotation: [0, 0, 0], // Text faces front
//       });
//     }

//     // Overall Width Measurement (Front Bottom)
//     if (showMeasurements) {
//       const widthY = -measurementOffset;
//       newMeasurements.push({
//         type: "line",
//         text: `${(totalStructureWidth * METERS_TO_INCHES).toFixed(0)}`, // Rounded to nearest inch
//         start: [structureStartX, widthY, 0],
//         end: [structureEndX, widthY, 0],
//         fontSize: labelFontSize,
//         color: COLORS.measurement,
//         textPosition: [(structureStartX + structureEndX) / 2, widthY, measurementOffset], // Shift text forward
//         textRotation: [0, 0, 0], // Text faces front
//       });
//     }

//     // Left Panel
//     if (config.leftPanel) {
//       newElements.push({
//         type: "panel",
//         size: { width: config.panelDepth, height: config.height },
//         position: [structureStartX + config.panelDepth / 2, config.height / 2, 0],
//         rotation: [0, 0, 0],
//       });
//     }

//     // Left Return Panel
//     if (config.leftReturn) {
//       // Corrected: leftReturnPanelX now always starts from the absolute leftmost edge (structureStartX)
//       const leftReturnPanelX = structureStartX;
//       newElements.push({
//         type: "panel",
//         size: { width: config.returnDepth, height: config.height },
//         position: [
//           leftReturnPanelX, // Position at the leftmost edge of the entire structure
//           config.height / 2,
//           -config.returnDepth / 2, // Extends backward in Z
//         ],
//         rotation: [0, Math.PI / 2, 0],
//       });

//       if (showMeasurements) {
//         // Left Return Depth Measurement (Top)
//         const depthY = config.height + measurementOffset;
//         newMeasurements.push({
//           type: "line",
//           text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
//           start: [leftReturnPanelX, depthY, 0], // Start line from the front edge of the return panel
//           end: [leftReturnPanelX, depthY, -config.returnDepth], // End line at the back edge
//           fontSize: labelFontSize,
//           color: COLORS.measurement,
//           textPosition: [leftReturnPanelX + measurementOffset, depthY, -config.returnDepth / 2], // Text offset from the line
//           textRotation: [0, Math.PI / 2, 0], // Text faces right
//         });
//         // Left Return Depth Measurement (Bottom)
//         const depthYBottom = -measurementOffset;
//         newMeasurements.push({
//           type: "line",
//           text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
//           start: [leftReturnPanelX, depthYBottom, 0], // Start line from the front edge of the return panel
//           end: [leftReturnPanelX, depthYBottom, -config.returnDepth], // End line at the back edge
//           fontSize: labelFontSize,
//           color: COLORS.measurement,
//           textPosition: [leftReturnPanelX + measurementOffset, depthYBottom, -config.returnDepth / 2], // Text offset from the line
//           textRotation: [0, Math.PI / 2, 0], // Text faces right
//         });
//       }
//     }

//     // Doors
//     let currentDoorX = doorsStartX; // Start from where the doors section begins
//     for (let i = 0; i < config.doorCount; i++) {
//       newElements.push({
//         type: "door",
//         size: { width: config.doorWidth, height: config.height },
//         position: [currentDoorX + config.doorWidth / 2, config.height / 2, 0], // Position based on currentDoorX
//         rotation: [0, 0, 0],
//         isOpen: isAnimating,
//       });
//       currentDoorX += config.doorWidth; // Move to the start of the next door
//     }

//     // Right side panel (parallel to doors)
//     if (config.rightPanel) {
//       newElements.push({
//         type: "panel",
//         size: { width: config.panelDepth, height: config.height },
//         position: [doorsEndX + config.panelDepth / 2, config.height / 2, 0], // Position after doors
//         rotation: [0, 0, 0],
//       });
//     }

//     // Right Return Panel
//     if (config.rightReturn) {
//       const rightReturnPanelX = structureEndX; // X-coord of the front edge of the right return panel
//       newElements.push({
//         type: "panel",
//         size: { width: config.returnDepth, height: config.height },
//         position: [
//           rightReturnPanelX,
//           config.height / 2,
//           -config.returnDepth / 2,
//         ],
//         rotation: [0, -Math.PI / 2, 0],
//       });

//       if (showMeasurements) {
//         // Right Return Depth Measurement (Top)
//         const depthY = config.height + measurementOffset;
//         newMeasurements.push({
//           type: "line",
//           text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
//           start: [rightReturnPanelX, depthY, 0],
//           end: [rightReturnPanelX, depthY, -config.returnDepth],
//           fontSize: labelFontSize,
//           color: COLORS.measurement,
//           textPosition: [rightReturnPanelX - measurementOffset, depthY, -config.returnDepth / 2], // Shift text left
//           textRotation: [0, -Math.PI / 2, 0], // Text faces left
//         });
//         // Right Return Depth Measurement (Bottom)
//         const depthYBottom = -measurementOffset;
//         newMeasurements.push({
//           type: "line",
//           text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
//           start: [rightReturnPanelX, -measurementOffset, 0],
//           end: [rightReturnPanelX, -measurementOffset, -config.returnDepth],
//           fontSize: labelFontSize,
//           color: COLORS.measurement,
//           textPosition: [rightReturnPanelX - measurementOffset, depthYBottom, -config.returnDepth / 2], // Shift text left
//           textRotation: [0, -Math.PI / 2, 0], // Text faces left
//         });
//       }
//     }
//     return [newElements, newMeasurements];
//   })(); // Self-invoking function to immediately get elements and measurements

//   return (
//     <>
//       <ambientLight intensity={0.8} />
//       <directionalLight
//         position={[5, 10, 7]}
//         intensity={1.5}
//         castShadow
//         shadow-mapSize-width={2048}
//         shadow-mapSize-height={2048}
//       />
//       <Environment preset="park" />

//       {/* Shower elements */}
//       {elements.map((el, i) => (
//         <GlassPanel
//           key={`element-${i}`}
//           size={el.size}
//           position={el.position}
//           rotation={el.rotation}
//           isDoor={el.type === "door"}
//           isOpen={el.isOpen}
//           showEdges={config.showEdges}
//           glassThickness={config.glassThickness} // Pass thickness
//           glassType={config.glassType} // Pass glass type
//         />
//       ))}

//       {/* Measurements */}
//       {showMeasurements &&
//         measurements.map((m, i) => (
//           <MeasurementLine
//             key={`measurement-${i}`}
//             start={m.start}
//             end={m.end}
//             text={m.text}
//             fontSize={m.fontSize}
//             color={m.color}
//             textPosition={m.textPosition}
//             textRotation={m.textRotation}
//           />
//         ))}

//       {/* Floor */}
//       <mesh rotation={[-Math.PI / 2, 0, 0]}>
//         <planeGeometry args={[20, 20]} />
//         <meshStandardMaterial color={COLORS.floor} roughness={0.5} />
//       </mesh>

//       <OrbitControls
//         minDistance={1}
//         maxDistance={15}
//         enablePan={true}
//         enableZoom={true}
//         enableRotate={true}
//       />
//     </>
//   );
// };

// export default function ShowerConfigurator() {
//   const [config, setConfig] = useState({
//     height: convertInchesToMeters(55), // Default height 78 inches
//     doorWidth: convertInchesToMeters(28), // Default door width 26 inches
//     doorCount: 1,
//     panelDepth: convertInchesToMeters(22), // Default panel depth 2 inches
//     returnDepth: convertInchesToMeters(22), // Default return depth 2 inches
//     leftReturn: true,
//     rightReturn: false,
//     showEdges: true,
//     leftPanel: false,
//     rightPanel: false,
//     glassType: "clear",
//     glassThickness: convertInchesToMeters(3 / 8), // Default glass thickness 3/8 inches
//   });

//   const [uiState, setUiState] = useState({
//     isAnimating: false,
//     showMeasurements: true,
//   });

//   const handleConfigChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     if (type === "checkbox") {
//       setConfig((prev) => ({
//         ...prev,
//         [name]: checked,
//       }));
//     } else if (name === "doorCount") {
//       setConfig((prev) => ({
//         ...prev,
//         [name]: parseInt(value, 10),
//       }));
//     } else if (name === "glassThickness") {
//       let thicknessInInches;
//       switch (value) {
//         case "3/8":
//           thicknessInInches = 3 / 8;
//           break;
//         case "1/2":
//           thicknessInInches = 1 / 2;
//           break;
//         case "1/4":
//           thicknessInInches = 1 / 4;
//           break;
//         case "1/8":
//           thicknessInInches = 1 / 8;
//           break;
//         default:
//           thicknessInInches = 3 / 8;
//       }
//       setConfig((prev) => ({
//         ...prev,
//         [name]: convertInchesToMeters(thicknessInInches),
//       }));
//     } else {
//       const newValueInMeters = parseFloat(value) * INCHES_TO_METERS;
//       setConfig((prev) => ({
//         ...prev,
//         [name]: newValueInMeters,
//       }));
//     }
//   };

//   const handleGlassTypeChange = (type) => {
//     setConfig((prev) => ({
//       ...prev,
//       glassType: type,
//       ...(type === "frosted" && { showEdges: true }),
//     }));
//   };

//   const toggleAnimation = () => {
//     setUiState((prev) => ({ ...prev, isAnimating: !prev.isAnimating }));
//   };

//   const toggleMeasurements = () => {
//     setUiState((prev) => ({
//       ...prev,
//       showMeasurements: !prev.showMeasurements,
//     }));
//   };

//   // Function to convert meter value back to fractional inches for display
//   const getFractionalInches = (meters) => {
//     const inches = meters * METERS_TO_INCHES;
//     if (Math.abs(inches - 3 / 8) < 0.001) return "3/8";
//     if (Math.abs(inches - 1 / 2) < 0.001) return "1/2";
//     if (Math.abs(inches - 1 / 4) < 0.001) return "1/4";
//     if (Math.abs(inches - 1 / 8) < 0.001) return "1/8";
//     return inches.toFixed(3); // Fallback for unexpected values
//   };

//   // Calculate total dimensions (using internal meter values, convert to inches for display)
//   const totalWidthInches =
//     config.doorCount * config.doorWidth * METERS_TO_INCHES;
//   const totalDepthInches =
//     Math.max(
//       config.leftReturn ? config.returnDepth : 0,
//       config.rightReturn ? config.returnDepth : 0
//     ) * METERS_TO_INCHES;

//   return (
//     <div
//       style={{
//         display: "flex",
//         height: "100vh",
//         backgroundColor: COLORS.background,
//         fontFamily: "'Inter', sans-serif", // Changed font to Inter for a modern look
//       }}
//     >
//       {/* Control Panel */}
//       <div
//         style={{
//           width: "350px", // Slightly wider panel
//           padding: "30px", // More padding
//           borderRight: `1px solid ${COLORS.glassEdge}`,
//           backgroundColor: COLORS.glass,
//           overflowY: "auto",
//           boxShadow: "4px 0 15px rgba(0,0,0,0.05)", // Softer, more subtle shadow
//           borderRadius: "0 12px 12px 0", // More rounded right corners
//           display: "flex",
//           flexDirection: "column",
//           gap: "25px", // Consistent gap between sections
//         }}
//       >
//         <h2
//           style={{
//             color: COLORS.text,
//             marginBottom: "10px", // Adjusted margin
//             borderBottom: `2px solid ${COLORS.glassEdge}`,
//             paddingBottom: "15px",
//             fontSize: "1.8rem", // Larger heading
//             fontWeight: 700, // Bolder
//             letterSpacing: "-0.02em",
//           }}
//         >
//           Shower Configurator
//         </h2>

//         {/* Glass Type Selector */}
//         <div>
//           <h3 style={{ color: COLORS.text, marginBottom: "12px", fontSize: "1.1rem" }}>
//             Glass Type
//           </h3>
//           <div style={{ display: "flex", gap: "12px" }}>
//             {["clear", "frosted", "tinted"].map((type) => (
//               <button
//                 key={type}
//                 onClick={() => handleGlassTypeChange(type)}
//                 style={{
//                   flex: 1,
//                   padding: "10px 15px", // More padding
//                   backgroundColor:
//                     config.glassType === type ? COLORS.glassEdge : "#fff",
//                   color: config.glassType === type ? "#fff" : COLORS.text,
//                   border: `1px solid ${COLORS.glassEdge}`,
//                   borderRadius: "6px", // Slightly more rounded
//                   cursor: "pointer",
//                   fontWeight: 600,
//                   transition: "all 0.3s ease",
//                   boxShadow: "0 2px 5px rgba(0,0,0,0.05)", // Subtle button shadow
//                 }}
//                 onMouseOver={(e) =>
//                   (e.currentTarget.style.backgroundColor =
//                     config.glassType === type
//                       ? COLORS.glassEdge
//                       : COLORS.buttonHover)
//                 }
//                 onMouseOut={(e) =>
//                   (e.currentTarget.style.backgroundColor =
//                     config.glassType === type ? COLORS.glassEdge : "#fff")
//                 }
//                 onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
//                 onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
//               >
//                 {type.charAt(0).toUpperCase() + type.slice(1)}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Glass Thickness Selector */}
//         <div>
//           <h3 style={{ color: COLORS.text, marginBottom: "12px", fontSize: "1.1rem" }}>
//             Glass Thickness
//           </h3>
//           <select
//             name="glassThickness"
//             value={getFractionalInches(config.glassThickness)}
//             onChange={handleConfigChange}
//             style={{
//               width: "100%",
//               padding: "10px",
//               border: `1px solid ${COLORS.glassEdge}`,
//               borderRadius: "6px",
//               backgroundColor: "#fff",
//               color: COLORS.text,
//               fontSize: "1rem",
//               appearance: "none", // Remove default select arrow
//               backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${COLORS.text.substring(1)}'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
//               backgroundRepeat: "no-repeat",
//               backgroundPosition: "right 10px center",
//               backgroundSize: "18px",
//               boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
//               cursor: "pointer", // Ensure cursor is pointer
//               transition: "border-color 0.3s ease, box-shadow 0.3s ease",
//             }}
//             onFocus={(e) => {
//               e.currentTarget.style.borderColor = COLORS.inputFocus;
//               e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`; // Add a subtle focus ring
//             }}
//             onBlur={(e) => {
//               e.currentTarget.style.borderColor = COLORS.glassEdge;
//               e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
//             }}
//           >
//             {["3/8", "1/2", "1/4", "1/8"].map((thickness) => (
//               <option key={thickness} value={thickness}>
//                 {thickness} inches
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Configuration Controls */}
//         {[
//           { label: "Height", name: "height", step: 0.5, unit: "inches" },
//           { label: "Door Width", name: "doorWidth", step: 0.5, unit: "inches" },
//           {
//             label: "Return Depth",
//             name: "returnDepth",
//             step: 0.5,
//             unit: "inches",
//           },
//           {
//             label: "Panel Depth",
//             name: "panelDepth",
//             step: 0.5,
//             unit: "inches",
//           },
//         ].map((input) => (
//           <div key={input.name}>
//             <label
//               style={{
//                 display: "block",
//                 marginBottom: "8px",
//                 color: COLORS.text,
//                 fontWeight: "600",
//                 fontSize: "1.1rem",
//               }}
//             >
//               {input.label} (
//               <span style={{ color: COLORS.text }}>{input.unit}</span>):
//             </label>
//             <input
//               type="number"
//               name={input.name}
//               step={input.step}
//               value={(config[input.name] * METERS_TO_INCHES).toFixed(2)}
//               onChange={handleConfigChange}
//               style={{
//                 width: "100%",
//                 padding: "10px",
//                 border: `1px solid ${COLORS.glassEdge}`,
//                 borderRadius: "6px",
//                 backgroundColor: "#fff",
//                 color: COLORS.text,
//                 fontSize: "1rem",
//                 boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
//                 transition: "border-color 0.3s ease, box-shadow 0.3s ease",
//               }}
//               onFocus={(e) => {
//                 e.currentTarget.style.borderColor = COLORS.inputFocus;
//                 e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
//               }}
//               onBlur={(e) => {
//                 e.currentTarget.style.borderColor = COLORS.glassEdge;
//                 e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
//               }}
//             />
//           </div>
//         ))}

//         <div>
//           <label
//             style={{
//               display: "block",
//               marginBottom: "8px",
//               color: COLORS.text,
//               fontWeight: "600",
//               fontSize: "1.1rem",
//             }}
//           >
//             Number of Doors:
//           </label>
//           <select
//             name="doorCount"
//             value={config.doorCount}
//             onChange={handleConfigChange}
//             style={{
//               width: "100%",
//               padding: "10px",
//               border: `1px solid ${COLORS.glassEdge}`,
//               borderRadius: "6px",
//               backgroundColor: "#fff",
//               color: COLORS.text,
//               fontSize: "1rem",
//               appearance: "none",
//               backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${COLORS.text.substring(1)}'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3Csvg%3E")`,
//               backgroundRepeat: "no-repeat",
//               backgroundPosition: "right 10px center",
//               backgroundSize: "18px",
//               boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
//               cursor: "pointer", // Ensure cursor is pointer
//               transition: "border-color 0.3s ease, box-shadow 0.3s ease",
//             }}
//             onFocus={(e) => {
//               e.currentTarget.style.borderColor = COLORS.inputFocus;
//               e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
//             }}
//             onBlur={(e) => {
//               e.currentTarget.style.borderColor = COLORS.glassEdge;
//               e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
//             }}
//           >
//             {[1, 2, 3].map((num) => (
//               <option key={num} value={num}>
//                 {num} Door{num !== 1 ? "s" : ""}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "15px",
//           }}
//         >
//           {[
//             { name: "leftReturn", label: "Left Return" },
//             { name: "rightReturn", label: "Right Return" },
//             { name: "showEdges", label: "Show Edges" },
//             { name: "leftPanel", label: "Left Panel" },
//             { name: "rightPanel", label: "Right Panel" },
//           ].map((checkbox) => (
//             <label
//               key={checkbox.name}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 color: COLORS.text,
//                 fontWeight: "500",
//                 fontSize: "1rem",
//                 cursor: "pointer", // Ensure cursor is pointer for labels
//               }}
//             >
//               <input
//                 type="checkbox"
//                 name={checkbox.name}
//                 checked={config[checkbox.name]}
//                 onChange={handleConfigChange}
//                 style={{
//                   marginRight: "10px",
//                   accentColor: COLORS.glassEdge,
//                   width: "18px", // Larger checkbox
//                   height: "18px",
//                   cursor: "pointer",
//                 }}
//               />
//               {checkbox.label}
//             </label>
//           ))}
//         </div>

//         {/* Action Buttons */}
//         <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
//           <button
//             onClick={toggleAnimation}
//             style={{
//               flex: 1,
//               padding: "12px 15px",
//               backgroundColor: uiState.isAnimating
//                 ? COLORS.text
//                 : COLORS.glassEdge,
//               color: "#fff",
//               border: "none",
//               borderRadius: "6px",
//               cursor: "pointer",
//               fontWeight: "bold",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "8px",
//               transition: "background-color 0.3s ease, transform 0.1s ease-out",
//               boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             }}
//             onMouseOver={(e) =>
//               (e.currentTarget.style.backgroundColor = uiState.isAnimating
//                 ? COLORS.text
//                 : COLORS.buttonHover)
//             }
//             onMouseOut={(e) =>
//               (e.currentTarget.style.backgroundColor = uiState.isAnimating
//                 ? COLORS.text
//                 : COLORS.glassEdge)
//             }
//             onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
//             onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
//           >
//             {uiState.isAnimating ? (
//               <>
//                 <span>◼</span> Stop Animation
//               </>
//             ) : (
//               <>
//                 <span>▶</span> Animate Doors
//               </>
//             )}
//           </button>
//           <button
//             onClick={toggleMeasurements}
//             style={{
//               flex: 1,
//               padding: "12px 15px",
//               backgroundColor: uiState.showMeasurements
//                 ? COLORS.text
//                 : COLORS.glassEdge,
//               color: "#fff",
//               border: "none",
//               borderRadius: "6px",
//               cursor: "pointer",
//               fontWeight: "bold",
//               transition: "background-color 0.3s ease, transform 0.1s ease-out",
//               boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             }}
//             onMouseOver={(e) =>
//               (e.currentTarget.style.backgroundColor = uiState.showMeasurements
//                 ? COLORS.text
//                 : COLORS.buttonHover)
//             }
//             onMouseOut={(e) =>
//               (e.currentTarget.style.backgroundColor = uiState.showMeasurements
//                 ? COLORS.text
//                 : COLORS.glassEdge)
//             }
//             onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
//             onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
//           >
//             {uiState.showMeasurements ? "Hide Measures" : "Show Measures"}
//           </button>
//         </div>

//         {/* Current Configuration Summary */}
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "20px", // More padding
//             backgroundColor: "#fff",
//             borderRadius: "8px", // More rounded
//             border: `1px solid ${COLORS.glassEdge}`,
//             boxShadow: "0 2px 10px rgba(0,0,0,0.05)", // Subtle shadow
//           }}
//         >
//           <h3
//             style={{
//               color: COLORS.text,
//               marginBottom: "15px",
//               fontSize: "1.2rem",
//               fontWeight: "600",
//             }}
//           >
//             Current Configuration
//           </h3>
//           <div style={{ color: COLORS.text, lineHeight: "1.6" }}>
//             <p>
//               <span style={{ fontWeight: "bold" }}>Height:</span>{" "}
//               {config.height.toFixed(2)}m (
//               {(config.height * METERS_TO_INCHES).toFixed(2)} inches)
//             </p>
//             <p>
//               <span style={{ fontWeight: "bold" }}>Width:</span>{" "}
//               {(config.doorCount * config.doorWidth).toFixed(2)}m (
//               {totalWidthInches.toFixed(2)} inches)
//             </p>
//             <p>
//               <span style={{ fontWeight: "bold" }}>Depth:</span>{" "}
//               {Math.max(
//                 config.leftReturn ? config.returnDepth : 0,
//                 config.rightReturn ? config.returnDepth : 0
//               ).toFixed(2)}
//               m ({totalDepthInches.toFixed(2)} inches)
//             </p>
//             <p>
//               <span style={{ fontWeight: "bold" }}>Glass Type:</span>{" "}
//               {config.glassType.charAt(0).toUpperCase() +
//                 config.glassType.slice(1)}
//             </p>
//             <p>
//               <span style={{ fontWeight: "bold" }}>Glass Thickness:</span>{" "}
//               {getFractionalInches(config.glassThickness)} inches
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* 3D Viewer */}
//       <div style={{ flex: 1, position: "relative" }}>
//         <Canvas shadows>
//           <Scene
//             config={config}
//             isAnimating={uiState.isAnimating}
//             showMeasurements={uiState.showMeasurements}
//           />
//         </Canvas>
//         <div
//           style={{
//             position: "absolute",
//             bottom: "20px",
//             left: "20px",
//             backgroundColor: "rgba(255,255,255,0.9)", // Slightly less transparent
//             padding: "12px 18px", // More padding
//             borderRadius: "6px",
//             border: `1px solid ${COLORS.glassEdge}`,
//             color: COLORS.text,
//             fontSize: "15px", // Slightly larger font
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           }}
//         >
//           <strong>Controls:</strong> Right-click + drag to rotate | Scroll to
//           zoom | Left-click + drag to pan
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import * as THREE from 'three';

import {
  Edges,
  Environment,
  OrbitControls,
  Text,
} from '@react-three/drei';
import {
  Canvas,
  useFrame,
  useThree,
} from '@react-three/fiber';

// Updated Color palette for a softer, more modern look
const COLORS = {
  glass: "#E8F0EE", // Light, cool grey-green for the panel background
  glassEdge: "#6A8C80", // Muted teal-green for accents and borders
  panel: "#DDEEEB", // Very light, slightly desaturated green for glass panels (non-door)
  background: "#F4F8F7", // Soft, very light grey-green for the overall background
  text: "#3A5C50", // Darker teal-green for primary text
  handle: "#4A4A4A", // Dark grey for metallic handle
  measurement: "#B82F2F", // Slightly desaturated red for measurements
  floor: "#EFEFEF", // Light neutral grey floor
  wall: "#F8F8F8", // Very light neutral grey wall
  buttonHover: "#7D9D95", // Slightly darker shade for button hover
  inputFocus: "#8CBBAF", // A slightly brighter green for input focus
  doorMeasurement: "#4CAF50", // Green color for door specific measurement
};

// Conversion factor from meters to inches
const METERS_TO_INCHES = 39.3701;
const INCHES_TO_METERS = 1 / METERS_TO_INCHES;

// Helper function to convert fractional inches to meters
const convertInchesToMeters = (inches) => inches * INCHES_TO_METERS;

// New MeasurementLine component to draw lines with text
const MeasurementLine = ({ start, end, text, color, fontSize, textPosition, textRotation }) => {
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
        background
        backgroundOpacity={0.7}
        backgroundColor="#ffffff"
        padding={0.03}
        borderRadius={0.01}
        billboard={false} // Crucial: Text orientation is fixed in world space
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
  isOpen = false, // This prop now indicates if animation should be active (continuous)
  showEdges = true,
  glassThickness, // New prop for thickness
  glassType, // New prop for glass type
  hingeSide = 'left', // New prop: 'left' or 'right'
  notchConfig = null, // New prop for notch details
  panelType = 'front', // New prop: 'front' or 'return'
}) => {
  const pivotRef = useRef();
  const materialRef = useRef();

  // Local state to manage continuous animation direction for doors
  // 0: moving from closed to inwards open
  // 1: moving from inwards open to closed
  // 2: moving from closed to outwards open
  // 3: moving from outwards open to closed
  const [animationState, setAnimationState] = useState(0);

  useFrame(() => {
    if (!isDoor || !pivotRef.current) return;

    const currentRotation = pivotRef.current.rotation.y;
    const actualMaxOpenAngle = (Math.PI / 2) * 0.85; // Max open angle for the door
    const lerpFactor = 0.05; // Consistent lerp factor for smooth animation

    // Define target rotations based on hinge side
    const openInwardsTarget = hingeSide === 'left' ? actualMaxOpenAngle : -actualMaxOpenAngle;
    const openOutwardsTarget = hingeSide === 'left' ? -actualMaxOpenAngle : actualMaxOpenAngle;

    if (isOpen) { // If the parent signals to animate (continuously)
      let targetRotation;

      switch (animationState) {
        case 0: // Opening inwards (0 to openInwardsTarget)
          targetRotation = openInwardsTarget;
          if (Math.abs(currentRotation - openInwardsTarget) < 0.01) { // Check if close to target
            setAnimationState(1); // Next: Close inwards
          }
          break;
        case 1: // Closing inwards (openInwardsTarget to 0)
          targetRotation = 0;
          if (Math.abs(currentRotation) < 0.01) {
            setAnimationState(2); // Next: Open outwards
          }
          break;
        case 2: // Opening outwards (0 to openOutwardsTarget)
          targetRotation = openOutwardsTarget;
          if (Math.abs(currentRotation - openOutwardsTarget) < 0.01) { // Check if close to target
            setAnimationState(3); // Next: Close outwards
          }
          break;
        case 3: // Closing outwards (openOutwardsTarget to 0)
          targetRotation = 0;
          if (Math.abs(currentRotation) < 0.01) {
            setAnimationState(0); // Next: Open inwards (cycle repeats)
          }
          break;
        default:
          targetRotation = 0; // Should not happen
      }

      pivotRef.current.rotation.y = THREE.MathUtils.lerp(
        currentRotation,
        targetRotation,
        lerpFactor
      );
    } else { // If the parent signals to stop animation
      // Smoothly close the door, regardless of current state
      pivotRef.current.rotation.y = THREE.MathUtils.lerp(
        currentRotation,
        0,
        0.1 // Faster lerp to close when stopping
      );
      // Reset animation state once closed
      if (Math.abs(currentRotation) < 0.01) {
          setAnimationState(0); // Ensure it's ready to start from inwards open next time
      }
    }
  });

  // Update material properties based on glassType
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
          materialRef.current.color.set("#78909c"); // A subtle grey-blue tint
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

  // Determine pivot position based on hingeSide
  const pivotPosition = hingeSide === 'left' ? [-size.width / 2, 0, 0] : [size.width / 2, 0, 0];
  // Determine mesh position relative to pivot (center of the glass panel)
  const meshPosition = hingeSide === 'left' ? [size.width / 2, 0, 0] : [-size.width / 2, 0, 0];

  // Calculate notch position if applicable
  let notchRelativeX = 0; // Relative to the mesh's local center
  let notchRelativeY = 0; // Relative to the mesh's local center
  let isNotched = false;

  if (notchConfig) {
    isNotched = true;
    // Notch X position relative to the panel's local center.
    // This calculation ensures the notch's edge aligns with the panel's edge.
    if (notchConfig.side === 'left') {
      notchRelativeX = -size.width / 2 + notchConfig.width / 2;
    } else { // 'right'
      notchRelativeX = size.width / 2 - notchConfig.width / 2;
    }
    // Notch Y position relative to the panel's local center (from bottom edge).
    notchRelativeY = -size.height / 2 + notchConfig.distanceFromBottom + notchConfig.height / 2;
  }


  return (
    <group position={position} rotation={rotation}>
      {/* Pivot set at door's hinge side */}
      <group ref={pivotRef} position={pivotPosition}>
        <mesh position={meshPosition}>
          {/* Use glassThickness for the depth of the box geometry */}
          <boxGeometry args={[size.width, size.height, glassThickness]} />
          <meshPhysicalMaterial
            ref={materialRef}
            color={isDoor ? COLORS.panel : COLORS.panel} // Both door and panel use the panel color
            transmission={isDoor ? 0.9 : 0.6}
            roughness={0.1}
            thickness={glassThickness * 10} // Scale thickness for visual effect
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
            <mesh position={[
              hingeSide === 'left' ? size.width - 0.05 : -size.width + 0.05, // X position relative to pivot
              0, // Y position center of door
              glassThickness / 2 + 0.02 // Z position slightly out from glass edge
            ]}>
              <cylinderGeometry args={[0.02, 0.02, 0.15, 16]} />
              <meshStandardMaterial
                color={COLORS.handle}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>

            {/* Hinges */}
            {/* Top Hinge */}
            <mesh position={[
              0, // X-position relative to pivot (on the hinge line)
              size.height / 2 - 0.1, // Y-position near top
              glassThickness / 2 + 0.005 // Z-position slightly out from glass edge
            ]} rotation={[Math.PI / 2, 0, 0]}> {/* Rotate cylinder to be horizontal */}
              <cylinderGeometry args={[0.015, 0.015, 0.05, 8]} /> {/* Slightly larger, shorter cylinder for hinge barrel */}
              <meshStandardMaterial
                color={COLORS.handle}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            {/* Bottom Hinge */}
            <mesh position={[
              0, // X-position relative to pivot
              -size.height / 2 + 0.1, // Y-position near bottom
              glassThickness / 2 + 0.005 // Z-position slightly out from glass edge
            ]} rotation={[Math.PI / 2, 0, 0]}> {/* Rotate cylinder to be horizontal */}
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
              meshPosition[2] // Z is 0 relative to panel center
            ]}
          >
            <boxGeometry args={[notchConfig.width, notchConfig.height, glassThickness * 1.1]} /> {/* Slightly thicker than glass */}
            <meshBasicMaterial color={COLORS.background} /> {/* Reverted to background color */}
          </mesh>
        )}
      </group>
    </group>
  );
};


const Scene = ({ config, isAnimating, showMeasurements }) => {
  const { camera } = useThree();

  // Adjust camera to fit the scene only when config changes
  useEffect(() => {
    // Calculate total width of the entire structure including all panels and doors
    const totalStructureWidth =
      (config.leftPanel ? config.panelDepth : 0) +
      (config.doorCount * config.doorWidth) +
      (config.rightPanel ? config.panelDepth : 0);

    const returnDepth = config.returnDepth;

    camera.position.set(
      0, // Center X for camera
      config.height * 0.8,
      Math.max(totalStructureWidth, returnDepth) * 1.2
    );
    camera.lookAt(0, config.height / 2, 0); // Look at the center of the structure
  }, [config, camera]);

  const [elements, measurements] = (function () {
    const newElements = [];
    const newMeasurements = [];
    const measurementOffset = 0.15; // Offset for lines and text from the main structure
    const labelFontSize = 0.12; // Font size for the measurement text

    // Calculate total width of the entire structure including all panels and doors
    const totalStructureWidth =
      (config.leftPanel ? config.panelDepth : 0) +
      (config.doorCount * config.doorWidth) +
      (config.rightPanel ? config.panelDepth : 0);

    // Calculate the world X-coordinates for the start and end of the entire structure
    const structureStartX = -totalStructureWidth / 2;
    const structureEndX = totalStructureWidth / 2;

    let doorsStartX, doorsEndX;

    // Determine door section start and end based on placement
    if (config.doorPlacement === 'left') {
      doorsStartX = structureStartX + (config.leftPanel ? config.panelDepth : 0);
      doorsEndX = doorsStartX + (config.doorCount * config.doorWidth);
    } else { // 'right'
      doorsEndX = structureEndX - (config.rightPanel ? config.panelDepth : 0);
      doorsStartX = doorsEndX - (config.doorCount * config.doorWidth);
    }


    // Height Measurement for Left Panel (if exists) or first door
    if (showMeasurements && config.leftPanel) {
      const heightX = structureStartX - measurementOffset;
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
    } else if (showMeasurements && config.doorCount > 0) { // If no left panel, measure the first door's height
      const heightX = doorsStartX - measurementOffset;
      newMeasurements.push({
        type: "line",
        text: `${(config.height * METERS_TO_INCHES).toFixed(0)}`, // Doors use config.height
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
      const heightX = structureEndX + measurementOffset;
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
    } else if (showMeasurements && config.doorCount > 0) { // If no right panel, measure the last door's height
      const heightX = doorsEndX + measurementOffset;
      newMeasurements.push({
        type: "line",
        text: `${(config.height * METERS_TO_INCHES).toFixed(0)}`, // Doors use config.height
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
      const doorWidthY = config.height + measurementOffset / 2.5; // Highest horizontal line
      const doorWidthZ = 0; // On the same plane as the doors

      newMeasurements.push({
        type: "line",
        text: `${((config.doorCount * config.doorWidth) * METERS_TO_INCHES).toFixed(0)}`,
        start: [doorsStartX, doorWidthY, doorWidthZ],
        end: [doorsEndX, doorWidthY, doorWidthZ],
        fontSize: labelFontSize,
        color: COLORS.doorMeasurement, // Green color
        textPosition: [(doorsStartX + doorsEndX) / 2, doorWidthY, measurementOffset], // Shift text forward
        textRotation: [0, 0, 0], // Text faces front
      });
    }

    // Overall Width Measurement (Front Top) - Positioned lower than green line
    if (showMeasurements) {
      const widthY = config.height + measurementOffset * 1.5; // Lower than green line
      newMeasurements.push({
        type: "line",
        text: `${(totalStructureWidth * METERS_TO_INCHES).toFixed(0)}`, // Rounded to nearest inch
        start: [structureStartX, widthY, 0],
        end: [structureEndX, widthY, 0],
        fontSize: labelFontSize,
        color: COLORS.measurement,
        textPosition: [(structureStartX + structureEndX) / 2, widthY, measurementOffset], // Shift text forward
        textRotation: [0, 0, 0], // Text faces front
      });
    }

    // Overall Width Measurement (Front Bottom)
    if (showMeasurements) {
      const widthY = -measurementOffset;
      newMeasurements.push({
        type: "line",
        text: `${(totalStructureWidth * METERS_TO_INCHES).toFixed(0)}`, // Rounded to nearest inch
        start: [structureStartX, widthY, 0],
        end: [structureEndX, widthY, 0],
        fontSize: labelFontSize,
        color: COLORS.measurement,
        textPosition: [(structureStartX + structureEndX) / 2, widthY, measurementOffset], // Shift text forward
        textRotation: [0, 0, 0], // Text faces front
      });
    }

    // Left Panel
    if (config.leftPanel) {
      newElements.push({
        type: "panel",
        size: { width: config.panelDepth, height: config.leftPanelHeight }, // Use specific height
        position: [structureStartX + config.panelDepth / 2, config.leftPanelHeight / 2, 0], // Center Y correctly
        rotation: [0, 0, 0],
        panelType: 'front', // Added panelType
        notchConfig: config.notchEnabled && config.notchedElement === 'leftPanel' ? {
          height: config.notchHeight,
          width: config.notchWidth,
          side: config.notchSide,
          distanceFromBottom: config.notchDistanceFromBottom,
        } : null,
      });
    }

    // Left Return Panel
    if (config.leftReturn) {
      // The left return panel's visual position is at the end of the left panel (or start of doors if no left panel)
      const leftReturnPanelX = structureStartX;
      newElements.push({
        type: "panel",
        size: { width: config.returnDepth, height: config.leftReturnHeight }, // Use specific height
        position: [
          leftReturnPanelX, // Position at the leftmost edge of the entire structure
          config.leftReturnHeight / 2, // Center Y correctly
          -config.returnDepth / 2, // Extends backward in Z
        ],
        rotation: [0, Math.PI / 2, 0],
        panelType: 'return', // Added panelType
        notchConfig: config.notchEnabled && config.notchedElement === 'leftReturn' ? {
          height: config.notchHeight,
          width: config.notchWidth,
          side: config.notchSide,
          distanceFromBottom: config.notchDistanceFromBottom,
        } : null,
      });

      if (showMeasurements) {
        // Left Return Depth Measurement (Top)
        const depthY = config.leftReturnHeight + measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
          start: [leftReturnPanelX, depthY, 0], // Start line from the front edge of the return panel
          end: [leftReturnPanelX, depthY, -config.returnDepth], // End line at the back edge
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [leftReturnPanelX + measurementOffset, depthY, -config.returnDepth / 2], // Text offset from the line
          textRotation: [0, Math.PI / 2, 0], // Text faces right
        });
        // Left Return Depth Measurement (Bottom)
        const depthYBottom = -measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
          start: [leftReturnPanelX, depthYBottom, 0], // Start line from the front edge of the return panel
          end: [leftReturnPanelX, depthYBottom, -config.returnDepth], // End line at the back edge
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [leftReturnPanelX + measurementOffset, depthYBottom, -config.returnDepth / 2], // Text offset from the line
          textRotation: [0, Math.PI / 2, 0], // Text faces right
        });

        // Left Return Height Measurement
        const heightZForReturn = -config.returnDepth - measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.leftReturnHeight * METERS_TO_INCHES).toFixed(0)}`,
          start: [leftReturnPanelX, 0, heightZForReturn],
          end: [leftReturnPanelX, config.leftReturnHeight, heightZForReturn],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [leftReturnPanelX - measurementOffset, config.leftReturnHeight / 2, heightZForReturn],
          textRotation: [0, Math.PI / 2, 0], // Rotate to face side
        });
      }
    }

    // Doors
    let currentDoorX = doorsStartX; // Start from where the doors section begins
    for (let i = 0; i < config.doorCount; i++) {
      // Determine hinge side based on alternation
      let currentHingeSide;
      if (config.doorPlacement === 'left') {
        currentHingeSide = (i % 2 === 0) ? 'left' : 'right'; // 0, 2, 4... hinge left; 1, 3, 5... hinge right
      } else { // 'right'
        currentHingeSide = (i % 2 === 0) ? 'right' : 'left'; // 0, 2, 4... hinge right; 1, 3, 5... hinge left
      }

      newElements.push({
        type: "door",
        size: { width: config.doorWidth, height: config.height }, // Doors still use main config.height
        position: [currentDoorX + config.doorWidth / 2, config.height / 2, 0], // Position based on currentDoorX
        rotation: [0, 0, 0],
        isOpen: isAnimating,
        hingeSide: currentHingeSide, // Pass the dynamically determined hinge side
      });
      currentDoorX += config.doorWidth; // Move to the start of the next door
    }

    // Right side panel (parallel to doors)
    if (config.rightPanel) {
      newElements.push({
        type: "panel",
        size: { width: config.panelDepth, height: config.rightPanelHeight }, // Use specific height
        position: [doorsEndX + config.panelDepth / 2, config.rightPanelHeight / 2, 0], // Position after doors
        rotation: [0, 0, 0],
        panelType: 'front', // Added panelType
        notchConfig: config.notchEnabled && config.notchedElement === 'rightPanel' ? {
          height: config.notchHeight,
          width: config.notchWidth,
          side: config.notchSide,
          distanceFromBottom: config.notchDistanceFromBottom,
        } : null,
      });
    }

    // Right Return Panel
    if (config.rightReturn) {
      const rightReturnPanelX = structureEndX; // X-coord of the front edge of the right return panel
      newElements.push({
        type: "panel",
        size: { width: config.returnDepth, height: config.rightReturnHeight }, // Use specific height
        position: [
          rightReturnPanelX,
          config.rightReturnHeight / 2, // Center Y correctly
          -config.returnDepth / 2,
        ],
        rotation: [0, -Math.PI / 2, 0],
        panelType: 'return', // Added panelType
        notchConfig: config.notchEnabled && config.notchedElement === 'rightReturn' ? {
          height: config.notchHeight,
          width: config.notchWidth,
          side: config.notchSide,
          distanceFromBottom: config.notchDistanceFromBottom,
        } : null,
      });

      if (showMeasurements) {
        // Right Return Depth Measurement (Top)
        const depthY = config.rightReturnHeight + measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
          start: [rightReturnPanelX, depthY, 0],
          end: [rightReturnPanelX, depthY, -config.returnDepth],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [rightReturnPanelX - measurementOffset, depthY, -config.returnDepth / 2], // Shift text left
          textRotation: [0, -Math.PI / 2, 0], // Text faces left
        });
        // Right Return Depth Measurement (Bottom)
        const depthYBottom = -measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.returnDepth * METERS_TO_INCHES).toFixed(0)}`,
          start: [rightReturnPanelX, -measurementOffset, 0],
          end: [rightReturnPanelX, -measurementOffset, -config.returnDepth],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [rightReturnPanelX - measurementOffset, depthYBottom, -config.returnDepth / 2], // Shift text left
          textRotation: [0, -Math.PI / 2, 0], // Text faces left
        });

        // Right Return Height Measurement
        const heightZForReturn = -config.returnDepth - measurementOffset;
        newMeasurements.push({
          type: "line",
          text: `${(config.rightReturnHeight * METERS_TO_INCHES).toFixed(0)}`,
          start: [rightReturnPanelX, 0, heightZForReturn],
          end: [rightReturnPanelX, config.rightReturnHeight, heightZForReturn],
          fontSize: labelFontSize,
          color: COLORS.measurement,
          textPosition: [rightReturnPanelX + measurementOffset, config.rightReturnHeight / 2, heightZForReturn],
          textRotation: [0, -Math.PI / 2, 0], // Rotate to face side
        });
      }
    }
    return [newElements, newMeasurements];
  })(); // Self-invoking function to immediately get elements and measurements

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
      <Environment preset="park" />

      {/* Shower elements */}
      {elements.map((el, i) => (
        <GlassPanel
          key={`element-${i}`}
          size={el.size}
          position={el.position}
          rotation={el.rotation}
          isDoor={el.type === "door"}
          isOpen={el.isOpen}
          showEdges={config.showEdges}
          glassThickness={config.glassThickness} // Pass thickness
          glassType={config.glassType} // Pass glass type
          hingeSide={el.hingeSide} // Pass hinge side for doors
          notchConfig={el.notchConfig} // Pass notch config
          panelType={el.panelType} // Pass the panelType
        />
      ))}

      {/* Measurements */}
      {showMeasurements &&
        measurements.map((m, i) => (
          <MeasurementLine
            key={`measurement-${i}`}
            start={m.start}
            end={m.end}
            text={m.text}
            fontSize={m.fontSize}
            color={m.color}
            textPosition={m.textPosition}
            textRotation={m.textRotation}
          />
        ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={COLORS.floor} roughness={0.5} />
      </mesh>

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
const getElementWidth = (currentConfig, elementName) => {
  switch (elementName) {
    case 'leftPanel':
    case 'rightPanel':
      return currentConfig.panelDepth;
    case 'leftReturn':
    case 'rightReturn':
      return currentConfig.returnDepth;
    default:
      return convertInchesToMeters(4); // Default notch width if none selected or invalid
  }
};

export default function ShowerConfigurator() {
  const [config, setConfig] = useState({
    height: convertInchesToMeters(55), // Default height 78 inches for doors and general reference
    doorWidth: convertInchesToMeters(26), // Default door width 26 inches
    doorCount: 1,
    panelDepth: convertInchesToMeters(22), // Default panel depth 2 inches
    returnDepth: convertInchesToMeters(22), // Default return depth 2 inches
    leftReturn: true,
    rightReturn: false,
    showEdges: true,
    leftPanel: false,
    rightPanel: false,
    glassType: "clear",
    glassThickness: convertInchesToMeters(3 / 8), // Default glass thickness 3/8 inches
    // New individual height properties, defaulting to main height
    leftPanelHeight: convertInchesToMeters(55),
    rightPanelHeight: convertInchesToMeters(55),
    leftReturnHeight: convertInchesToMeters(55),
    rightReturnHeight: convertInchesToMeters(55),
    doorPlacement: 'left', // New: 'left' or 'right'

    // Notch Configuration
    notchEnabled: false,
    notchedElement: 'none', // 'leftPanel', 'rightPanel', 'leftReturn', 'rightReturn', 'none'
    notchHeight: convertInchesToMeters(6),
    notchWidth: convertInchesToMeters(4), // This will be dynamically updated
    notchSide: 'left', // 'left' or 'right' of the panel itself
    notchDistanceFromBottom: convertInchesToMeters(0),
  });

  const [uiState, setUiState] = useState({
    isAnimating: false,
    showMeasurements: true,
    enableIndividualHeights: false, // New state for the toggle
  });

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "enableIndividualHeights") {
        setUiState((prev) => ({
          ...prev,
          [name]: checked,
        }));
        // If unchecking, reset individual heights to main height
        if (!checked) {
          setConfig((prev) => ({
            ...prev,
            leftPanelHeight: prev.height,
            rightPanelHeight: prev.height,
            leftReturnHeight: prev.height,
            rightReturnHeight: prev.height,
          }));
        }
      } else if (name === "notchEnabled") {
        setConfig((prev) => {
          const newConfig = {
            ...prev,
            [name]: checked,
            notchedElement: checked ? prev.notchedElement : 'none', // Reset if disabling
          };
          // If enabling notch and an element is selected, set default notch width
          if (checked && newConfig.notchedElement !== 'none') {
            const elementWidth = getElementWidth(newConfig, newConfig.notchedElement);
            newConfig.notchWidth = elementWidth;
          }
          return newConfig;
        });
      }
      else {
        setConfig((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else if (name === "doorCount") {
      // Ensure value is a number and at least 1
      const numValue = parseInt(value, 10);
      setConfig((prev) => ({
        ...prev,
        [name]: Math.max(1, isNaN(numValue) ? 1 : numValue), // Ensure at least 1 door
      }));
    } else if (name === "glassThickness") {
      let thicknessInInches;
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
      setConfig((prev) => ({
        ...prev,
        [name]: convertInchesToMeters(thicknessInInches),
      }));
    } else if (name === "doorPlacement" || name === "notchSide") { // Handle dropdowns and radio buttons
      setConfig((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === "notchedElement") {
      setConfig((prev) => {
        const newConfig = {
          ...prev,
          [name]: value,
        };
        // If an element is selected, set default notch width to its width
        if (value !== 'none') {
          const elementWidth = getElementWidth(newConfig, value);
          newConfig.notchWidth = elementWidth;
        }
        return newConfig;
      });
    }
    else { // All other number inputs (including notch dimensions)
      const newValueInMeters = parseFloat(value) * INCHES_TO_METERS;

      setConfig((prev) => {
        const newConfig = {
          ...prev,
          [name]: newValueInMeters,
        };

        // If 'enableIndividualHeights' is NOT checked and the main 'height' is being changed,
        // then synchronize all individual heights to the new main height.
        if (!uiState.enableIndividualHeights && name === "height") {
          newConfig.leftPanelHeight = newValueInMeters;
          newConfig.rightPanelHeight = newValueInMeters;
          newConfig.leftReturnHeight = newValueInMeters;
          newConfig.rightReturnHeight = newValueInMeters;
        }
        return newConfig;
      });
    }
  };

  const handleGlassTypeChange = (type) => {
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

  // Function to convert meter value back to fractional inches for display
  const getFractionalInches = (meters) => {
    const inches = meters * METERS_TO_INCHES;
    if (Math.abs(inches - 3 / 8) < 0.001) return "3/8";
    if (Math.abs(inches - 1 / 2) < 0.001) return "1/2";
    if (Math.abs(inches - 1 / 4) < 0.001) return "1/4";
    if (Math.abs(inches - 1 / 8) < 0.001) return "1/8";
    return inches.toFixed(3); // Fallback for unexpected values
  };

  // Calculate total dimensions (using internal meter values, convert to inches for display)
  const totalWidthInches =
    (config.leftPanel ? config.panelDepth : 0 + config.doorCount * config.doorWidth + (config.rightPanel ? config.panelDepth : 0)) * METERS_TO_INCHES;
  const totalDepthInches =
    Math.max(
      config.leftReturn ? config.returnDepth : 0,
      config.rightReturn ? config.returnDepth : 0
    ) * METERS_TO_INCHES;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: COLORS.background,
        fontFamily: "'Inter', sans-serif", // Changed font to Inter for a modern look
      }}
    >
      {/* Control Panel */}
      <div
        style={{
          width: "350px", // Slightly wider panel
          padding: "30px", // More padding
          borderRight: `1px solid ${COLORS.glassEdge}`,
          backgroundColor: COLORS.glass,
          overflowY: "auto",
          boxShadow: "4px 0 15px rgba(0,0,0,0.05)", // Softer, more subtle shadow
          borderRadius: "0 12px 12px 0", // More rounded right corners
          display: "flex",
          flexDirection: "column",
          gap: "25px", // Consistent gap between sections
        }}
      >
        <h2
          style={{
            color: COLORS.text,
            marginBottom: "10px", // Adjusted margin
            borderBottom: `2px solid ${COLORS.glassEdge}`,
            paddingBottom: "15px",
            fontSize: "1.8rem", // Larger heading
            fontWeight: 700, // Bolder
            letterSpacing: "-0.02em",
          }}
        >
          Shower Configurator
        </h2>

        {/* Glass Type Selector */}
        <div>
          <h3 style={{ color: COLORS.text, marginBottom: "12px", fontSize: "1.1rem" }}>
            Glass Type
          </h3>
          <div style={{ display: "flex", gap: "12px" }}>
            {["clear", "frosted", "tinted"].map((type) => (
              <button
                key={type}
                onClick={() => handleGlassTypeChange(type)}
                style={{
                  flex: 1,
                  padding: "10px 15px", // More padding
                  backgroundColor:
                    config.glassType === type ? COLORS.glassEdge : "#fff",
                  color: config.glassType === type ? "#fff" : COLORS.text,
                  border: `1px solid ${COLORS.glassEdge}`,
                  borderRadius: "6px", // Slightly more rounded
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)", // Subtle button shadow
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    config.glassType === type
                      ? COLORS.glassEdge
                      : COLORS.buttonHover)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    config.glassType === type ? COLORS.glassEdge : "#fff")
                }
                onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Glass Thickness Selector */}
        <div>
          <h3 style={{ color: COLORS.text, marginBottom: "12px", fontSize: "1.1rem" }}>
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
              appearance: "none", // Remove default select arrow
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${COLORS.text.substring(1)}'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "18px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              cursor: "pointer", // Ensure cursor is pointer
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = COLORS.inputFocus;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`; // Add a subtle focus ring
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = COLORS.glassEdge;
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
            }}
          >
            {["3/8", "1/2", "1/4", "1/8"].map((thickness) => (
              <option key={thickness} value={thickness}>
                {thickness} inches
              </option>
            ))}
          </select>
        </div>

        {/* Configuration Controls */}
        {[
          { label: "Height (Doors)", name: "height", step: 0.5, unit: "inches" }, // Renamed for clarity
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
              value={(config[input.name] * METERS_TO_INCHES).toFixed(2)}
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
              onFocus={(e) => {
                e.currentTarget.style.borderColor = COLORS.inputFocus;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
              }}
              onBlur={(e) => {
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
          {/* Changed from select to input type="number" */}
          <input
            type="number"
            name="doorCount"
            step="1"
            min="1" // Ensure at least one door
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
            onFocus={(e) => {
              e.currentTarget.style.borderColor = COLORS.inputFocus;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = COLORS.glassEdge;
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
            }}
          />
        </div>

        {/* Door Placement Radio Buttons */}
        <div>
          <h3 style={{ color: COLORS.text, marginBottom: "12px", fontSize: "1.1rem" }}>
            Door Placement
          </h3>
          <div style={{ display: "flex", gap: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", color: COLORS.text, fontWeight: "500", cursor: "pointer" }}>
              <input
                type="radio"
                name="doorPlacement"
                value="left"
                checked={config.doorPlacement === 'left'}
                onChange={handleConfigChange}
                style={{ marginRight: "8px", accentColor: COLORS.glassEdge, cursor: "pointer" }}
              />
              Left (Alternating)
            </label>
            <label style={{ display: "flex", alignItems: "center", color: COLORS.text, fontWeight: "500", cursor: "pointer" }}>
              <input
                type="radio"
                name="doorPlacement"
                value="right"
                checked={config.doorPlacement === 'right'}
                onChange={handleConfigChange}
                style={{ marginRight: "8px", accentColor: COLORS.glassEdge, cursor: "pointer" }}
              />
              Right (Alternating)
            </label>
          </div>
        </div>


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
          { label: "Left Panel Height", name: "leftPanelHeight", step: 0.5, unit: "inches" },
          { label: "Right Panel Height", name: "rightPanelHeight", step: 0.5, unit: "inches" },
          { label: "Left Return Height", name: "leftReturnHeight", step: 0.5, unit: "inches" },
          { label: "Right Return Height", name: "rightReturnHeight", step: 0.5, unit: "inches" },
        ].map((input) => (
          <div key={input.name}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: COLORS.text,
                fontWeight: "600",
                fontSize: "1.1rem",
                opacity: uiState.enableIndividualHeights ? 1 : 0.5, // Dim label when disabled
              }}
            >
              {input.label} (
              <span style={{ color: COLORS.text }}>{input.unit}</span>):
            </label>
            <input
              type="number"
              name={input.name}
              step={input.step}
              value={(config[input.name] * METERS_TO_INCHES).toFixed(2)}
              onChange={handleConfigChange}
              disabled={!uiState.enableIndividualHeights} // Disable input based on toggle
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
                opacity: uiState.enableIndividualHeights ? 1 : 0.5, // Dim input when disabled
                cursor: uiState.enableIndividualHeights ? "text" : "not-allowed",
              }}
              onFocus={(e) => {
                if (uiState.enableIndividualHeights) {
                  e.currentTarget.style.borderColor = COLORS.inputFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
                }
              }}
              onBlur={(e) => {
                if (uiState.enableIndividualHeights) {
                  e.currentTarget.style.borderColor = COLORS.glassEdge;
                  e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
                }
              }}
            />
          </div>
        ))}

        {/* Notch Configuration Controls */}
        <div style={{ borderTop: `1px solid ${COLORS.glassEdge}`, paddingTop: "25px", marginTop: "25px" }}>
          <h3 style={{ color: COLORS.text, marginBottom: "12px", fontSize: "1.1rem" }}>
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
            Enable Notch
          </label>

          {/* Notch Element Selector */}
          <div>
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
              Notch On:
            </label>
            <select
              name="notchedElement"
              value={config.notchedElement}
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
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${COLORS.text.substring(1)}'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                backgroundSize: "18px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                cursor: config.notchEnabled ? "pointer" : "not-allowed",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
                opacity: config.notchEnabled ? 1 : 0.5,
              }}
              onFocus={(e) => {
                if (config.notchEnabled) {
                  e.currentTarget.style.borderColor = COLORS.inputFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
                }
              }}
              onBlur={(e) => {
                if (config.notchEnabled) {
                  e.currentTarget.style.borderColor = COLORS.glassEdge;
                  e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
                }
              }}
            >
              <option value="none">-- Select Panel/Return --</option>
              {config.leftPanel && <option value="leftPanel">Left Panel</option>}
              {config.rightPanel && <option value="rightPanel">Right Panel</option>}
              {config.leftReturn && <option value="leftReturn">Left Return</option>}
              {config.rightReturn && <option value="rightReturn">Right Return</option>}
            </select>
          </div>

          {[
            { label: "Notch Height", name: "notchHeight", step: 0.5, unit: "inches" },
            { label: "Notch Width", name: "notchWidth", step: 0.5, unit: "inches" },
            { label: "Distance from Bottom", name: "notchDistanceFromBottom", step: 0.5, unit: "inches" },
          ].map((input) => (
            <div key={input.name} style={{ marginTop: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: COLORS.text,
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  opacity: config.notchEnabled && config.notchedElement !== 'none' ? 1 : 0.5,
                }}
              >
                {input.label} (
                <span style={{ color: COLORS.text }}>{input.unit}</span>):
              </label>
              <input
                type="number"
                name={input.name}
                step={input.step}
                value={(config[input.name] * METERS_TO_INCHES).toFixed(2)}
                onChange={handleConfigChange}
                disabled={!config.notchEnabled || config.notchedElement === 'none'}
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
                  opacity: config.notchEnabled && config.notchedElement !== 'none' ? 1 : 0.5,
                  cursor: config.notchEnabled && config.notchedElement !== 'none' ? "text" : "not-allowed",
                }}
                onFocus={(e) => {
                  if (config.notchEnabled && config.notchedElement !== 'none') {
                    e.currentTarget.style.borderColor = COLORS.inputFocus;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}40`;
                  }
                }}
                onBlur={(e) => {
                  if (config.notchEnabled && config.notchedElement !== 'none') {
                    e.currentTarget.style.borderColor = COLORS.glassEdge;
                    e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
                  }
                }}
              />
            </div>
          ))}

          {/* Notch Side Radio Buttons */}
          <div style={{ marginTop: "15px" }}>
            <h3 style={{ color: COLORS.text, marginBottom: "12px", fontSize: "1.1rem", opacity: config.notchEnabled && config.notchedElement !== 'none' ? 1 : 0.5, }}>
              Notch Side:
            </h3>
            <div style={{ display: "flex", gap: "15px" }}>
              <label style={{ display: "flex", alignItems: "center", color: COLORS.text, fontWeight: "500", cursor: config.notchEnabled && config.notchedElement !== 'none' ? "pointer" : "not-allowed", opacity: config.notchEnabled && config.notchedElement !== 'none' ? 1 : 0.5, }}>
                <input
                  type="radio"
                  name="notchSide"
                  value="left"
                  checked={config.notchSide === 'left'}
                  onChange={handleConfigChange}
                  disabled={!config.notchEnabled || config.notchedElement === 'none'}
                  style={{ marginRight: "8px", accentColor: COLORS.glassEdge, cursor: config.notchEnabled && config.notchedElement !== 'none' ? "pointer" : "not-allowed" }}
                />
                Left
              </label>
              <label style={{ display: "flex", alignItems: "center", color: COLORS.text, fontWeight: "500", cursor: config.notchEnabled && config.notchedElement !== 'none' ? "pointer" : "not-allowed", opacity: config.notchEnabled && config.notchedElement !== 'none' ? 1 : 0.5, }}>
                <input
                  type="radio"
                  name="notchSide"
                  value="right"
                  checked={config.notchSide === 'right'}
                  onChange={handleConfigChange}
                  disabled={!config.notchEnabled || config.notchedElement === 'none'}
                  style={{ marginRight: "8px", accentColor: COLORS.glassEdge, cursor: config.notchEnabled && config.notchedElement !== 'none' ? "pointer" : "not-allowed" }}
                />
                Right
              </label>
            </div>
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
                cursor: "pointer", // Ensure cursor is pointer for labels
              }}
            >
              <input
                type="checkbox"
                name={checkbox.name}
                checked={config[checkbox.name]}
                onChange={handleConfigChange}
                style={{
                  marginRight: "10px",
                  accentColor: COLORS.glassEdge,
                  width: "18px", // Larger checkbox
                  height: "18px",
                  cursor: "pointer",
                }}
              />
              {checkbox.label}
            </label>
          ))}
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
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = uiState.isAnimating
                ? COLORS.text
                : COLORS.buttonHover)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = uiState.isAnimating
                ? COLORS.text
                : COLORS.glassEdge)
            }
            onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
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
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = uiState.showMeasurements
                ? COLORS.text
                : COLORS.buttonHover)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = uiState.showMeasurements
                ? COLORS.text
                : COLORS.glassEdge)
            }
            onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {uiState.showMeasurements ? "Hide Measures" : "Show Measures"}
          </button>
        </div>

        {/* Current Configuration Summary */}
        <div
          style={{
            marginTop: "20px",
            padding: "20px", // More padding
            backgroundColor: "#fff",
            borderRadius: "8px", // More rounded
            border: `1px solid ${COLORS.glassEdge}`,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)", // Subtle shadow
          }}
        >
          <h3
            style={{
              color: COLORS.text,
              marginBottom: "15px",
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
            {config.leftPanel && <p><span style={{ fontWeight: "bold" }}>Left Panel Height:</span> {(config.leftPanelHeight * METERS_TO_INCHES).toFixed(2)} inches</p>}
            {config.rightPanel && <p><span style={{ fontWeight: "bold" }}>Right Panel Height:</span> {(config.rightPanelHeight * METERS_TO_INCHES).toFixed(2)} inches</p>}
            {config.leftReturn && <p><span style={{ fontWeight: "bold" }}>Left Return Height:</span> {(config.leftReturnHeight * METERS_TO_INCHES).toFixed(2)} inches</p>}
            {config.rightReturn && <p><span style={{ fontWeight: "bold" }}>Right Return Height:</span> {(config.rightReturnHeight * METERS_TO_INCHES).toFixed(2)} inches</p>}
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
              {config.doorPlacement.charAt(0).toUpperCase() + config.doorPlacement.slice(1)}
            </p>
            {config.notchEnabled && config.notchedElement !== 'none' && (
              <p>
                <span style={{ fontWeight: "bold" }}>Notch:</span> On{" "}
                {config.notchedElement.replace(/([A-Z])/g, ' $1').trim()} (
                {(config.notchWidth * METERS_TO_INCHES).toFixed(2)}W x{" "}
                {(config.notchHeight * METERS_TO_INCHES).toFixed(2)}H from{" "}
                {(config.notchDistanceFromBottom * METERS_TO_INCHES).toFixed(2)}B on {config.notchSide}
                )
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3D Viewer */}
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas shadows>
          <Scene
            config={config}
            isAnimating={uiState.isAnimating}
            showMeasurements={uiState.showMeasurements}
          />
        </Canvas>
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            backgroundColor: "rgba(255,255,255,0.9)", // Slightly less transparent
            padding: "12px 18px", // More padding
            borderRadius: "6px",
            border: `1px solid ${COLORS.glassEdge}`,
            color: COLORS.text,
            fontSize: "15px", // Slightly larger font
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

