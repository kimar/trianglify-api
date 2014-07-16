var express = require('express');
var router = express.Router();
var Trianglify = new require('trianglify');
var fs = require('fs');
var svg2png = require('svg2png');
var uuid = require('uuid');
var S = require('string');
var regex = new RegExp(/[0-9]+x[0-9]+.(svg|png)/);

var t = new Trianglify({noiseIntensity: 0});

router.get('/', function (req, res) {
  var help = {
    howto: 'GET /image.svg to retrieve randomly generated svg pattern using trianglify.js. Replace svg by png to get converted png file.',
    contribute: 'https://github.com/kimar/trianglify-api'
  }
  res.json(help);
});

router.get('/:filename', function(req, res) {

  var wantsPng = false;
  var width = 640;
  var height = 480;

  if (!S(req.params.filename).startsWith('image')) {
    if (regex.test(req.params.filename)) {
      var components = req.params.filename.split(/.(svg|png)/);
      width = components[0].split('x')[0];
      height = components[0].split('x')[1];
    } else {
      return res.send(400);
    }
  }

  if (width > 2000 || height > 2000) {
    return res.send(400);
  }

  if (S(req.params.filename).endsWith('png')) {
    wantsPng = true;
  }

  if(!wantsPng && !S(req.params.filename).endsWith('svg')) {
    return res.send(400);
  }

  var fileId = uuid.v4();
  var svgFile = '/tmp/' + fileId + '.svg';
  var pngFile = '/tmp/' + fileId + '.png';

  t.options.x_gradient = Trianglify.randomColor();
  t.options.y_gradient = t.options.x_gradient.map(function(c){return d3.rgb(c).brighter(.5)});
  
  fs.writeFile(svgFile, t.generate(parseInt(width), parseInt(height)).svgString, function (err) {
    if (err) {
      return res.send(500);
    }

    if (!wantsPng) {
      return res.sendfile(svgFile);
    }

    svg2png(svgFile, pngFile, function (err) {
        if (err) {
          return res.send(500);
        }
        res.sendfile(pngFile);
    });

  });
});

module.exports = router;
