# bundle-fairy

[![Node.js CI](https://github.com/mapbox/bundle-fairy/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/mapbox/bundle-fairy/actions/workflows/test.yml)

Detect *bundles* of geometry.

#### What is a bundle?
A *bundle* is a compressed (zipped `.zip`) directory containing either:
- A collection of GeoJSON files relating back to their original source, plus correlating index files if needed ([produced by Mapnik](https://github.com/mapnik/mapnik/tree/master/utils/mapnik-index)).
- A single CSV/GeoJSON file, plus its correlating index file ([produced by Mapnik](https://github.com/mapnik/mapnik/tree/master/utils/mapnik-index)).

Bunldes are used as an in-between format for two cases:

1. GPX/KML sources converted to GeoJSON. Each GeoJSON file represents an individual layer from the original GPX/KML source. Additionally, depending on the size of each new GeoJSON layer, Mapnik will produce an index file per layer to help optimize tile copying.
2. Large GeoJSON or CSV files with a correlating index file to help optimize tile copying.

### A brief specification

A *bundle* MUST include:

* a `.zip` extension
* at least one geo file (`.geojson` or `.csv`)

A *bundle* MAY include:

* one or more spatial index files (`.index`)
* a `metadata.json` file, which is exactly the [output of `mapnik-omnivore`](https://github.com/mapbox/mapnik-omnivore#example-of-returned-metadata)
* nested directories of files (infinite depth)
* for GPX/KML sources, an archived copy of the original file  

A *bundle* MAY NOT include:

* Two different types of geo files (i.e. a `.geojson` AND a `.csv`)
* Any geo file formats other than `geojson` or `csv`

# Install

```
npm install @mapbox/bundle-fairy
```

# Usage

### Require

```javascript
var fairy = require('@mapbox/bundle-fairy');
```

#### check if a file is a bundle, `isbundle()`

```javascript
fairy.isbundle('./path/to/file.zip', function(err, isbundle) {
  if (err) throw err;
  console.log(isbundle); // `true` or `false`
});
```

#### extract a bundle, `extract()`
```javascript
fairy.extract('./path/to/file.zip', function(err, result) {
  if (err) throw err;
  console.log(result); // comma separated list of files within the bundle
});
```

You can pass in the `dirname` option to just get the full directory path back:

```javascript
fairy.extract('./path/to/file.zip', { dirname: true }, function(err, result) {
  if (err) throw err;
  console.log(result); // /User/waka/files/tmp-bundle
});
```

### CLI Usage

**Check if is bundle**
```shell
$ bundle-fairy isbundle <zipfile>
```

**Extract bundle**
```shell
$ bundle-fairy extract <zipfile>
$ bundle-fairy extract <zipfile> --dirname # returns just directory name
```

# Test

```shell
npm test
```

`¯\_(ツ)_/¯`
