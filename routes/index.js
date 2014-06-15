var express = require('express');
var router = express.Router();
var Trianglify = new require('trianglify');
var fs = require('fs');
var svg2png = require('svg2png');
var uuid = require('uuid');
var S = require('string');

var t = new Trianglify();

router.get('/', function (req, res) {
  var help = {
    howto: 'GET /image.svg to retrieve randomly generated svg pattern using trianglify.js. Replace svg by png to get converted png file.',
    contribute: 'https://github.com/kimar/trianglify-api'
  }
  res.json(help);
});

router.get('/:filename', function(req, res) {

  var wantsPng = false;

  if (S(req.params.filename).endsWith('png')) {
    wantsPng = true;
  }

  if(!wantsPng && !S(req.params.filename).endsWith('svg')) {
    return res.send(400);
  }

  var fileId = uuid.v4();
  var svgFile = '/tmp/' + fileId + '.svg';
  var pngFile = '/tmp/' + fileId + '.png';

  fs.writeFile(svgFile, t.generate(800, 600).svgString, function (err) {
    if (err) {
      console.log('Error occured: ' + err);
      return res.send(500);
    }

    if (!wantsPng) {
      return res.sendfile(svgFile);
    }

    svg2png(svgFile, pngFile, function (err) {
        if (err) {
          console.log('Error occured: ' + err);
          return res.send(500);
        }
        res.sendfile(pngFile);
    });

  });
});

module.exports = router;
