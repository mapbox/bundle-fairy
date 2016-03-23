var util = require('util');
var fs = require('fs');
var path = require('path');
var zip = require('zipfile');

module.exports.isbundle = isbundle;
module.exports.extract = extract;

function isbundle(zipfile, callback) {

    iszip(zipfile, function(err) {
        if (err) { return callback(err); }

        try {
            var zf = new zip.ZipFile(zipfile);
        }
        catch (err) {
            return callback(new Error('Invalid zipfile'));
        }

        // Account for the empty array index [ '', '.geojson', '.index' ]
        if (zf.count < 3) {
            //no bundle: just a single file
            return callback(null, false);
        }

        var ext = zf.names.map(function(name) { return path.extname(name) });
        var must_have_metadata = false;

        if (ext.length > 3 && ext.indexOf('.geojson') > -1) {
            must_have_metadata = true;
        }

        //flatten to unique extensions
        ext = ext.filter(function(item, i, ar) { return ar.indexOf(item) === i; });

        if (ext.length === 3 && ext.indexOf('.index') > -1) {
            if (must_have_metadata === false && (ext.indexOf('.geojson') || ext.indexOf('.csv'))) {
                //bundle: 2 files, one is csv/geojson and one is '.index'
                return callback(null, true);
            } else return callback(null, false);
        }

        if (must_have_metadata && ext.indexOf('.json') > -1) {
            //bundle: converted from gpx/kml and must have metadata.json file
            return callback(null, true);
        }

        //default to false
        return callback(null, false);
    });
}

function extract(zipfile, callback) {
    console.log('extracting bundle: not implemented');
    callback(null, true, '/home/bergw/xyz/');
}

function iszip(zipfile, callback) {
    fs.open(zipfile, 'r', function(err, fd) {
        if (err) { throw err; }
        var buf = new Buffer(2);
        fs.read(fd, buf, 0, 2, 0, function(err, bytes_read, data) {
            if (err) { return callback(err); }
            fs.close(fd, function(err) {
                if (err) return callback(err);
                data = data.toString();
                if (data !== 'PK') { return callback(new Error('Invalid zipfile')); }
                return callback();
            });
        });
    });


}