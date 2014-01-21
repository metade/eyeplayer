define("eyePlayer", ["headtrackr", "blobMotionDetector"], function(headtrackr, BlobMotionDetector) {
  return function eyePlayer(params) {
    var htracker, htrackerCanvas,
      video, videoWidth, videoHeight,
      canvas, ctx,
      motiondetector;

    if (!params) { params = {}; }
    if (params.debug) {
      var debugLastLoop = new Date().getTime();
    }

    function drawBox(box, colour) {
      ctx.save();
      ctx.strokeStyle = colour;
      ctx.strokeRect(box.x-1, box.y-1, 3, 3);
      ctx.translate(box.x, box.y);
      if (box.angle) { ctx.rotate(box.angle); }
      ctx.strokeRect((-(box.width/2)) >> 0,
        (-(box.height/2)) >> 0, box.width, box.height);
      ctx.restore();
    }

    function detectBlink(eyes, blobs) {
      if (blobs.length === 2) {
        var left = blobs[0], right = blobs[1];
        if (blobs[0].x > blobs[1].x) {
          left = blobs[1]; right = blobs[0];
        }

        var leftIsLeft = left.x < eyes.width / 2;
        var rightIsRight = right.x > eyes.width / 2;
        var alignedVertically = Math.abs(left.y - right.y) < eyes.height/3;

        if (leftIsLeft && rightIsRight && alignedVertically) {
          return true;
        }
      }
      return false;
    }

    function faceFound(face) {
      if (!videoWidth || !videoHeight) { return; }

      var eyes = {
        x: face.x,
        y: face.y,
        width: Math.floor(face.width - face.width/5),
        height: Math.floor(face.height/3),
        angle: face.angle
      };

      ctx.clearRect(0, 0, videoWidth, videoHeight );
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

      motiondetector.tick(video, videoWidth, videoHeight);
      var blobs = motiondetector.detectInBox(eyes);
      var regions = motiondetector.regions();

      if (params.debug) {
        drawBox(face, '#00CC00');
        drawBox(eyes, '#CC0000');

        var debugThisLoop = new Date().getTime();
        var fps = 1000 / (debugThisLoop - debugLastLoop);
        ctx.font="14px Georgia";
        ctx.fillText(fps,5,15);
        debugLastLoop = debugThisLoop;
      }

      var evt;
      if (detectBlink(eyes, blobs)) {
        evt = document.createEvent("Event");
        evt.initEvent("blinkEvent", true, true);
        document.dispatchEvent(evt);
      }
      evt = document.createEvent("Event");
      evt.initEvent("eyeTrackedEvent", true, true);
      evt.face = face;
      evt.eyes = eyes;
      evt.regions = regions;
      document.dispatchEvent(evt);
    }

    function handleFaceTrackingStatus(event) {
      if (event.status !== "found") {
        var face = {
          x: Math.floor(videoWidth/2),
          y: Math.floor(videoHeight/2),
          width: Math.floor(videoWidth/3),
          height: Math.floor(videoHeight/2),
          angle: 0.0,
        };
        faceFound(face);
      }
    }

    function handleFaceTrackingEvent(event) {
      if (event.detection === 'CS') {
        var face = {
          x: event.x,
          y: event.y,
          width: event.width,
          height: event.height,
          angle: event.angle - Math.PI/2
        };
        faceFound(face);
      }
    }

    this.init = function(videoInput, canvasOverlay) {
      video = videoInput;
      canvas = canvasOverlay;
      ctx = canvas.getContext('2d');

      motiondetector = new BlobMotionDetector();

      htracker = new headtrackr.Tracker({
        ui : false, calcAngles : true,
      });
      htrackerCanvas = document.createElement('canvas');
      htracker.init(videoInput, htrackerCanvas);
      document.addEventListener('facetrackingEvent', handleFaceTrackingEvent);
      document.addEventListener('headtrackrStatus', handleFaceTrackingStatus);
      video.addEventListener('playing', this.resize, false);
    };
    this.start = function() {
      htracker.start();
    };
    this.resize = function() {
      videoWidth = video.offsetWidth;
      videoHeight = (video.videoHeight/video.videoWidth) * videoWidth;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      htrackerCanvas.width = videoWidth;
      htrackerCanvas.height = videoHeight;
    };
  };
});
