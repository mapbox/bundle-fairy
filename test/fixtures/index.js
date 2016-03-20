var path = require('path');

module.exports = {
  valid: {
    geojson_withindex_withmetadata: path.join(__dirname, 'bundle_geojson-with-indices-with-metadata.zip'),
  	geojson_withmetadata_noindex: path.join(__dirname, 'bundle_geojson-without-indices-with-metadata.zip'),
  	single_csv_withindex: path.join(__dirname, 'bundle_single-csv-with-index.zip'), 
 	single_geojson_withindex: path.join(__dirname, 'bundle_single-geojson-with-index.zip')
  },
  invalid: {
    withoutmetadata: path.join(__dirname, 'nobundle_geojsons-with-indexes-without-metadata.zip'),
    shapefile_withindex: path.join(__dirname, 'nobundle_shape-with-index.zip'),
    shapefile_withoutindex: path.join(__dirname, 'nobundle_shape-without-index.zip'),
    single_csv_withoutindex: path.join(__dirname, 'nobundle_single-csv-without-index.zip'),
    geojson_and_csv: path.join(__dirname, 'nobundle_single-geojson-and-csv.zip'),
    single_geojson_withoutindex: path.join(__dirname, 'nobundle_single-geojson-without-index.zip'),
    notzip: path.join(__dirname, 'nobundle_states.geojson')
  }
};
