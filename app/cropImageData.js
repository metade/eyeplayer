define("cropImageData", [], function() {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  document.body.insertBefore(canvas, document.body.childNodes[0]);

  return function cropImageData(image, region) {
    canvas.width=image.width;
    canvas.height=image.height;
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.putImageData(image, 0, 0);

    if (region.angle) {
      diameter = Math.floor(Math.sqrt(region.width*region.width + region.height*region.height));
      radius = Math.floor(diameter/2);

      ctx.strokeStyle = "#00FF00";
      ctx.strokeRect(region.x-radius, region.y-radius, diameter, diameter);

      area = ctx.getImageData(region.x-radius, region.y-radius, diameter, diameter);
      ctx.clearRect(0, 0, diameter, diameter);
      ctx.putImageData(area, 0, 0);

      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(-region.angle);
      ctx.drawImage(canvas, -radius, -radius);
      ctx.restore();

      var x = Math.floor(radius-region.width/2), y = Math.floor(radius-region.height/2);
      return ctx.getImageData(x, y, region.width, region.height);
    } else {
      var x = Math.floor(region.x - (region.width/2)),
          y = Math.floor(region.y - region.height/2);
      return ctx.getImageData(x, y, region.height, region.width);
    }
  }
});
