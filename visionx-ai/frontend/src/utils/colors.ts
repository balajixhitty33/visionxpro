// Consistent distinct colors for common COCO object classes
export const OBJECT_COLORS: Record<string, string> = {
  person: '#2F80FF',
  bicycle: '#18C8FF',
  car: '#3B8DFF',
  motorcycle: '#06B6D4',
  airplane: '#38BDF8',
  bus: '#2563EB',
  train: '#1D4ED8',
  truck: '#60A5FA',
  boat: '#0EA5E9',
  'traffic light': '#F59E0B',
  'fire hydrant': '#EF4444',
  'stop sign': '#DC2626',
  bench: '#10B981',
  bird: '#34D399',
  cat: '#F472B6',
  dog: '#EC4899',
  horse: '#D946EF',
  backpack: '#8B5CF6',
  umbrella: '#A855F7',
  handbag: '#C084FC',
  tie: '#6366F1',
  suitcase: '#818CF8',
  bottle: '#22C55E',
  'wine glass': '#4ADE80',
  cup: '#A3E635',
  fork: '#84CC16',
  knife: '#65A30D',
  spoon: '#4D7C0F',
  bowl: '#16A34A',
  chair: '#F97316',
  couch: '#FB923C',
  'potted plant': '#10B981',
  bed: '#FB7185',
  'dining table': '#E11D48',
  tv: '#38BDF8',
  laptop: '#18C8FF',
  mouse: '#818CF8',
  remote: '#A78BFA',
  keyboard: '#6366F1',
  'cell phone': '#2F80FF',
  book: '#F59E0B',
  clock: '#EAB308',
  vase: '#14B8A6',
};

const DEFAULT_PALETTE = [
  '#2F80FF', '#18C8FF', '#3B8DFF', '#22C55E', 
  '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#10B981', '#6366F1', '#F97316', '#14B8A6'
];

export function getObjectColor(className: string): string {
  const normalized = className.toLowerCase().trim();
  if (OBJECT_COLORS[normalized]) {
    return OBJECT_COLORS[normalized];
  }
  // Hash class name for consistent color assignment
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_PALETTE.length;
  return DEFAULT_PALETTE[index];
}

export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
