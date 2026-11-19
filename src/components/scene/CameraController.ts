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

const streetCamera = new THREE.Vector3(25.7, 4.1, 35.5);
const streetTarget = new THREE.Vector3(-0.7, 3.6, 2.1);
const streetPortrait = new THREE.Vector3(29.0, 8.2, 43.0);
const exteriorStart = new THREE.Vector3(84, 35, 111);
const exteriorEnd = new THREE.Vector3(73, 49, 116);
const atFacade = new THREE.Vector3(11, INTERIOR_Y + 4.2, 42);
const beforeDoor = new THREE.Vector3(-0.24, INTERIOR_Y + 1.96, ENTRY_Z + 1.47);
const inside = new THREE.Vector3(0.87, INTERIOR_Y + 1.87, 3.55);
const facadeTarget = new THREE.Vector3(0.25, INTERIOR_Y + 1.5, ENTRY_Z - 0.4);
const livingTarget = new THREE.Vector3(3.25, INTERIOR_Y + 1.5, -2.3);
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
  [0.562, 1.05, 2.68, 3.9, 1.25, 1.42],
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
  [third.at, -3.45, thirdDoor - 0.07, -5.12, 3.91, 1.29],
  [1, -3.45, thirdDoor - 0.07, -5.12, 3.91, 1.29],
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
  const guestRoom = range(progress, third.start, third.at);
  const portraitGuest = portrait ? range(progress, 0.965, third.at) : 0;
  camera.position.set(
    THREE.MathUtils.lerp(a[1], b[1], move) + portraitGuest * 0.23,
    INTERIOR_Y + eye,
    THREE.MathUtils.lerp(a[2], b[2], move) - portraitGuest * 0.52,
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
  const yaw = from.yaw + turn * move + portraitFraming + portraitGuest * 0.055;
  const pitch = THREE.MathUtils.lerp(from.pitch, to.pitch, move);
  target
    .set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch))
    .add(camera.position);
  camera.lookAt(target);
  const insideRooms = range(progress, LIVING_PROGRESS, 0.61);
  const narrowBath = range(progress, 0.797, 0.817) * (1 - range(progress, 0.833, 0.851));
  camera.fov =
    (portrait ? 58 : 55) +
    insideRooms * (portrait ? 7 : 4) +
    narrowBath * 8 +
    (portrait ? portraitGuest * 20 : guestRoom * 5);
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
  const build = range(exterior, 0.19, 0.6);
  const rise = range(exterior, 0.015, 0.28);
  camera.position.copy(exteriorStart).lerp(exteriorEnd, build);
  if (portrait) camera.position.multiplyScalar(1.53);
  camera.position.lerp(portrait ? streetPortrait : streetCamera, 1 - rise);
  camera.position.lerp(atFacade, orbit).lerp(beforeDoor, approach);
  // Cross the center of the threshold before moving sideways for the reveal.
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, inside.z, enter);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, inside.y, enter);
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, inside.x, range(enter, 0.32, 1));
  target.set(0, 25 + build * 10, 0).lerp(streetTarget, 1 - rise);
  target.lerp(facadeTarget, orbit);
  target.lerp(livingTarget, range(exterior, 0.921, 0.993));
  camera.lookAt(target);
  camera.fov =
    39 +
    (1 - rise) * (portrait ? 14 : 6) +
    range(exterior, 0.34, 0.63) * (1 - range(exterior, 0.72, 0.88)) * 2.5 +
    range(exterior, 0.87, 1) * (portrait ? 19 : 16);
  const centered = range(exterior, 0.73, 0.91);
  const horizontal = -(portrait ? 0.09 : 0.21) * (1 - centered) - (portrait ? 0 : 0.11) * enter;
  const vertical =
    -(portrait ? 0.165 + (1 - rise) * 0.07 : 0.035 * (1 - rise)) * (1 - centered) +
    (portrait ? 0.14 : 0) * enter;
  camera.setViewOffset(width, height, horizontal * width, vertical * height, width, height);
}
