define(['cropImageData'],function(cropImageData) {
  describe("cropImageData", function() {
    var canvas, ctx, target, result;

    beforeEach(function() {
      canvas = document.getElementById('debug');
      ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 10, 10);
    });

    afterEach(function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(target, 0, 0);
      ctx.putImageData(result, target.width+1, 0);
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

    function drawRegion(width, height, region) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(region.x, region.y)
      ctx.rotate(region.angle);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-region.width/2, -region.height/2, region.width, region.height);

      // debug
      ctx.fillStyle = '#CCCCCC';
      ctx.fillRect(-1, -1, 3, 3);

      ctx.restore();
      return ctx.getImageData(0, 0, width, height);
    }

    it("should crop a 50x50 region", function() {
      region = {
        x: 50,
        y: 50,
        width: 50,
        height: 50,
        angle: Math.PI * Math.random()
      };
      target = drawRegion(100, 100, region);
      result = cropImageData(target, region);

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

    it("should crop a random region at an angle", function() {
      region = {
        x: 135, //50 + Math.floor(Math.random() * 200),
        y: 50, //25 + Math.floor(Math.random() * 50),
        width: Math.floor(Math.random() * 50),
        height: Math.floor(Math.random() * 50),
        angle: 0.35 //Math.PI * 2 * Math.random()
      };
      target = drawRegion(200, 100, region);
      result = cropImageData(target, region);

      expect(result.width).toEqual(region.width);
      expect(result.height).toEqual(region.height);
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
