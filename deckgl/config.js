// deckgl/config.js - alternative WebGL-Karte fuer LimeSurvey

window.DECK_MAP_CONFIG = {
  INITIAL_CENTER: [53.93, 9.51], // [lat, lon]
  INITIAL_ZOOM: 12,
  MIN_ZOOM: 5,
  MAX_ZOOM: 15,

  // OSM bleibt bis Zoom 15 scharf genug fuer die Haussuche.
  BASEMAP_TILE_URL: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  BASEMAP_ATTRIBUTION: "&copy; OpenStreetMap contributors",

  // Gleicher minimaler Hitlayer wie die Leaflet-Version, ohne erneuten Upload grosser Dateien.
  HITLAYER_URL: "../data/hitlayer.geojson",
  ID_PROPERTY: "cell_id",

  LIMIT_TO_HITLAYER_BOUNDS: true,
  MAX_BOUNDS_PADDING: 0.08,

  // Sehr transparente Standarddarstellung, aber WebGL-pickbar.
  HIT_FILL_ALPHA: 4,
  HIT_STROKE_ALPHA: 28,
  SELECTED_FILL_ALPHA: 45,
  SELECTED_STROKE_ALPHA: 220,

  ALLOWED_PARENT_ORIGIN: "*",
  HELP_TEXT: "Bitte klicken Sie in den gewuenschten Bereich."
};
