# Rastertiles

Hierhin gehoeren die sichtbaren Rastertiles, z.B.:

```text
./tiles/10/539/329.png
./tiles/11/1078/658.png
./tiles/12/2157/1316.png
```

Die Karte in `config.js` erwartet standardmaessig:

```js
RASTER_TILE_URL: "tiles/{z}/{x}/{y}.png"
```

Wenn die Tiles aus einer Raster-MBTiles-Datei kommen, nutze `tools/extract_raster_mbtiles_to_xyz.py`.
