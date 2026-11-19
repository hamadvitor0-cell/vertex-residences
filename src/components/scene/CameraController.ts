import * as THREE from 'three';
import { INTERIOR_Y, range, sceneState } from '../../lib/timeline.mjs';
import {
  BATH_DOOR_Z,
  BATH_X,
  HALL_X,
  LIVING_PROGRESS,
  PARTITION_X,
  bedrooms,
  buildingProgress,
  tourStops,
} from '../../lib/apartmentTour.mjs';
import { ENTRY_Z } from './InteriorModel';

const exteriorStart = new THREE.Vector3(91, 42, 114);
const exteriorEnd = new THREE.Vector3(82, 51, 121);
const atFacade = new THREE.Vector3(11, INTERIOR_Y + 4.2, 42);
const beforeDoor = new THREE.Vector3(-0.24, INTERIOR_Y + 1.96, ENTRY_Z + 1.47);
const inside = new THREE.Vector3(-2.55, INTERIOR_Y + 1.87, 3.15);
const facadeTarget = new THREE.Vector3(0.25, INTERIOR_Y + 1.5, ENTRY_Z - 0.4);
const livingTarget = new THREE.Vector3(2.8, INTERIOR_Y + 1.5, -2.65);
const target = new THREE.Vector3();

type Waypoint = [
  progress: number,
  x: number,
  z: number,
  lookX: number,
  lookZ: number,
  lookHeight: number,
];
const [living, kitchen, main, bath, second, third] = tourStops;
const [mainDoor, secondDoor, thirdDoor] = bedrooms.map((room) => room.doorZ);
const eye = 1.87;

// Turn at the door, move along its centerline, then look across the room.
const path: Waypoint[] = [
  [living.at, inside.x, inside.z, livingTarget.x, livingTarget.z, 1.5],
  [0.562, -1.74, 2.65, 3.9, 1.25, 1.42],
  [0.602, 1.2, 2.05, 4.62, 3.28, 1.35],
  [kitchen.at, 2.05, 1.72, 5.3, 3.62, 1.42],
  [0.642, 2.05, 1.72, 4.25, 3.54, 1.42],
  [0.665, -0.65, 1.54, -2.27, -1.21, 1.5],
  [0.681, HALL_X, 0.34, HALL_X, -3.68, 1.59],
  [0.709, HALL_X, mainDoor, -4.85, mainDoor + 0.38, 1.41],
  [0.72, PARTITION_X - 0.2, mainDoor, -5.45, -2.7, 1.29],
  [main.at, -3.76, mainDoor + 0.1, -5.61, -2.51, 1.27],
  [0.75, -3.76, mainDoor + 0.1, -5.61, -2.51, 1.27],
  [0.766, HALL_X, mainDoor, -4.25, mainDoor + 0.09, 1.48],
  [0.785, HALL_X, BATH_DOOR_Z, -0.28, -3.29, 1.34],
  [0.804, BATH_X + 0.14, BATH_DOOR_Z, -0.19, -2.89, 1.36],
  [bath.at, -1.2, -4.53, -0.33, -3.12, 1.3],
  [0.831, -1.2, -4.53, -0.33, -3.12, 1.3],
  [0.841, BATH_X + 0.19, BATH_DOOR_Z, -0.4, -3.06, 1.39],
  [0.851, HALL_X, BATH_DOOR_Z, HALL_X, -0.94, 1.53],
  [0.869, HALL_X, secondDoor, -4.53, -0.28, 1.31],
  [0.883, PARTITION_X - 0.26, secondDoor, -5.46, 0.17, 1.24],
  [second.at, -3.69, secondDoor + 0.08, -5.91, 0.62, 1.24],
  [0.909, -3.69, secondDoor + 0.08, -5.91, 0.62, 1.24],
  [0.923, HALL_X, secondDoor, HALL_X, 2.41, 1.47],
  [0.946, HALL_X, thirdDoor, -4.42, 2.79, 1.31],
  [0.961, PARTITION_X - 0.24, thirdDoor, -5.63, 3.22, 1.31],
  [third.at, -3.65, thirdDoor + 0.06, -5.55, 3.91, 1.24],
  [1, -3.65, thirdDoor + 0.06, -5.55, 3.91, 1.24],
];

