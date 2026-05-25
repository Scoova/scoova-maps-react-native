# Changelog

All notable changes to `@scoova/maps-react-native` are documented here.
Follows [Semantic Versioning](https://semver.org/).

## 1.1.0 — 2026-05-25

### Added
- `staticMapUrl(opts)` — pure URL builder for the static-map endpoint, ready
  for `<Image source={{ uri }} />`.
- `staticMap(opts)` — `Promise<Blob>` convenience that forwards
  `Accept-Language` when a locale is provided.
- `styleUrl(styleName, { apiKey, locale? })` — Scoova-compatible style URL
  builder usable straight from `<MapView styleURL={...} />`.
- `styleUrlForLocale(locale)` — convenience on `DEFAULTS.styleUrl`.
- `DEFAULT_API_BASE`, `DEFAULT_TILES_BASE` exports.
- LICENSE (Apache-2.0), CHANGELOG, `.gitignore`.

### Changed
- License is now Apache-2.0.

## 1.0.0 — 2026-05-05

- Initial release: `DEFAULTS`, `buildInlineStyle`, `routeFeature`,
  `markerFeature`, `bboxOf`.
