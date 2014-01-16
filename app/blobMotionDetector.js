define("blobMotionDetector", ["blendDifference"], function(blendDifference) {
  return function blobMotionDetector() {
    var lastImage;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    this.detect = function(image) {
      if (!lastImage) lastImage = image;
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.clearRect(0, 0, image.width, image.height);
      tmpImage = ctx.getImageData(0, 0, image.width, image.height);
      blendDifference(tmpImage, image, lastImage);
      return tmpImage;
    };
  }
});
