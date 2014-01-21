define("motionDetector", ["blendDifference"], function(blendDifference) {
  return function motionDetector() {
    var diffImage, lastImage;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    this.regions = function() {
      var regs = [0,0,0,0,0,0,0,0];
      var regionHeight = diffImage.height / 5;
      var regionWidth = diffImage.width / 8;

      var r, data = diffImage.data;
      for (var i=0; i < data.length; i+=4) {
        var y = Math.floor(i/4 / diffImage.width);
        if (y >= regionHeight) { break; }
        var x = i/4 % diffImage.width;

        r = Math.floor(x / regionWidth);
        regs[r] += ((data[i] + data[i+1] + data[i+2]) / 3);
      }

      for (r=0; r<8; r++) {
        regs[r] /= (regionHeight * regionWidth);
        if (regs[r] < 10) { regs[r] = -1; }
      }
      return regs;
    };

    this.tick = function(image, filter) {
      var w = (image.width || image.videoWidth), h = (image.height || image.videoHeight);
      if (w && h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      diffImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      var myImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (!lastImage) { lastImage = myImage; }
      blendDifference(diffImage, myImage, lastImage);

      lastImage = myImage;

      if (filter) {
        filter(diffImage);
      }
      ctx.putImageData(diffImage, 0, 0);
      return canvas;
    };
  };
});
