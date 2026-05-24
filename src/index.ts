/**
 * @scoova/maps-react-native
 *
 * Wraps `@maplibre/maplibre-react-native` with Scoova defaults. We deliberately
 * do not re-export the maplibre-rn components — apps install
 * `@maplibre/maplibre-react-native` directly and pass our `DEFAULTS.styleUrl`
 * to its `<MapView />`. This package ships the data builders + types that keep
 * apps off the boilerplate.
 */

export { DEFAULTS } from './defaults';
export type { ScoovaColors } from './defaults';
export {
  buildInlineStyle,
  routeFeature,
  markerFeature,
  bboxOf,
} from './style';
export type {
  LngLat,
  ScoovaStyleOptions,
  MaplibreStyleSpec,
  RouteFeature,
  MarkerFeature,
} from './style';
export {
  staticMapUrl,
  staticMap,
  styleUrl,
  DEFAULT_API_BASE,
  DEFAULT_TILES_BASE,
} from './static-map';
export type {
  StaticMapMarker,
  StaticMapPath,
  StaticMapOptions,
  StyleUrlOptions,
} from './static-map';
export { styleUrlForLocale } from './defaults';
