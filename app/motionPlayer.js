define("motionPlayer", ["motionDetector"], function(MotionDetector) {
  return function motionPlayer(params) {
    var video, canvas, ctx, motiondetector, filter;

    function startVideo() {
      var videoObj = { "video": true },
        errBack = function(error) {
          console.log("Video capture error: ", error.code);
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
      diffImage = motiondetector.tick(video, filter);
      var regions = motiondetector.regions();

      var evt = document.createEvent("Event");
      evt.initEvent("motionEvent", true, true);
      evt.image = diffImage;
      evt.regions = regions;
      document.dispatchEvent(evt);

      requestAnimFrame(tick);
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
      videoWidth = video.offsetWidth;
      videoHeight = (video.videoHeight/video.videoWidth) * videoWidth;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    };

    this.start = function() {
      startVideo();
      tick();
    }
  };
});
