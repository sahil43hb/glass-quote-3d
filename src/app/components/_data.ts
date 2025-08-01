// _data.ts

// Type Definitions (assuming these are defined elsewhere or will be in the main component)
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

// Helper function to convert fractional inches to meters
export const convertInchesToMeters = (inches: number): number =>
  inches * (1 / 39.3701); // Assuming METERS_TO_INCHES is 39.3701

// Helper function to convert degrees to radians
export const degreesToRadians = (degrees: number): number =>
  degrees * (Math.PI / 180);

// Predefined Layouts
export const PREDEFINED_LAYOUTS: Record<string, Config> = {
  "default": { // This will be the initial state
    height: convertInchesToMeters(55),
    doorWidth: convertInchesToMeters(26),
    doorCount: 1,
    panelDepth: convertInchesToMeters(22),
    returnDepth: convertInchesToMeters(22),
    leftReturn: true,
    rightReturn: false,
    showEdges: true,
    leftPanel: false,
    rightPanel: false,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(55),
    rightPanelHeight: convertInchesToMeters(55),
    leftReturnHeight: convertInchesToMeters(55),
    rightReturnHeight: convertInchesToMeters(55),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(55),
    doorPlacement: 'left',
    notchEnabled: false,
    notchHeight: convertInchesToMeters(6),
    notchDistanceFromBottom: convertInchesToMeters(0),
    notchSide: 'left',
    leftPanelNotchEnabled: false,
    leftPanelNotchWidth: convertInchesToMeters(4),
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90), // Default 90 degrees
    rightReturnAngle: degreesToRadians(90), // Default 90 degrees
    backPanelWidth:0
  },
  // Existing Predefined Layouts
  "90-Degree": {
    height: convertInchesToMeters(75),
    doorWidth: convertInchesToMeters(28),
    doorCount: 1,
    panelDepth: convertInchesToMeters(20),
    returnDepth: convertInchesToMeters(30),
    leftReturn: true,
    rightReturn: false,
    showEdges: true,
    leftPanel: true,
    rightPanel: true,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(75),
    rightPanelHeight: convertInchesToMeters(75),
    leftReturnHeight: convertInchesToMeters(75),
    rightReturnHeight: convertInchesToMeters(75),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(75),
    doorPlacement: 'left',
    notchEnabled: false,
    notchHeight: convertInchesToMeters(6),
    notchDistanceFromBottom: convertInchesToMeters(0),
    notchSide: 'left',
    leftPanelNotchEnabled: false,
    leftPanelNotchWidth: convertInchesToMeters(4),
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
    backPanelWidth:0
  },
  "Inline": {
    height: convertInchesToMeters(70),
    doorWidth: convertInchesToMeters(30),
    doorCount: 1,
    panelDepth: convertInchesToMeters(24),
    returnDepth: convertInchesToMeters(0),
    leftReturn: false,
    rightReturn: false,
    showEdges: true,
    leftPanel: true,
    rightPanel: true,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(70),
    rightPanelHeight: convertInchesToMeters(70),
    leftReturnHeight: convertInchesToMeters(70),
    rightReturnHeight: convertInchesToMeters(70),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(70),
    doorPlacement: 'left',
    notchEnabled: false,
    notchHeight: convertInchesToMeters(6),
    notchDistanceFromBottom: convertInchesToMeters(0),
    notchSide: 'left',
    leftPanelNotchEnabled: false,
    leftPanelNotchWidth: convertInchesToMeters(4),
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
    backPanelWidth:0
  },
  "3-Sided-Glass": {
    height: convertInchesToMeters(78),
    doorWidth: convertInchesToMeters(32),
    doorCount: 1,
    panelDepth: convertInchesToMeters(20),
    returnDepth: convertInchesToMeters(36),
    leftReturn: true,
    rightReturn: true,
    showEdges: true,
    leftPanel: true,
    rightPanel: true,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(78),
    rightPanelHeight: convertInchesToMeters(78),
    leftReturnHeight: convertInchesToMeters(78),
    rightReturnHeight: convertInchesToMeters(78),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(78),
    doorPlacement: 'left',
    notchEnabled: false,
    notchHeight: convertInchesToMeters(6),
    notchDistanceFromBottom: convertInchesToMeters(0),
    notchSide: 'left',
    leftPanelNotchEnabled: false,
    leftPanelNotchWidth: convertInchesToMeters(4),
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
    backPanelWidth:0
  },
  "Glass-Cube": {
    height: convertInchesToMeters(80),
    doorWidth: convertInchesToMeters(30),
    doorCount: 1,
    panelDepth: convertInchesToMeters(24),
    returnDepth: convertInchesToMeters(30),
    leftReturn: true,
    rightReturn: true,
    showEdges: true,
    leftPanel: true,
    rightPanel: true,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(80),
    rightPanelHeight: convertInchesToMeters(80),
    leftReturnHeight: convertInchesToMeters(80),
    rightReturnHeight: convertInchesToMeters(80),
    backPanel: true,
    backPanelHeight: convertInchesToMeters(80),
    doorPlacement: 'left',
    notchEnabled: false,
    notchHeight: convertInchesToMeters(6),
    notchDistanceFromBottom: convertInchesToMeters(0),
    notchSide: 'left',
    leftPanelNotchEnabled: false,
    leftPanelNotchWidth: convertInchesToMeters(4),
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
    backPanelWidth : convertInchesToMeters(78),
  },
  // New Predefined Layouts
  "Door": {
    height: convertInchesToMeters(72),
    doorWidth: convertInchesToMeters(30),
    doorCount: 1,
    panelDepth: convertInchesToMeters(22), // Default
    returnDepth: convertInchesToMeters(22), // Default
    leftReturn: false,
    rightReturn: false,
    showEdges: true,
    leftPanel: false,
    rightPanel: false,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(72),
    rightPanelHeight: convertInchesToMeters(72),
    leftReturnHeight: convertInchesToMeters(72),
    rightReturnHeight: convertInchesToMeters(72),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(72),
    doorPlacement: 'left',
    notchEnabled: false,
    notchHeight: convertInchesToMeters(6),
    notchDistanceFromBottom: convertInchesToMeters(0),
    notchSide: 'left',
    leftPanelNotchEnabled: false,
    leftPanelNotchWidth: convertInchesToMeters(4),
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
     backPanelWidth:0
  },
  "Door-and-Panel": {
    height: convertInchesToMeters(72),
    doorWidth: convertInchesToMeters(30),
    doorCount: 1,
    panelDepth: convertInchesToMeters(22), // Default
    returnDepth: convertInchesToMeters(22), // Default
    leftReturn: false,
    rightReturn: false,
    showEdges: true,
    leftPanel: true,
    rightPanel: false,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(72),
    rightPanelHeight: convertInchesToMeters(72),
    leftReturnHeight: convertInchesToMeters(72),
    rightReturnHeight: convertInchesToMeters(72),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(72),
    doorPlacement: 'left',
    notchEnabled: false,
    notchHeight: convertInchesToMeters(6),
    notchDistanceFromBottom: convertInchesToMeters(0),
    notchSide: 'left',
    leftPanelNotchEnabled: false,
    leftPanelNotchWidth: convertInchesToMeters(4),
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
     backPanelWidth:0
  },
  "Door-Panel-And-Return": {
    height: convertInchesToMeters(72),
    doorWidth: convertInchesToMeters(30),
    doorCount: 1,
    panelDepth: convertInchesToMeters(22), // Default
    returnDepth: convertInchesToMeters(22), // Default
    leftReturn: true,
    rightReturn: false,
    showEdges: true,
    leftPanel: true,
    rightPanel: false,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(72),
    rightPanelHeight: convertInchesToMeters(72),
    leftReturnHeight: convertInchesToMeters(72),
    rightReturnHeight: convertInchesToMeters(72),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(72),
    doorPlacement: 'left',
    notchEnabled: false,
    notchHeight: convertInchesToMeters(6),
    notchDistanceFromBottom: convertInchesToMeters(0),
    notchSide: 'left',
    leftPanelNotchEnabled: false,
    leftPanelNotchWidth: convertInchesToMeters(4),
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
     backPanelWidth:0
  },
  "Double-Door": {
    height: convertInchesToMeters(72),
    doorWidth: convertInchesToMeters(24), // Smaller width for double doors
    doorCount: 2,
    panelDepth: convertInchesToMeters(22), // Default
    returnDepth: convertInchesToMeters(22), // Default
    leftReturn: false,
    rightReturn: false,
    showEdges: true,
    leftPanel: false,
    rightPanel: false,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(72),
    rightPanelHeight: convertInchesToMeters(72),
    leftReturnHeight: convertInchesToMeters(72),
    rightReturnHeight: convertInchesToMeters(72),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(72),
    doorPlacement: 'left', // Default door placement
    notchEnabled: false,
    notchHeight: convertInchesToMeters(6),
    notchDistanceFromBottom: convertInchesToMeters(0),
    notchSide: 'left',
    leftPanelNotchEnabled: false,
    leftPanelNotchWidth: convertInchesToMeters(4),
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
     backPanelWidth:0
  },
  "Door-and-Nib": {
    height: convertInchesToMeters(72),
    doorWidth: convertInchesToMeters(30),
    doorCount: 1,
    panelDepth: convertInchesToMeters(22), // Default panel depth
    returnDepth: convertInchesToMeters(22), // Default
    leftReturn: false,
    rightReturn: false,
    showEdges: true,
    leftPanel: true,
    rightPanel: false,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(72),
    rightPanelHeight: convertInchesToMeters(72),
    leftReturnHeight: convertInchesToMeters(72),
    rightReturnHeight: convertInchesToMeters(72),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(72),
    doorPlacement: 'left',
    notchEnabled: true,
    notchHeight: convertInchesToMeters(22), // Default notch height
    notchDistanceFromBottom: convertInchesToMeters(0), // Default distance
    notchSide: 'left', // Notch on the left side of the panel
    leftPanelNotchEnabled: true,
    leftPanelNotchWidth: convertInchesToMeters(22), // Same width as left panel
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
     backPanelWidth:0
  },
  "Door-and-Notched-Panel": {
    height: convertInchesToMeters(72),
    doorWidth: convertInchesToMeters(30),
    doorCount: 1,
    panelDepth: convertInchesToMeters(22), // Default panel depth
    returnDepth: convertInchesToMeters(22), // Default
    leftReturn: false,
    rightReturn: false,
    showEdges: true,
    leftPanel: true,
    rightPanel: false,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(72),
    rightPanelHeight: convertInchesToMeters(72),
    leftReturnHeight: convertInchesToMeters(72),
    rightReturnHeight: convertInchesToMeters(72),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(72),
    doorPlacement: 'left',
    notchEnabled: true,
    notchHeight: convertInchesToMeters(22), // Default notch height
    notchDistanceFromBottom: convertInchesToMeters(0), // Default distance
    notchSide: 'left', // Notch on the left side of the panel
    leftPanelNotchEnabled: true,
    leftPanelNotchWidth: convertInchesToMeters(22 / 4), // 1/4 of left panel width
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: false,
    leftReturnNotchWidth: convertInchesToMeters(4),
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
     backPanelWidth:0
  },
  "Door-Panel-and-Notched-Return": { // Renamed for clarity
    height: convertInchesToMeters(72),
    doorWidth: convertInchesToMeters(30),
    doorCount: 1,
    panelDepth: convertInchesToMeters(22), // Default panel depth
    returnDepth: convertInchesToMeters(22), // Default return depth
    leftReturn: true,
    rightReturn: false,
    showEdges: true,
    leftPanel: true,
    rightPanel: false,
    glassType: "frosted",
    glassThickness: convertInchesToMeters(3 / 8),
    leftPanelHeight: convertInchesToMeters(72),
    rightPanelHeight: convertInchesToMeters(72),
    leftReturnHeight: convertInchesToMeters(72),
    rightReturnHeight: convertInchesToMeters(72),
    backPanel: false,
    backPanelHeight: convertInchesToMeters(72),
    doorPlacement: 'left',
    notchEnabled: true,
    notchHeight: convertInchesToMeters(22), // Default notch height
    notchDistanceFromBottom: convertInchesToMeters(0), // Default distance
    notchSide: 'left', // Notch on the left side of the panel/return
    leftPanelNotchEnabled: true,
    leftPanelNotchWidth: convertInchesToMeters(22 / 4), // 1/4 of left panel width
    rightPanelNotchEnabled: false,
    rightPanelNotchWidth: convertInchesToMeters(4),
    leftReturnNotchEnabled: true,
    leftReturnNotchWidth: convertInchesToMeters(22), // Same width as left return
    rightReturnNotchEnabled: false,
    rightReturnNotchWidth: convertInchesToMeters(4),
    leftReturnAngle: degreesToRadians(90),
    rightReturnAngle: degreesToRadians(90),
     backPanelWidth:0
  },
};