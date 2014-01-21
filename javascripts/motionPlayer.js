/*! eyeplayer - v0.0.0 - 2014-01-21
* Copyright (c) 2014 Author Name; Licensed MIT */

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

define("motionPlayer", ["motionDetector"], function(MotionDetector) {
  return function motionPlayer(params) {
    if (!params) { params = {}; }
    var video, canvas, ctx, motiondetector, filter;

    function startVideo() {
      var videoObj = { "video": true },
        errBack = function(error) {
          alert("Video capture error: ", error.code);
        };

      if(navigator.getUserMedia) {
        navigator.getUserMedia(videoObj, function(stream) {
          video.src = stream;
          video.play();
        }, errBack);
      } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
        navigator.webkitGetUserMedia(videoObj, function(stream){
          video.src = window.webkitURL.createObjectURL(stream);
          video.play();
        }, errBack);
      } else if(navigator.mozGetUserMedia) { // WebKit-prefixed
        navigator.mozGetUserMedia(videoObj, function(stream){
          video.src = window.URL.createObjectURL(stream);
          video.play();
        }, errBack);
      }
    }

    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
          window.setTimeout(callback, 1000 / 60);
        };
    })();

    function tick() {
      var diffImage = motiondetector.tick(video, filter);
      var regions = motiondetector.regions();

      var evt = document.createEvent("Event");
      evt.initEvent("motionEvent", true, true);
      evt.image = diffImage;
      evt.regions = regions;
      document.dispatchEvent(evt);

      window.requestAnimFrame(tick);
    }

    this.setFilter = function(theFilter) {
      filter = theFilter;
    };

    this.init = function(videoInput, canvasOverlay) {
      video = videoInput;
      canvas = canvasOverlay;
      ctx = canvas.getContext('2d');
      motiondetector = new MotionDetector();
      video.addEventListener('playing', this.resize, false);
    };

    this.resize = function() {
      var videoWidth = video.offsetWidth;
      var videoHeight = (video.videoHeight/video.videoWidth) * videoWidth;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    };

    this.start = function() {
      startVideo();
      window.setTimeout(tick, 1000);
    };
  };
});

require.config({
  paths: {
  }
});

if (!window.requireTestMode) {
  require(['motionPlayer'], function(){ });
}
;
define("config2", function(){});