function orientation([, x, z, lookX, lookZ, lookHeight]: Waypoint) {
  const dx = lookX - x;
  const dz = lookZ - z;
  return {
    yaw: Math.atan2(dx, dz),
    pitch: Math.atan2(lookHeight - eye, Math.hypot(dx, dz)),
  };
}

function tourCamera(
  camera: THREE.PerspectiveCamera,
  progress: number,
  portrait: boolean,
  width: number,
  height: number,
) {
  const index = path.findIndex((point) => point[0] >= progress);
  const a = path[index - 1];
  const b = path[index];
  const move = range(progress, a[0], b[0]);
  camera.position.set(
    THREE.MathUtils.lerp(a[1], b[1], move),
    INTERIOR_Y + eye,
    THREE.MathUtils.lerp(a[2], b[2], move),
  );
  const from = orientation(a);
  const to = orientation(b);
  const turn = THREE.MathUtils.euclideanModulo(to.yaw - from.yaw + Math.PI, 2 * Math.PI) - Math.PI;
  const portraitFraming = portrait
    ? [main, second, third].reduce(
        (shift, stop) =>
          shift +
          0.16 *
            range(progress, stop.start, stop.at) *
            (1 - range(progress, stop.at + 0.006, stop.at + 0.022)),
        0,
      )
    : 0;
  const yaw = from.yaw + turn * move + portraitFraming;
  const pitch = THREE.MathUtils.lerp(from.pitch, to.pitch, move);
  target
    .set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch))
    .add(camera.position);
  camera.lookAt(target);
  const insideRooms = range(progress, LIVING_PROGRESS, 0.61);
  const narrowBath = range(progress, 0.797, 0.817) * (1 - range(progress, 0.833, 0.851));
  camera.fov = (portrait ? 58 : 55) + insideRooms * (portrait ? 7 : 4) + narrowBath * 8;
  camera.setViewOffset(
    width,
    height,
    portrait ? 0 : -(0.11 + 0.06 * insideRooms) * width,
    portrait ? 0.14 * height : 0,
    width,
    height,
  );
}

export function updateCamera(
  camera: THREE.PerspectiveCamera,
  progress: number,
  width: number,
  height: number,
) {
  const portrait = width / height < 0.85;
  if (progress > LIVING_PROGRESS) {
    tourCamera(camera, progress, portrait, width, height);
    return;
  }
  const exterior = buildingProgress(progress);
  const { orbit, approach, interior: enter } = sceneState(exterior);
  const build = range(exterior, 0.02, 0.6);
  camera.position.copy(exteriorStart).lerp(exteriorEnd, build);
  if (portrait) camera.position.multiplyScalar(1.48);
  camera.position.lerp(atFacade, orbit).lerp(beforeDoor, approach);
  // Cross the center of the threshold before moving sideways for the reveal.
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, inside.z, enter);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, inside.y, enter);
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, inside.x, range(enter, 0.32, 1));
  target.set(0, 28 + build * 5, 0);
  target.lerp(facadeTarget, orbit);
  target.lerp(livingTarget, range(exterior, 0.921, 0.993));
  camera.lookAt(target);
  camera.fov = 39 + range(exterior, 0.87, 1) * (portrait ? 19 : 16);
  const centered = range(exterior, 0.73, 0.91);
  const horizontal = -(portrait ? 0.115 : 0.23) * (1 - centered) - (portrait ? 0 : 0.11) * enter;
  const vertical = -(portrait ? 0.175 : 0) * (1 - centered) + (portrait ? 0.14 : 0) * enter;
  camera.setViewOffset(width, height, horizontal * width, vertical * height, width, height);
}
