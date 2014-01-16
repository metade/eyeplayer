define(['cropImageData'],function(cropImageData) {
  describe("cropImageData", function() {
    var canvas, ctx, target, result;

    beforeEach(function() {
      canvas = document.getElementById('debug');
      ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 10, 10);
    });

    afterEach(function() {
      // ctx.clearRect(0, 0, 10, 10);
      // ctx.putImageData(result, 0, 0);
    });

    it("should crop a 3x3 region", function() {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 10, 10);
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(3, 3, 3, 3);
      target = ctx.getImageData(0, 0, 10, 10);

      result = cropImageData(target, { x: 5, y: 5, width: 3, height: 3 });
      expect(result.width).toEqual(3);
      expect(result.height).toEqual(3);
      for (var i=0; i<result.data.length; i+=4) {
        expect(result.data[i]).toEqual(255);
        expect(result.data[i+1]).toEqual(0);
        expect(result.data[i+2]).toEqual(0);
      }
    });

    it("should crop a 3x3 region at an angle", function() {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 100, 100);

      region = {
        x: 50, y: 50, width: 50, height: 50, angle: Math.PI * Math.random()
      };

      ctx.save();
      ctx.translate(region.x, region.y)
      ctx.rotate(region.angle);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-region.x/2, -region.y/2, region.height, region.width);
      ctx.restore();

      target = ctx.getImageData(0, 0, 100, 100);
      result = cropImageData(target, region);
      ctx.putImageData(result, 120, 20);

      expect(result.width).toEqual(50);
      expect(result.height).toEqual(50);
      for (var i=0; i<result.data.length; i+=4) {
        if (result.data[i]==0) {
          expect(result.data[i]).toEqual(0);
          expect(result.data[i+1]).toEqual(0);
          expect(result.data[i+2]).toEqual(0);
        } else {
          // should be gray and not white
          var r = result.data[i];
          expect(r).toNotEqual(255);
          expect(result.data[i+1]).toEqual(r);
          expect(result.data[i+2]).toEqual(r);
        }
      }
    });
  });
});
