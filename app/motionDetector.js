define("motionDetector", ["blendDifference"], function(blendDifference) {
  return function motionDetector(params) {
    if (!params) { params = {}; }
    if (!params.scale) { params.scale = 1.0; }

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

    this.tick = function(image) {
      var w = Math.floor((image.width || image.videoWidth || 640) * params.scale),
          h = Math.floor((image.height || image.videoHeight || 380) * params.scale);
      if (w && h && canvas.width !== w && canvas.height !== h) {
        canvas.width = w ;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      diffImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      try {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      } catch(e) {
        return diffImage;
      }

      var myImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (!lastImage) { lastImage = myImage; }
      blendDifference(diffImage, myImage, lastImage);

      lastImage = myImage;

      if (params.filter) {
        params.filter(diffImage);
      }
      ctx.putImageData(diffImage, 0, 0);
      return canvas;
    };
  };
});
