define("cropImageData", [], function() {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  document.body.insertBefore(canvas, document.body.childNodes[0]);


  return function cropImageData(image, region) {
    canvas.width = image.width;
    canvas.height = image.width;
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.putImageData(image, 0, 0);

    if (region.angle) {
      ctx.save();
      ctx.translate(region.x, region.y)
      ctx.rotate(-region.angle);
      ctx.drawImage(canvas, -image.width/2, -image.height/2);
      ctx.rotate(region.angle);
      ctx.restore();

      return ctx.getImageData(region.x - region.width/2, region.y - region.width/2, region.width, region.height);
    } else {
      var x = Math.floor(region.x - (region.width/2)),
          y = Math.floor(region.y - region.height/2);
      return ctx.getImageData(x, y, region.height, region.width);
    }
  }
});
