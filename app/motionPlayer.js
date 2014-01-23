define("motionPlayer", ["motionDetector"], function(MotionDetector) {
  return function motionPlayer(params) {
    if (!params) { params = {}; }
    var video, canvas, ctx, motiondetector;

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

    function startProcess() {
      if (video.videoWidth && video.videoHeight) {
        var videoWidth = video.offsetWidth;
        var videoHeight = (video.offsetHeight/video.offsetWidth) * video.offsetWidth;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        tick();
      } else {
        window.setTimeout(startProcess, 0.1);
      }
    }

    function tick() {
      var diffImage = motiondetector.tick(video);
      var regions = motiondetector.regions();

      var evt = document.createEvent("Event");
      evt.initEvent("motionEvent", true, true);
      evt.image = diffImage;
      evt.regions = regions;
      document.dispatchEvent(evt);

      window.requestAnimFrame(tick);
    }

    this.init = function(videoInput, canvasOverlay) {
      video = videoInput;
      canvas = canvasOverlay;
      ctx = canvas.getContext('2d');
      motiondetector = new MotionDetector(params);
      video.addEventListener('playing', startProcess, false);
    };

    this.start = function() {
      startVideo();
    };
  };
});
