import { DEFAULTS } from './defaults';

export interface LngLat { lon: number; lat: number; }

export interface ScoovaStyleOptions {
  styleUrl?: string;
  rasterUrls?: string[];
  buildings3d?: boolean;
}

export interface MaplibreStyleSpec {
  version: 8;
  name?: string;
  sources: Record<string, unknown>;
  layers: Array<Record<string, unknown>>;
  glyphs?: string;
  sprite?: string;
}

export function buildInlineStyle(options: ScoovaStyleOptions = {}): MaplibreStyleSpec {
  const sources: Record<string, unknown> = {
    'scoova-vector': {
      type: 'vector',
      tiles: [DEFAULTS.tilesUrl],
      minzoom: DEFAULTS.minZoom,
      maxzoom: DEFAULTS.maxZoom,
      attribution: DEFAULTS.attribution,
    },
  };
  if (options.rasterUrls?.length) {
    sources['scoova-raster'] = { type: 'raster', tiles: options.rasterUrls, tileSize: 256 };
  }

  const layers: Array<Record<string, unknown>> = [
    { id: 'background', type: 'background', paint: { 'background-color': '#F8FAFC' } },
  ];
  if (options.rasterUrls?.length) {
    layers.push({ id: 'raster', type: 'raster', source: 'scoova-raster' });
  }
  if (options.buildings3d !== false) {
    layers.push({
      id: 'buildings-3d',
      type: 'fill-extrusion',
      source: 'scoova-vector',
      'source-layer': 'building',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#E2E8F0',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 10],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.85,
      },
    });
  }
  return { version: 8, name: 'Scoova Default', sources, layers };
}

export interface RouteFeature {
  /** GeoJSON Feature ready for MapLibre's <ShapeSource /> in maplibre-react-native. */
  shape: {
    type: 'Feature';
    properties: Record<string, unknown>;
    geometry: { type: 'LineString'; coordinates: Array<[number, number]> };
  };
  /** Paint props for the casing line layer. */
  casingPaint: Record<string, unknown>;
  /** Paint props for the primary line layer. */
  linePaint: Record<string, unknown>;
}

export function routeFeature(
  coords: Array<[number, number]>,
  options: { color?: string; casingColor?: string; width?: number; alternate?: boolean } = {},
): RouteFeature {
  const color = options.color ?? (options.alternate ? DEFAULTS.colors.routeAlternate : DEFAULTS.colors.routePrimary);
  const casingColor = options.casingColor ?? DEFAULTS.colors.routeCasing;
  const width = options.width ?? 6;
  return {
    shape: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: coords },
    },
    casingPaint: {
      lineColor: casingColor,
      lineWidth: width + 3,
      lineOpacity: options.alternate ? 0.4 : 0.7,
      lineCap: 'round',
      lineJoin: 'round',
    },
    linePaint: {
      lineColor: color,
      lineWidth: width,
      lineOpacity: options.alternate ? 0.6 : 1.0,
      lineCap: 'round',
      lineJoin: 'round',
      ...(options.alternate ? { lineDasharray: [2, 2] } : {}),
    },
  };
}

export interface MarkerFeature {
  shape: {
    type: 'Feature';
    properties: Record<string, unknown>;
    geometry: { type: 'Point'; coordinates: [number, number] };
  };
  circlePaint: Record<string, unknown>;
}

export function markerFeature(
  position: LngLat,
  options: { color?: string; radius?: number; properties?: Record<string, unknown> } = {},
): MarkerFeature {
  return {
    shape: {
      type: 'Feature',
      properties: options.properties ?? {},
      geometry: { type: 'Point', coordinates: [position.lon, position.lat] },
    },
    circlePaint: {
      circleRadius: options.radius ?? 8,
      circleColor: options.color ?? DEFAULTS.colors.markerFill,
      circleStrokeWidth: 2,
      circleStrokeColor: DEFAULTS.colors.markerStroke,
    },
  };
}

/** Compute a bbox `[[minLon, minLat], [maxLon, maxLat]]` for `MapView.fitBounds`. */
export function bboxOf(points: LngLat[]): [[number, number], [number, number]] | null {
  if (!points.length) return null;
  let minLon = points[0].lon, maxLon = points[0].lon;
  let minLat = points[0].lat, maxLat = points[0].lat;
  for (const p of points) {
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
  }
  return [[minLon, minLat], [maxLon, maxLat]];
}
