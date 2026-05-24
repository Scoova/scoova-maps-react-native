# @scoova/maps-react-native

Scoova map SDK for React Native. Two things in one package:

1. **MapLibre helpers** — `DEFAULTS`, `buildInlineStyle`, `routeFeature`,
   `markerFeature`, `bboxOf` to feed into `@maplibre/maplibre-react-native`.
2. **Standalone static-map + style URL builders** (`staticMapUrl`,
   `staticMap`, `styleUrl`) — pure functions, no peer deps, perfect for
   `<Image>` snapshots and share images.

```sh
npm install @scoova/maps-react-native @maplibre/maplibre-react-native
```

`@maplibre/maplibre-react-native` is only required if you render the live
map. The static-map and style URL helpers work standalone.

## Live map

```tsx
import { MapView, Camera, ShapeSource, LineLayer, CircleLayer } from '@maplibre/maplibre-react-native';
import {
  DEFAULTS,
  routeFeature,
  markerFeature,
  styleUrlForLocale,
} from '@scoova/maps-react-native';

const route = routeFeature([[31.24, 30.04], [31.25, 30.05], [31.26, 30.06]]);
const marker = markerFeature({ lat: 30.04, lon: 31.24 });

<MapView styleURL={styleUrlForLocale('fr')} style={{ flex: 1 }}>
  <Camera centerCoordinate={[DEFAULTS.defaultCenter.lon, DEFAULTS.defaultCenter.lat]} zoomLevel={12} />

  <ShapeSource id="route" shape={route.shape}>
    <LineLayer id="route-casing" style={route.casingPaint} />
    <LineLayer id="route" style={route.linePaint} />
  </ShapeSource>

  <ShapeSource id="me" shape={marker.shape}>
    <CircleLayer id="me-circle" style={marker.circlePaint} />
  </ShapeSource>
</MapView>
```

## Static map URL

```tsx
import { Image } from 'react-native';
import { staticMapUrl } from '@scoova/maps-react-native';

const uri = staticMapUrl({
  apiKey: 'sk_live_…',
  style: 'scoova-light',
  width: 600, height: 400,
  center: { lat: 30.0444, lon: 31.2357 }, zoom: 13,
  markers: [{ lat: 30.0444, lon: 31.2357, color: '#FF6A00' }],
  locale: 'fr',
});

<Image source={{ uri }} style={{ width: 300, height: 200 }} />
```

## Style URL

```tsx
import { styleUrl } from '@scoova/maps-react-native';

<MapView styleURL={styleUrl('scoova-dark', { apiKey: 'sk_live_…', locale: 'es' })} />
```

## API

### MapLibre helpers
- `DEFAULTS` — `styleUrl`, `tilesUrl`, `defaultCenter`, brand colors
- `styleUrlForLocale(locale)` — `DEFAULTS.styleUrl` + `?locale=…`
- `buildInlineStyle(opts)` — v8 style spec for `<MapView mapStyle={...} />`
- `routeFeature(coords, opts?)` — GeoJSON + paint props for two `LineLayer`s
- `markerFeature(latLng, opts?)` — GeoJSON + paint props for a `CircleLayer`
- `bboxOf(points)` — `[[minLon, minLat], [maxLon, maxLat]]`

### Static + style helpers
- `staticMapUrl({ style, width, height, center?, zoom?, markers?, paths?, padding?, apiKey, apiBase?, locale? }): string`
- `staticMap(opts): Promise<Blob>`
- `styleUrl(styleName, { apiKey, tilesBase?, locale? }): string`
- `DEFAULT_API_BASE`, `DEFAULT_TILES_BASE`

## Tests

```
npm test
```
