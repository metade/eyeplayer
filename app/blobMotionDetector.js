define("blobMotionDetector", ["blendDifference", "gaussFilter", "floodfill", "cropImageData"], function(blendDifference, gaussFilter, floodfill, cropImageData) {
  function indexToXandY(image, index) {
    var x = index/4 % image.width;
    var y = Math.floor(index/4 / image.width);
    return [x, y];
  }

  function scaleBox(box, scale) {
    return {
      x: box.x * scale,
      y: box.y * scale,
      width: box.width * scale,
      height: box.height * scale,
      angle: box.angle
    };
  }

  function thresholdImage(image, colour) {
    var data = image.data;
    for (var i=0; i<image.data.length; i+=4) {
      if ((data[i] + data[i+1] + data[i+2]) > 0) {
        data[i]   = colour.r;
        data[i+1] = colour.g;
        data[i+2] = colour.b;
        data[i+3] = 255;
      } else {
        data[i]   = 0;
        data[i+1] = 0;
        data[i+2] = 0;
        data[i+3] = 255;
      }
    }
  }

  function detectBlobByColour(image, colour) {
    var data = image.data;
    var minX = image.width, minY = image.height, maxX = 0, maxY = 0;
    for (var i=0; i<image.data.length; i+=4) {
      if (data[i] === colour.r && data[i+1] === colour.g && data[i+2] === colour.b) {
        var xy = indexToXandY(image, i);
        var x = xy[0], y = xy[1];

        if (x<minX) { minX = x; }
        if (x>maxX) { maxX = x; }
        if (y<minY) { minY = y; }
        if (y>maxY) { maxY = y; }
      }
    }
    if (maxX > minX && maxY > minY) {
      var w = maxX - minX, h = maxY - minY;
      return { x: minX, y: minY, width: w, height: h, area: w * h };
    } else {
      return null;
    }
  }

  function detectBlobs(image) {
    var blobColour = { r: 255, g: 255, b: 255, a: 255 },
      fillColour = { r: 0, g: 255, b: 0, a: 255 },
      processedColour = { r: 0, g: 0, b: 255, a: 255 };
    var data = image.data;
    var blobs = [];

    for (var i=0; i<image.data.length; i+=4) {
      var xy = indexToXandY(image, i);

      if (data[i] === blobColour.r && data[i+1] === blobColour.g && data[i+2] === blobColour.b) {
        floodfill(image, xy[0], xy[1], fillColour, 1);
        var blob = detectBlobByColour(image, fillColour);
        if (blob) { blobs.push(blob); }
        floodfill(image, xy[0], xy[1], processedColour, 1);
      }
    }
    return blobs;
  }

  return function blobMotionDetector() {
    var WIDTH = 320;
    var scale;
    var lastImage, diffImage;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    this.detectInBox = function(box) {
      var areaImage = cropImageData(diffImage, scaleBox(box, scale));

      gaussFilter(areaImage, 5);
      thresholdImage(areaImage, { r: 255, g: 255, b: 255, a: 255});

      var blobs = detectBlobs(areaImage);
      return blobs.map(function(b) { return scaleBox(b, 1/scale); });
    };

    this.regions = function() {
      var regs = [0,0,0,0,0,0,0,0];
      var regionHeight = diffImage.height / 5;
      var regionWidth = diffImage.width / 8;

      var r, data = diffImage.data;
      for (var i=0; i < data.length; i+=4) {
        var xy = indexToXandY(diffImage, i);
        var x = xy[0], y = xy[1];
        if (y >= regionHeight) { break; }

        r = Math.floor(x / regionWidth);
        regs[r] += ((data[i] + data[i+1] + data[i+2]) / 3);
      }

      for (r=0; r<8; r++) {
        regs[r] /= (regionHeight * regionWidth);
        if (regs[r] < 10) { regs[r] = -1; }
      }
      return regs;
    };

    this.tick = function(image, width, height) {
      if (canvas.width !== WIDTH) {
        scale = WIDTH / width;
        canvas.width = WIDTH;
        canvas.height = height * scale;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      diffImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      var myImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (!lastImage) { lastImage = myImage; }
      blendDifference(diffImage, myImage, lastImage);

      lastImage = myImage;
    };
  };
});
