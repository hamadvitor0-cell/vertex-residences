import { clamp } from './timeline.mjs';

export const LIVING_PROGRESS = 0.54;
export const buildingProgress = (progress) => clamp(progress / LIVING_PROGRESS);

export const tourStops = [
  {
    name: 'Living',
    title: 'Living integrado',
    start: 0.49,
    at: LIVING_PROGRESS,
    description:
      'Um apartamento de três quartos. A visita começa no living, com janelas amplas e acesso direto à varanda.',
  },
  {
    name: 'Cozinha',
    title: 'Cozinha aberta',
    start: 0.603,
    at: 0.629,
    description:
      'A ilha de pedra conecta o preparo das refeições à sala. A bancada lateral reúne pia, cooktop e armários.',
  },
  {
    name: 'Quarto 1',
    title: 'Quarto principal',
    start: 0.716,
    at: 0.741,
    description:
      'Cabeceira estofada, mesas laterais e luz indireta. A janela leva a vista da cidade para o quarto.',
  },
  {
    name: 'Banheiro',
    title: 'Banheiro',
    start: 0.799,
    at: 0.821,
    description:
      'A bancada suspensa libera o piso. Um painel de vidro separa o box, com nicho para os itens do banho.',
  },
  {
    name: 'Quarto 2',
    title: 'Segundo quarto',
    start: 0.878,
    at: 0.9,
    description: 'Uma cama de solteiro, armário embutido e bancada de estudos dividem o espaço.',
  },
  {
    name: 'Quarto 3',
    title: 'Terceiro quarto',
    start: 0.954,
    at: 0.979,
    description:
      'Uma cama de hóspedes e uma mesa de trabalho no mesmo cômodo, com luz natural voltada para a varanda.',
  },
];

export function activeTourStop(progress) {
  return tourStops.findLastIndex((stop) => progress >= stop.start);
}

export function activeTourStep(progress) {
  const room = activeTourStop(progress);
  if (room >= 0) return room + 3;
  const exterior = buildingProgress(progress);
  return exterior < 0.21 ? 0 : exterior < 0.52 ? 1 : 2;
}

export function visibleTowerFloors(progress) {
  return Math.min(22, Math.floor(buildingProgress(progress) * 45) + 1);
}

// Coordinates in the apartment's X/Z plane. Both the walls and camera use these door centers.
export const PARTITION_X = -2.95;
export const HALL_X = -2.19;
export const BATH_X = -1.42;
export const BATH_DOOR_Z = -3.62;
export const BATH_EAST_X = 0.12;
export const BATH_WALL_THICKNESS = 0.12;
export const LIVING_RUG = { x: 3.06, z: -1.15, width: 5.4, depth: 4.5 };
export const bedrooms = [
  { minZ: -4.73, maxZ: -1.52, doorZ: -3.93, bedX: -5.38, bedWidth: 1.79 },
  {
    minZ: -1.52,
    maxZ: 1.68,
    doorZ: -0.77,
    bedX: -5.99,
    bedWidth: 1.05,
    desk: { x: -3.96, fromWall: 0.43, width: 1.29 },
  },
  {
    minZ: 1.68,
    maxZ: 4.87,
    doorZ: 2.44,
    bedX: -5.91,
    bedWidth: 1.44,
    desk: { x: -3.9, fromWall: 0.48, width: 1.34 },
  },
];
