/**
 * Standalone static-map URL helpers + style URL builder for React Native.
 *
 * Pure functions — no peer dependency on `@maplibre/maplibre-react-native`.
 * Use them with `<Image source={{ uri }} />` for snapshots, or feed
 * `styleUrl()` into `<MapView styleURL={...} />` when you don't need the
 * `DEFAULTS` constants directly.
 *
 * Gateway:
 *   static map  -> https://api.scoo-va.info/api/v1/staticmap/{style}/static/{center}/{w}x{h}.png?…
 *   style URL   -> https://tiles.scoo-va.info/styles/{style}/style.json?…
 *
 * Locale: the gateway honours `?locale=` and `Accept-Language`. We always
 * append `?locale=` when supplied because `<Image>` has no header surface.
 */
import type { LngLat } from './style';

export const DEFAULT_API_BASE = 'https://api.scoo-va.info/api/v1';
export const DEFAULT_TILES_BASE = 'https://tiles.scoo-va.info';

export interface StaticMapMarker {
  lat: number;
  lon: number;
  /** Hex (`#FF6A00`) or named color (`red`). */
  color?: string;
  /** Built-in icon name, e.g. `pin`, `flag`. */
  icon?: string;
}

export interface StaticMapPath {
  coordinates: LngLat[];
  stroke?: string;
  width?: number;
}

export interface StaticMapOptions {
  style: string;
  width: number;
  height: number;
  center?: LngLat;
  zoom?: number;
  padding?: number;
  markers?: StaticMapMarker[];
  paths?: StaticMapPath[];
  /** API key — appended as `?api_key=…` (works for `<Image source={{uri}}/>`). */
  apiKey: string;
  /** Override the API base, default {@link DEFAULT_API_BASE}. */
  apiBase?: string;
  /** BCP-47 locale (`en`, `fr`, `ar-EG`, …). */
  locale?: string;
}

export interface StyleUrlOptions {
  apiKey: string;
  tilesBase?: string;
  locale?: string;
}

/** Pure URL builder. No network. */
export function staticMapUrl(opts: StaticMapOptions): string {
  const base = (opts.apiBase ?? DEFAULT_API_BASE).replace(/\/+$/, '');
  const params: string[] = [];
  if (opts.padding != null) params.push(`padding=${opts.padding}`);
  for (const m of opts.markers ?? []) {
    const parts: string[] = [];
    if (m.color) parts.push(`color:${m.color.replace('#', '%23')}`);
    if (m.icon) parts.push(`icon:${encodeURIComponent(m.icon)}`);
    parts.push(`${m.lat},${m.lon}`);
    params.push(`marker=${parts.join('|')}`);
  }
  for (const p of opts.paths ?? []) {
    if (p.coordinates.length < 2) continue;
    const parts: string[] = [];
    if (p.stroke) parts.push(`stroke:${p.stroke.replace('#', '%23')}`);
    if (p.width != null) parts.push(`width:${p.width}`);
    for (const c of p.coordinates) parts.push(`${c.lat},${c.lon}`);
    params.push(`path=${parts.join('|')}`);
  }
  if (opts.locale) params.push(`locale=${encodeURIComponent(opts.locale)}`);
  params.push(`api_key=${encodeURIComponent(opts.apiKey)}`);

  const sizeSeg = `${opts.width}x${opts.height}`;
  const centerSeg = opts.center && opts.zoom != null
    ? `${opts.center.lon},${opts.center.lat},${opts.zoom}`
    : 'auto';
  return `${base}/staticmap/${encodeURIComponent(opts.style)}/static/${centerSeg}/${sizeSeg}.png?${params.join('&')}`;
}

/**
 * Fetch the rendered PNG and return it as a {@link Blob}. Works on React
 * Native (RN's `fetch` supports `.blob()` out of the box). Throws on non-2xx.
 */
export async function staticMap(opts: StaticMapOptions): Promise<Blob> {
  const url = staticMapUrl(opts);
  const headers: Record<string, string> = {};
  if (opts.locale) headers['Accept-Language'] = opts.locale;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`staticMap: ${res.status} ${res.statusText}`);
  }
  return await res.blob();
}

/**
 * MapLibre-compatible style URL. Drop into
 * `<MapView styleURL={styleUrl('scoova-dark', { apiKey: '…' })} />`.
 */
export function styleUrl(styleName: string, opts: StyleUrlOptions): string {
  const base = (opts.tilesBase ?? DEFAULT_TILES_BASE).replace(/\/+$/, '');
  const parts = [`api_key=${encodeURIComponent(opts.apiKey)}`];
  if (opts.locale) parts.push(`locale=${encodeURIComponent(opts.locale)}`);
  return `${base}/styles/${encodeURIComponent(styleName)}/style.json?${parts.join('&')}`;
}
