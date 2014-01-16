// to depend on a bower installed component:
// define(['bower_components/componentName/file'])

define("eyePlayer", ["headtrackr", "blobMotionDetector"], function(headtrackr, blobMotionDetector) {
  return function eyePlayer() {
    var htracker, htrackerCanvas,
      video, videoWidth, videoHeight,
      canvas, ctx,
      motiondetector;

    function drawBox(box, colour) {
      ctx.save();
      ctx.strokeStyle = colour;
      ctx.translate(box.x, box.y)
      if (box.angle) ctx.rotate(box.angle-(Math.PI/2));
      ctx.strokeRect((-(box.width/2)) >> 0,
        (-(box.height/2)) >> 0, box.width, box.height);
      ctx.restore();
    }

    function faceFound(event) {
      if (!videoWidth || !videoHeight) return;

      var eyes = {
        x: event.x,
        y: event.y,
        width: Math.floor(event.width - event.width/5),
        height: Math.floor(event.height/3),
        angle: event.angle
      };

      var frame = ctx.getImageData(0, 0, videoWidth, videoHeight);
      blobs = motiondetector.detect(frame);

      ctx.clearRect(0, 0, videoWidth, videoHeight );
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      drawBox(event, '#00CC00');
      drawBox(eyes, '#CC0000');

      for (var i=0; i<blobs.length; i++) {
        drawBox(blobs[i], '#0000CC');
      }
    }

    function handleFaceTrackingStatus(event) {
      if (event.status != "found") {
        face = {
          x: videoWidth/2,
          y: videoHeight/2,
          width: videoWidth/3,
          height: videoHeight/2,
          angle: Math.PI/2,
        }
        faceFound(face);
      }
    }

    function handleFaceTrackingEvent(event) {
      if (event.detection == 'CS') {
        faceFound(event);
      }
    }

    this.init = function(videoInput, canvasOverlay) {
      video = videoInput, canvas = canvasOverlay;
      ctx = canvas.getContext('2d');

      motiondetector = new blobMotionDetector();

      htracker = new headtrackr.Tracker({
        ui : false, calcAngles : false,
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
      videoHeight = video.offsetHeight;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      htrackerCanvas.width = videoWidth;
      htrackerCanvas.height = videoHeight;
    }
  };
});
