define("blendDifference", [], function() {
  return function blendDifference(result, a, b) {
    // based on http://www.soundstep.com/blog/experiments/jsdetection/js/app.js
    function threshold(value) {
      return (value > 0x15) ? 0xFF : 0;
    }
    function fastAbs(value) {
      // funky bitwise, equal Math.abs
      return (value ^ (value >> 31)) - (value >> 31);
    }
    function differenceAccuracy(target, data1, data2) {
      if (data1.length !== data2.length) {
        return null;
      }

      var i = 0;
      while (i < (data1.length * 0.25)) {
        var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
        var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
        var diff = threshold(fastAbs(average1 - average2));
        target[4*i] = diff;
        target[4*i+1] = diff;
        target[4*i+2] = diff;
        target[4*i+3] = 0xFF;
        ++i;
      }
      return true;
    }
    var resultData = result.data, aData = a.data, bData = b.data;
    if (differenceAccuracy(resultData, aData, bData)) {
      result.data = resultData;
      return true;
    } else {
      return false;
    }
  };
});
