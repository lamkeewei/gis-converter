
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var cors = require('cors');
var rimraf = require('rimraf');
var sys = require('sys');
var exec = require('child_process').exec;

var app = express();

// all environments
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
app.set('upload', process.env.OPENSHIFT_TMP_DIR || 'uploads/');
app.use(express.favicon());
app.use(cors());
app.use(express.bodyParser());
app.use(express.methodOverride());

function buildCommand(fileName, sourceSRS, targetSRS){
  var targetFile = 'uploads/' + fileName + '/' + fileName + '.shp';
  var outputFile = 'uploads/' + fileName + '/' + fileName +  '.geojson';  

  var cmd = 'ogr2ogr -f GeoJSON -s_srs ' + sourceSRS + ' -t_srs '+ targetSRS 
              + ' ' + outputFile + ' ' + targetFile;

  return cmd;
}

app.use('/', express.static(path.join(__dirname, 'public')));
app.post('/convert/:source', function(req, res, next){
  var sourceSRS = req.params.source;
  var file = req.files.file;

  if(!sourceSRS || !file){
    var error = {
      status: 'error',
      message: 'Please provide the appropriate parameters!'
    };
    res.json(error);
  }

  fs.readFile(req.files.file.path, function(err, data){
    if(!err){
      var readPath = __dirname + '/uploads/' + file.name;

      fs.writeFile(readPath, data, function(err){
        var fileName = file.name.split('.')[0];

        var cmd = 'unzip -o uploads/' + file.name + ' -d ' + 'uploads/' + fileName + '/';
        exec(cmd, function(err, stdout, stderr){
          fs.unlink(readPath);

          var targetSRS = 'crs:84';

          exec(buildCommand(fileName, sourceSRS, targetSRS), function(err, stdout, stderr){
            fs.readFile('uploads/' + fileName + '/' + fileName + '.geojson', function(err, data){
              var data = JSON.parse(data);
              rimraf('uploads/' + fileName, function(err){
                if(err){
                  console.log('remove error!');
                }
              });

              res.json(data);
            });
          });
        });
      });
    }
  });
});


http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
