import {
  DEFAULTS,
  buildInlineStyle,
  routeFeature,
  markerFeature,
  bboxOf,
  staticMapUrl,
  staticMap,
  styleUrl,
  styleUrlForLocale,
  DEFAULT_API_BASE,
  DEFAULT_TILES_BASE,
} from '../src/index';

describe('DEFAULTS', () => {
  it('points at scoo-va.info', () => {
    expect(DEFAULTS.styleUrl).toBe('https://tiles.scoo-va.info/style.json');
    expect(DEFAULTS.tilesUrl).toBe('https://tiles.scoo-va.info/v1/{z}/{x}/{y}.mvt');
    expect(DEFAULTS.defaultCenter.lat).toBeCloseTo(30.0444);
    expect(DEFAULTS.defaultCenter.lon).toBeCloseTo(31.2357);
  });
});

describe('buildInlineStyle', () => {
  it('produces a v8 style with Scoova vector source', () => {
    const style = buildInlineStyle();
    expect(style.version).toBe(8);
    const src = style.sources['scoova-vector'] as Record<string, unknown>;
    expect((src.tiles as string[])[0]).toBe(DEFAULTS.tilesUrl);
    expect(style.layers.find((l) => l.id === 'buildings-3d')).toBeDefined();
  });

  it('omits buildings-3d when disabled', () => {
    const style = buildInlineStyle({ buildings3d: false });
    expect(style.layers.find((l) => l.id === 'buildings-3d')).toBeUndefined();
  });
});

describe('routeFeature', () => {
  it('produces a LineString feature with paint props', () => {
    const f = routeFeature([[31.24, 30.04], [31.25, 30.05]]);
    expect(f.shape.geometry.type).toBe('LineString');
    expect(f.shape.geometry.coordinates).toHaveLength(2);
    expect(f.linePaint.lineColor).toBe(DEFAULTS.colors.routePrimary);
    expect(f.casingPaint.lineColor).toBe(DEFAULTS.colors.routeCasing);
  });

  it('uses alternate styling when alternate=true', () => {
    const f = routeFeature([[0, 0], [1, 1]], { alternate: true });
    expect(f.linePaint.lineColor).toBe(DEFAULTS.colors.routeAlternate);
    expect(f.linePaint.lineDasharray).toEqual([2, 2]);
  });
});

describe('markerFeature', () => {
  it('produces a Point feature with paint props', () => {
    const f = markerFeature({ lat: 30.04, lon: 31.24 }, { properties: { name: 'X' } });
    expect(f.shape.geometry.type).toBe('Point');
    expect(f.shape.geometry.coordinates).toEqual([31.24, 30.04]);
    expect(f.shape.properties.name).toBe('X');
    expect(f.circlePaint.circleColor).toBe(DEFAULTS.colors.markerFill);
  });
});

describe('bboxOf', () => {
  it('returns null for an empty array', () => {
    expect(bboxOf([])).toBeNull();
  });

  it('computes bounds correctly', () => {
    const bb = bboxOf([{ lat: 30, lon: 31 }, { lat: 32, lon: 29 }, { lat: 31, lon: 33 }]);
    expect(bb).toEqual([[29, 30], [33, 32]]);
  });
});

describe('staticMapUrl', () => {
  it('builds an explicit-center URL pointing at the API gateway', () => {
    const url = staticMapUrl({
      apiKey: 'k123', style: 'scoova-light',
      width: 600, height: 400,
      center: { lat: 30.0444, lon: 31.2357 }, zoom: 13,
    });
    expect(url.startsWith(`${DEFAULT_API_BASE}/staticmap/scoova-light/static/`)).toBe(true);
    expect(url).toContain('/static/31.2357,30.0444,13/');
    expect(url).toContain('600x400.png');
    expect(url).toContain('api_key=k123');
  });

  it('uses /auto/ when no center is supplied', () => {
    const url = staticMapUrl({
      apiKey: 'k', style: 'scoova-dark', width: 100, height: 100,
      markers: [{ lat: 30, lon: 31 }],
    });
    expect(url).toContain('/static/auto/');
  });

  it('serialises markers, drops empty-coord paths, forwards locale', () => {
    const url = staticMapUrl({
      apiKey: 'k', style: 's', width: 1, height: 1,
      markers: [{ lat: 30, lon: 31, color: '#FF6A00', icon: 'pin' }],
      paths: [
        { coordinates: [{ lat: 30, lon: 31 }, { lat: 31, lon: 32 }], stroke: '#0EA5E9', width: 4 },
        { coordinates: [{ lat: 0, lon: 0 }] },
      ],
      locale: 'ar-EG',
    });
    expect(url).toContain('marker=color:%23FF6A00|icon:pin|30,31');
    expect(url).toContain('path=stroke:%230EA5E9|width:4|30,31|31,32');
    expect((url.match(/path=/g) ?? []).length).toBe(1);
    expect(url).toContain('locale=ar-EG');
  });

  it('honours apiBase override and strips trailing slash', () => {
    const url = staticMapUrl({
      apiKey: 'k', style: 's', width: 1, height: 1,
      apiBase: 'https://gateway.example.test/api/v1/',
    });
    expect(url.startsWith('https://gateway.example.test/api/v1/staticmap/')).toBe(true);
  });
});

describe('staticMap (fetch wrapper)', () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('forwards Accept-Language and returns a Blob', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' });
    const fetchMock: jest.Mock = jest.fn().mockResolvedValue({
      ok: true, status: 200, statusText: 'OK', blob: () => Promise.resolve(blob),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const out = await staticMap({
      apiKey: 'k', style: 's', width: 1, height: 1, locale: 'fr',
    });
    expect(out).toBe(blob);
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers['Accept-Language']).toBe('fr');
  });

  it('throws on non-2xx', async () => {
    const fetchMock: jest.Mock = jest.fn().mockResolvedValue({
      ok: false, status: 403, statusText: 'Forbidden', blob: () => Promise.resolve(new Blob()),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    await expect(staticMap({ apiKey: 'k', style: 's', width: 1, height: 1 }))
      .rejects.toThrow(/403 Forbidden/);
  });
});

describe('styleUrl', () => {
  it('points at tiles.scoo-va.info by default', () => {
    const url = styleUrl('scoova-light', { apiKey: 'k' });
    expect(url.startsWith(`${DEFAULT_TILES_BASE}/styles/scoova-light/style.json?`)).toBe(true);
    expect(url).toContain('api_key=k');
  });

  it('forwards locale and supports tilesBase override', () => {
    const url = styleUrl('scoova-dark', {
      apiKey: 'k', locale: 'pt-BR', tilesBase: 'https://my-tiles.example.test/',
    });
    expect(url.startsWith('https://my-tiles.example.test/styles/scoova-dark/style.json?')).toBe(true);
    expect(url).toContain('locale=pt-BR');
  });
});

describe('styleUrlForLocale', () => {
  it('returns the default style URL when given an empty string', () => {
    expect(styleUrlForLocale('')).toBe(DEFAULTS.styleUrl);
  });
  it('appends a ?locale=… query', () => {
    expect(styleUrlForLocale('fr')).toBe(`${DEFAULTS.styleUrl}?locale=fr`);
  });
});
