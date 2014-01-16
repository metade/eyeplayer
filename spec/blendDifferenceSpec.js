define(['blendDifference'],function(blendDifference) {
  describe("blendDifference", function() {
    beforeEach(function() {
      canvas = document.getElementById('debug');
      ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 10, 10);
      target = ctx.getImageData(0, 0, 10, 10);
    });

    afterEach(function() {
      ctx.putImageData(target, 0, 0);
    });

    it("should not find any difference between 2 blank images", function() {
      a = ctx.getImageData(0, 0, 10, 10);
      b = ctx.getImageData(0, 0, 10, 10);
      blendDifference(target, a, b);
      for (var i=0; i<target.data.length; i+=4) {
        expect(target.data[i]).toEqual(0);
        expect(target.data[i+1]).toEqual(0);
        expect(target.data[i+2]).toEqual(0);
      }
    });

    it("should find a difference between an image filled in half", function() {
      a = ctx.getImageData(0, 0, 10, 10);
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 5, 10, 5);
      b = ctx.getImageData(0, 0, 10, 10);
      blendDifference(target, a, b);
      for (var i=0; i<target.data.length; i+=4) {
        if (i<target.data.length/2) {
          expect(target.data[i]).toEqual(0);
          expect(target.data[i+1]).toEqual(0);
          expect(target.data[i+2]).toEqual(0);
        } else {
          expect(target.data[i]).toEqual(255);
          expect(target.data[i+1]).toEqual(255);
          expect(target.data[i+2]).toEqual(255);
        }
      }
    });
  });
});
