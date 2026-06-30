/* app.js - GitHub-Pages-Karte fuer LimeSurvey
 *
 * Aufgabe:
 * - Rastertiles sichtbar darstellen.
 * - Minimalen Hitlayer laden.
 * - Bei Klick nur die opake cell_id an LimeSurvey senden.
 */

(function () {
  "use strict";

  const cfg = window.MAP_CONFIG || {};
  const statusEl = document.getElementById("status");

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function postSelection(cellId, latlng) {
    const message = {
      type: "limesurvey-map-selection",
      cell_id: String(cellId),
      lat: latlng ? latlng.lat : null,
      lon: latlng ? latlng.lng : null
    };

    // Bei iframe-Einbettung: Nachricht an LimeSurvey senden.
    const targetOrigin = cfg.ALLOWED_PARENT_ORIGIN || "*";
    window.parent.postMessage(message, targetOrigin);
  }

  const map = L.map("map", {
    minZoom: cfg.MIN_ZOOM,
    maxZoom: cfg.MAX_ZOOM,
    zoomControl: true
  }).setView(cfg.INITIAL_CENTER || [53.55, 10.0], cfg.INITIAL_ZOOM || 12);

  L.tileLayer(cfg.RASTER_TILE_URL || "tiles/{z}/{x}/{y}.png", {
    minZoom: cfg.MIN_ZOOM,
    maxZoom: cfg.MAX_ZOOM,
    attribution: cfg.RASTER_ATTRIBUTION || "",
    detectRetina: false,
    tms: false
  }).addTo(map);

  const selectedStyle = {
    color: "#000000",
    weight: Math.max(2, cfg.HIT_STROKE_WEIGHT || 1),
    opacity: 0.8,
    fillOpacity: 0.12
  };

  const normalStyle = {
    color: "#000000",
    weight: cfg.HIT_STROKE_WEIGHT ?? 1,
    opacity: cfg.HIT_STROKE_OPACITY ?? 0.15,
    fillOpacity: cfg.HIT_FILL_OPACITY ?? 0.01
  };

  let selectedLayer = null;

  function onHitClick(e) {
    const props = e.layer && e.layer.feature ? e.layer.feature.properties || {} : {};
    const idProp = cfg.ID_PROPERTY || "cell_id";
    const cellId = props[idProp];

    if (cellId === undefined || cellId === null || cellId === "") {
      setStatus("Dieser Bereich hat keine gueltige ID.");
      return;
    }

    if (selectedLayer) selectedLayer.setStyle(normalStyle);
    selectedLayer = e.layer;
    selectedLayer.setStyle(selectedStyle);

    setStatus("Auswahl: " + cellId);
    postSelection(cellId, e.latlng);
  }

  fetch(cfg.HITLAYER_URL || "data/hitlayer.geojson", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("Hitlayer konnte nicht geladen werden: HTTP " + response.status);
      return response.json();
    })
    .then((geojson) => {
      const hitLayer = L.geoJSON(geojson, {
        style: normalStyle,
        onEachFeature: function (_feature, layer) {
          layer.on("click", onHitClick);
          layer.on("mouseover", function () {
            layer.setStyle({ opacity: 0.45, fillOpacity: 0.06 });
          });
          layer.on("mouseout", function () {
            if (layer !== selectedLayer) layer.setStyle(normalStyle);
          });
        }
      }).addTo(map);

      try {
        const b = hitLayer.getBounds();
        if (b.isValid()) map.fitBounds(b.pad(0.05));
      } catch (_err) {
        // ignore
      }

      setStatus(cfg.HELP_TEXT || "Bitte klicken Sie in den gewuenschten Bereich.");
    })
    .catch((err) => {
      console.error(err);
      setStatus("Fehler: " + err.message);
    });
})();
