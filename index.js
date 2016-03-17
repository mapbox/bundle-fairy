var util = require('util');
var fs = require('fs');
var path = require('path');
var zip = require('zipfile');

module.exports.isbundle = isbundle;
module.exports.extract = extract;

function isbundle(zipfile, callback) {
  try {
    var zf = new zip.ZipFile(zipfile);
    if (zf.count < 2) {
      //no bundle: just a single file
      return callback(null, false);
    }
    var ext = zf.names.map(function(name) { return path.extname(name) });
    if (ext.length === 2 && ext.indexOf('.index') > -1) {
      //no bundle: 2 files and one is '.index'
      return callback(null, false);
    }

    //flatten to unique extensions
    ext = ext.filter(function(item, i, ar) { return ar.indexOf(item) === i; });

    if (
      ext.indexOf('.shp') > -1
      && ext.indexOf('.shx') > -1
      && ext.indexOf('.dbf') > -1
    ) {
      //no bundle: shapefile. Assumption: just one shapefile per zip???
      return callback(null, false);
    }

    if (ext.length > 2) {
      //no bundle: there should be max 2 types of extension: 1x data file, 2x index
      return callback(null, false);
    }

    if (ext.length === 2 && ext.indexOf('.index') === -1) {
      //no bundle: 2 types and none of them is an '.index'
      return callback(null, false);
    }

    //must be a bundle then
    callback(null, true);
  }
  catch (e) {
    callback(e);
  }
}

function extract(zipfile, callback) {
  console.log('extracting bundle');
  callback(null, true, '/home/bergw/xyz/');
}