define("blobMotionDetector", ["blendDifference", "gaussFilter", "floodfill", "cropImageData"], function(blendDifference, gaussFilter, floodfill, cropImageData) {
  function indexToXandY(image, index) {
    x = index/4 % image.width;
    y = Math.floor(index/4 / image.width);
    return [x, y];
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
    data = image.data;
    minX = image.width, minY = image.height, maxX = 0, maxY = 0;
    for (var i=0; i<image.data.length; i+=4) {
      if (data[i] == colour.r && data[i+1] == colour.g && data[i+2] == colour.b) {
        xy = indexToXandY(image, i);
        x = xy[0], y = xy[1];

        if (x<minX) minX = x;
        if (x>maxX) maxX = x;
        if (y<minY) minY = y;
        if (y>maxY) maxY = y;
      }
    }
    if (maxX > minX && maxY > minY) {
      w = maxX - minX, h = maxY - minY;
      return { x: minX, y: minY, width: w, height: h, area: w * h }
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
      xy = indexToXandY(image, i);

      if (data[i] == blobColour.r && data[i+1] == blobColour.g && data[i+2] == blobColour.b) {
        floodfill(image, xy[0], xy[1], fillColour, 1);
        blob = detectBlobByColour(image, fillColour);
        if (blob) { blobs.push(blob); }
        floodfill(image, xy[0], xy[1], processedColour, 1);
      }
    }
    return blobs;
  }

  function foo() {

  }

  return function blobMotionDetector() {
    var lastImage, diffImage;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    // document.body.insertBefore(canvas, document.body.childNodes[0]);

    this.detectInBox = function(box) {
      ctx.clearRect(0, 0, diffImage.width, diffImage.height);
      ctx.putImageData(diffImage, 0, 0);
      var areaImage = ctx.getImageData(box.x, box.y, box.width, box.height);

      gaussFilter(areaImage, 5);
      thresholdImage(areaImage, { r: 255, g: 255, b: 255, a: 255});

      ctx.putImageData(areaImage, 0, 0);

      var blobs = detectBlobs(areaImage);

      return blobs;
    }

    this.tick = function(image) {
      if (!lastImage) lastImage = image;

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.clearRect(0, 0, image.width, image.height);
      diffImage = ctx.getImageData(0, 0, image.width, image.height);
      blendDifference(diffImage, image, lastImage);

      lastImage = image;
    };
  }
});
