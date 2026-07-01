// config.js - alle wichtigen Einstellungen fuer die GitHub-Pages-Karte
// Diese Datei anpassen, danach das gesamte Verzeichnis "github-pages" in dein GitHub-Pages-Repo kopieren.

window.MAP_CONFIG = {
  // Sichtbarer Kartenausschnitt beim Start
  INITIAL_CENTER: [53.93, 9.51], // [lat, lon]
  INITIAL_ZOOM: 12,
  MIN_ZOOM: 5,
  MAX_ZOOM: 15,

  // Datenschutzfreundlicher Standard: Die Rastertiles enthalten bereits die sichtbare Karte.
  // Wenn die PNGs nur ein transparentes Overlay sind, BASEMAP_TILE_URL setzen und RASTER_IS_OVERLAY auf true.
  BASEMAP_TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  BASEMAP_ATTRIBUTION: "&copy; OpenStreetMap contributors",

  // Rastertiles: statische PNG/JPG/WebP-Tiles im Repo, z.B. github-pages/tiles/12/2200/1343.png
  // Standard: gleiche Domain wie index.html, dadurch keine CORS-Probleme im iframe.
  RASTER_TILE_URL: "tiles/{z}/{x}/{y}.png",
  RASTER_ATTRIBUTION: "",
  RASTER_IS_OVERLAY: false,
  RASTER_OPACITY: 1,

  // Unsichtbarer/halbtransparenter Hitlayer. Darf nur oeffentlich unkritische Daten enthalten.
  HITLAYER_URL: "data/hitlayer.geojson",
  ID_PROPERTY: "cell_id",

  // Darstellung der Hitobjekte. Fuer Produktivbetrieb besser sehr transparent/unsichtbar.
  HIT_FILL_OPACITY: 0.01,
  HIT_STROKE_OPACITY: 0.15,
  HIT_STROKE_WEIGHT: 1,

  // Sicherheitsnetz: Parent-Origin eintragen, sobald bekannt.
  // Beispiel: "https://survey.example.org". Fuer lokalen Test kann "*" bleiben.
  // In Produktivbetrieb nicht "*" verwenden.
  ALLOWED_PARENT_ORIGIN: "*",

  // Optional: Hinweistext in der Karte
  HELP_TEXT: "Bitte klicken Sie in den gewuenschten Bereich."
};
