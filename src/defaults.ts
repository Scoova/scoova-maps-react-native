/**
 * Scoova map defaults — kept identical across web, RN, Flutter, iOS, Android.
 */
export const DEFAULTS = {
  styleUrl: 'https://tiles.scoo-va.info/style.json',
  tilesUrl: 'https://tiles.scoo-va.info/v1/{z}/{x}/{y}.mvt',
  attribution: '© Scoova · OpenStreetMap contributors',
  defaultCenter: { lat: 30.0444, lon: 31.2357 },
  defaultZoom: 12,
  minZoom: 0,
  maxZoom: 22,
  colors: {
    routePrimary: '#0EA5E9',
    routeCasing: '#0369A1',
    routeAlternate: '#94A3B8',
    routeProgress: '#10B981',
    markerFill: '#0EA5E9',
    markerStroke: '#FFFFFF',
  },
} as const;

export type ScoovaColors = typeof DEFAULTS.colors;

/**
 * Returns `DEFAULTS.styleUrl` with `?locale=<locale>` appended. Feed straight
 * into `<MapView styleURL={...} />` so labels render in the caller's locale.
 */
export function styleUrlForLocale(locale: string): string {
  if (!locale) return DEFAULTS.styleUrl;
  return `${DEFAULTS.styleUrl}?locale=${encodeURIComponent(locale)}`;
}
