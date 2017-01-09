var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var zip = require('zipfile');
var mkdirp = require('mkdirp');

module.exports.isbundle = isbundle;
module.exports.extract = extract;

function isbundle(zipfile, callback) {

  /*
  Assumptions:
  * must have metadata.json if there are several geojson files of same type
  * may have indicies (small files don't get indices)
  * csv or geojson, but a bundle must contain just one type
  * maybe flat or have max 1 directory

  metadata.json
  layer1.geojson
  layer2.geojson

  metadata.json
  layer1.csv
  layer1.csv.index
  layer2.csv
  layer2.csv.index

  430bc2fe1cf6903d/
  430bc2fe1cf6903d/metadata.json
  430bc2fe1cf6903d/layer1.geojson
  430bc2fe1cf6903d/layer1.geojson.index
  430bc2fe1cf6903d/layer2.geojson
  430bc2fe1cf6903d/layer2.geojson.index
   */

  var allowed_files = ['.geojson', '.csv', '.index', '.json', '.kml', '.gpx'];

  iszip(zipfile, function(err) {
    if (err) { return callback(err); }

    try {
      var zf = new zip.ZipFile(zipfile);
    }
    catch (err) {
      return callback(invalid('Invalid zipfile'));
    }

    //empty zip
    if (zf.count === 0) {
      return callback(null, false);
    }

    var directory_cnt = get_root_dir_count(zf.names);
    //only one root directory allowed
    if (directory_cnt > 1) {
      return callback(null, false);
    }

    //DISABLE till we've decided on supported directory levels
    // var diretory_levels = get_max_directory_levels(zf.names);
    // //zero or one directory levels allowed
    // if (diretory_levels > 1) {
    //   return callback(null, false);
    // }

    //remove directory entry from zf.names
    var file_names = zf.names.filter(function(fname) {
      return path.extname(fname) !== '';
    });

    //no bundle: just a single file
    if (file_names < 2) {
      return callback(null, false);
    }

    //remove directory names for each query of 'metadata.json';
    file_names = file_names.map(function(name) { return name.substring(name.lastIndexOf('/') + 1); });

    var has_metadata = file_names.indexOf('metadata.json') > -1;

    //get extensions
    var extensions = file_names.map(function(name) { return path.extname(name); });

    //flatten to unique extensions
    var unique_extensions = extensions.filter(function(item, i, ar) { return ar.indexOf(item) === i; });

    //check, if there are other (unsupported) file type, e.g. shape file
    var not_allowed = false;
    unique_extensions.forEach(function(extension) {
      if (allowed_files.indexOf(extension) < 0) {
        not_allowed = true;
      }
    });
    if (not_allowed) {
      return callback(null, false);
    }

    //no bundle: no geojson OR csv included, maybe faulty file with just '.index' and/or 'metadata.json'
    if (unique_extensions.indexOf('.geojson') < 0 && unique_extensions.indexOf('.csv') < 0) {
      return callback(null, false);
    }

    //no bundle: geojson AND csv included
    if (unique_extensions.indexOf('.geojson') !== -1 && unique_extensions.indexOf('.csv') !== -1) {
      return callback(null, false);
    }

    var file_type_cnt = file_names.reduce(function(count_map, file_name) {
      var ext = path.extname(file_name);
      count_map[ext] = ++count_map[ext] || 1;
      return count_map;
    }, {});

    //no bundle: multiple csv files
    if (file_type_cnt['.csv'] > 1) {
      return callback(null, false);
    }

    //no bundle: converted from gpx/kml (1 to n geojsons) and doesn't have metadata.json file
    if (!has_metadata && file_type_cnt['.geojson'] > 1) {
      return callback(null, false);
    }

    var has_index = unique_extensions.indexOf('.index') > -1;
    var has_archivedfile = unique_extensions.indexOf('.kml') > -1 || unique_extensions.indexOf('.gpx') > -1;

    //no bundle: single geojson without index
    if (!has_index && !has_metadata && file_type_cnt['.geojson'] === 1) {
      return callback(null, false);
    }

    /////bundles start here

    //bundle: single geojson without metadata.json
    if (!has_metadata && file_type_cnt['.geojson'] === 1) {
      return callback(null, true);
    }

    //bundle: converted from gpx/kml (1 to n geojsons) and has metadata.json file
    if (has_metadata && unique_extensions.indexOf('.geojson') > -1) {
      return callback(null, true);
    }

    //bundle: converted from gpx/kml (1 to n geojsons) and has metadata.json file and archived gpx/kml file
    if (has_archivedfile && has_metadata && unique_extensions.indexOf('.geojson') > -1) {
      return callback(null, true);
    }

    //bundle: exactly one csv including index
    if (file_type_cnt['.csv'] === 1 && has_index) {
      return callback(null, true);
    }

    //default to false
    return callback(null, false);
  });
}

function extract(zipfile, callback) {
  isbundle(zipfile, function(err) {
    if (err) return callback(err);

    var extract_dir = path.join(path.dirname(path.resolve(zipfile)), crypto.randomBytes(8).toString('hex'));
    var zf = new zip.ZipFile(zipfile);
    var layer_files = [];
    zf.names.forEach(function(zip_entry) {
      var out_file = path.join(extract_dir, zip_entry);
      if (zip_entry.lastIndexOf('/') === zip_entry.length - 1) {
        mkdirp.sync(out_file);
      } else {
        zf.copyFileSync(zip_entry, out_file);
        if (out_file.match('.geojson$') || out_file.match('.csv$')){
          layer_files.push(out_file);
        }
      }
    });
    callback(null, layer_files.join(','));
  });
}

function get_root_dir_count(entry_names) {
  if (entry_names[0].indexOf('/') < 0) { return 0; }
  var dir_names = entry_names.map(function(entry_name) { return entry_name.substring(0, entry_name.indexOf('/')); });
  dir_names = dir_names.filter(function(item, i, ar) { return ar.indexOf(item) === i; });
  return dir_names.length;
}

// comment till we decide on supported directory levels
// function get_max_directory_levels(entry_names) {
//   if (entry_names[0].indexOf('/') < 0) { return 0; }
//   var max_depth = 0;
//   entry_names.forEach(function(entry_name) {
//     max_depth = Math.max(max_depth, (entry_name.match(/\//g) || []).length);
//   });
//   return max_depth;
// }

function iszip(zipfile, callback) {
  fs.open(zipfile, 'r', function(err, fd) {
    if (err) { throw err; }
    var buf = new Buffer(2);
    fs.read(fd, buf, 0, 2, 0, function(err, bytes_read, data) {
      if (err) { return callback(err); }
      fs.close(fd, function(err) {
        if (err) return callback(err);
        data = data.toString();
        if (data !== 'PK') { return callback(invalid('Invalid zipfile')); }
        return callback();
      });
    });
  });
}

function invalid(msg) {
  var err = new Error(msg);
  err.code = 'EINVALID';
  return err;
}
