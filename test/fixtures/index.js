var path = require('path');

module.exports = {
  valid: {
    two_directory_levels: path.join(__dirname, 'bundle_2-directory-levels.zip'),
    lots_of_directory_levels: path.join(__dirname, 'bundle_lots-of-directory-levels.zip'),
    geojson_withindex_withmetadata: path.join(__dirname, 'bundle_geojson-with-indices-with-metadata.zip'),
    geojson_withmetadata_noindex: path.join(__dirname, 'bundle_geojson-without-indices-with-metadata.zip'),
    single_csv_withindex: path.join(__dirname, 'bundle_single-csv-with-index.zip'),
    single_geojson_withindex: path.join(__dirname, 'bundle_single-geojson-with-index.zip'),
    single_geojson_with_metadata: path.join(__dirname, 'bundle_single-geojson-with-metadata-without-index.zip')
  },
  invalid: {
    two_root_directories: path.join(__dirname, 'nobundle_2-root-directories.zip'),
    without_metadata_or_index: path.join(__dirname, 'nobundle_geojsons-with-indexes-without-metadata.zip'),
    shapefile_withindex: path.join(__dirname, 'nobundle_shape-with-index.zip'),
    shapefile_withoutindex: path.join(__dirname, 'nobundle_shape-without-index.zip'),
    single_csv_withoutindex: path.join(__dirname, 'nobundle_single-csv-without-index.zip'),
    geojson_and_csv: path.join(__dirname, 'nobundle_single-geojson-and-csv.zip'),
    single_geojson_withoutindex: path.join(__dirname, 'nobundle_single-geojson-without-index-without-metadata.zip'),
    notzip: path.join(__dirname, 'nobundle_states.geojson'),
    einvalid: path.join(__dirname, 'nobundle_corrupt.zip')
  }
};
