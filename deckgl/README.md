# deck.gl LimeSurvey map alternative

This folder is an alternative WebGL front end for the same public hitlayer:

- URL on GitHub Pages: `https://wohnstandortabfrage.github.io/deckgl/`
- Hitlayer: `../data/hitlayer.geojson`
- LimeSurvey message shape: unchanged (`type`, `cell_id`, `lat`, `lon`)

It does not duplicate `tiles/`. The basemap is loaded from OSM and polygons are rendered with deck.gl's `GeoJsonLayer`.
