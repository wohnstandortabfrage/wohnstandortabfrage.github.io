/* deckgl/assets/app.js - WebGL-Variante der LimeSurvey-Karte */

(function () {
  "use strict";

  const cfg = window.DECK_MAP_CONFIG || {};
  const statusEl = document.getElementById("status");

  let deckInstance = null;
  let geojsonData = null;
  let selectedId = null;
  let paddedBounds = null;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function getFeatureId(feature) {
    const props = feature && feature.properties ? feature.properties : {};
    return props[cfg.ID_PROPERTY || "cell_id"];
  }

  function isSelected(feature) {
    const id = getFeatureId(feature);
    return selectedId !== null && selectedId !== undefined && String(id) === String(selectedId);
  }

  function postSelection(cellId, coordinate) {
    const message = {
      type: "limesurvey-map-selection",
      cell_id: String(cellId),
      lat: coordinate ? coordinate[1] : null,
      lon: coordinate ? coordinate[0] : null
    };

    window.parent.postMessage(message, cfg.ALLOWED_PARENT_ORIGIN || "*");
  }

  function extendBounds(bounds, coord) {
    if (!Array.isArray(coord) || coord.length < 2) return bounds;
    const lon = coord[0];
    const lat = coord[1];
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return bounds;

    bounds.minLng = Math.min(bounds.minLng, lon);
    bounds.minLat = Math.min(bounds.minLat, lat);
    bounds.maxLng = Math.max(bounds.maxLng, lon);
    bounds.maxLat = Math.max(bounds.maxLat, lat);
    return bounds;
  }

  function walkCoordinates(coords, bounds) {
    if (!Array.isArray(coords)) return bounds;
    if (typeof coords[0] === "number") return extendBounds(bounds, coords);
    coords.forEach((item) => walkCoordinates(item, bounds));
    return bounds;
  }

  function getGeoJsonBounds(geojson) {
    const bounds = {
      minLng: Infinity,
      minLat: Infinity,
      maxLng: -Infinity,
      maxLat: -Infinity
    };

    const features = geojson && geojson.type === "FeatureCollection"
      ? geojson.features || []
      : [geojson];

    features.forEach((feature) => {
      if (feature && feature.geometry) walkCoordinates(feature.geometry.coordinates, bounds);
    });

    if (!Number.isFinite(bounds.minLng) || !Number.isFinite(bounds.minLat)) return null;
    return bounds;
  }

  function padBounds(bounds, padding) {
    const lngSpan = Math.max(bounds.maxLng - bounds.minLng, 0.001);
    const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.001);
    return {
      minLng: bounds.minLng - lngSpan * padding,
      minLat: bounds.minLat - latSpan * padding,
      maxLng: bounds.maxLng + lngSpan * padding,
      maxLat: bounds.maxLat + latSpan * padding
    };
  }

  function clampViewState(viewState) {
    if (!paddedBounds || cfg.LIMIT_TO_HITLAYER_BOUNDS === false) return viewState;

    return {
      ...viewState,
      longitude: Math.min(Math.max(viewState.longitude, paddedBounds.minLng), paddedBounds.maxLng),
      latitude: Math.min(Math.max(viewState.latitude, paddedBounds.minLat), paddedBounds.maxLat)
    };
  }

  function getInitialViewState(bounds) {
    const fallback = {
      longitude: (cfg.INITIAL_CENTER || [53.55, 10.0])[1],
      latitude: (cfg.INITIAL_CENTER || [53.55, 10.0])[0],
      zoom: cfg.INITIAL_ZOOM || 12,
      minZoom: cfg.MIN_ZOOM,
      maxZoom: cfg.MAX_ZOOM,
      pitch: 0,
      bearing: 0
    };

    if (!bounds || !deck.WebMercatorViewport) return fallback;

    const width = Math.max(window.innerWidth || 1, 1);
    const height = Math.max(window.innerHeight || 1, 1);
    const viewport = new deck.WebMercatorViewport({ width, height });
    const fitted = viewport.fitBounds(
      [
        [bounds.minLng, bounds.minLat],
        [bounds.maxLng, bounds.maxLat]
      ],
      { padding: 40 }
    );

    return {
      ...fallback,
      longitude: fitted.longitude,
      latitude: fitted.latitude,
      zoom: Math.min(Math.max(fitted.zoom, cfg.MIN_ZOOM || 0), cfg.MAX_ZOOM || fitted.zoom)
    };
  }

  function createLayers() {
    const layers = [];

    if (cfg.BASEMAP_TILE_URL) {
      layers.push(new deck.TileLayer({
        id: "osm-basemap",
        data: cfg.BASEMAP_TILE_URL,
        minZoom: cfg.MIN_ZOOM,
        maxZoom: cfg.MAX_ZOOM,
        tileSize: 256,
        refinementStrategy: "no-overlap",
        renderSubLayers: function (props) {
          const bbox = props.tile.bbox;
          return new deck.BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [bbox.west, bbox.south, bbox.east, bbox.north]
          });
        }
      }));
    }

    layers.push(new deck.GeoJsonLayer({
      id: "hit-polygons",
      data: geojsonData,
      pickable: true,
      autoHighlight: true,
      highlightColor: [0, 95, 160, 45],
      filled: true,
      stroked: true,
      extruded: false,
      getFillColor: function (feature) {
        return isSelected(feature)
          ? [0, 120, 215, cfg.SELECTED_FILL_ALPHA ?? 45]
          : [0, 0, 0, cfg.HIT_FILL_ALPHA ?? 4];
      },
      getLineColor: function (feature) {
        return isSelected(feature)
          ? [0, 0, 0, cfg.SELECTED_STROKE_ALPHA ?? 220]
          : [0, 0, 0, cfg.HIT_STROKE_ALPHA ?? 28];
      },
      getLineWidth: function (feature) {
        return isSelected(feature) ? 2 : 1;
      },
      lineWidthMinPixels: 1,
      updateTriggers: {
        getFillColor: [selectedId],
        getLineColor: [selectedId],
        getLineWidth: [selectedId]
      },
      parameters: {
        depthTest: false
      },
      onClick: function (info) {
        const feature = info && info.object;
        const cellId = getFeatureId(feature);

        if (cellId === undefined || cellId === null || cellId === "") {
          setStatus("Dieser Bereich hat keine gueltige ID.");
          return true;
        }

        selectedId = cellId;
        setStatus("Auswahl: " + cellId);
        postSelection(cellId, info.coordinate);
        deckInstance.setProps({ layers: createLayers() });
        return true;
      }
    }));

    return layers;
  }

  function initDeck() {
    const bounds = getGeoJsonBounds(geojsonData);
    paddedBounds = bounds ? padBounds(bounds, cfg.MAX_BOUNDS_PADDING ?? 0.08) : null;

    deckInstance = new deck.Deck({
      canvas: "deck-canvas",
      initialViewState: getInitialViewState(paddedBounds),
      controller: {
        dragRotate: false,
        touchRotate: false,
        keyboard: true
      },
      layers: createLayers(),
      getTooltip: function (info) {
        const feature = info && info.object;
        const cellId = getFeatureId(feature);
        return cellId ? { text: String(cellId) } : null;
      },
      onViewStateChange: function (params) {
        return clampViewState(params.viewState);
      }
    });

    setStatus(cfg.HELP_TEXT || "Bitte klicken Sie in den gewuenschten Bereich.");
  }

  fetch(cfg.HITLAYER_URL || "../data/hitlayer.geojson", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("Hitlayer konnte nicht geladen werden: HTTP " + response.status);
      return response.json();
    })
    .then((geojson) => {
      geojsonData = geojson;
      initDeck();
    })
    .catch((err) => {
      console.error(err);
      setStatus("Fehler: " + err.message);
    });
})();
