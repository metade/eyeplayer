// to depend on a bower installed component:
// define(['bower_components/componentName/file'])

define("eyePlayer", ["headtrackr"], function(headtrackr) {
  return function eyePlayer() {
    var htracker, htrackerCanvas,
      video, videoWidth, videoHeight,
      canvas, ctx;

    function faceFound(event) {
      var eyes = {
        x: Math.floor(event.x-event.width/2 + event.width/10),
        y: Math.floor(event.y-event.height/2+event.height/3*2),
        width: Math.floor(event.width - event.width/5),
        height: Math.floor(event.height/3),
        angle: event.angle
      };

      ctx.clearRect(0, 0, videoWidth, videoHeight );
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

      ctx.translate(event.x, event.y)
      ctx.rotate(event.angle-(Math.PI/2));
      ctx.strokeStyle = '#00CC00';
      ctx.strokeRect((-(event.width/2)) >> 0,
        (-(event.height/2)) >> 0, event.width, event.height);

      ctx.strokeStyle = '#CC0000';
      ctx.strokeRect((-(eyes.width/2)) >> 0,
        (-(eyes.height/2)) >> 0, eyes.width, eyes.height);

      ctx.rotate((Math.PI/2) - event.angle);
      ctx.translate(-event.x, -event.y);
    }

    function handleFaceTrackingStatus(event) {
      if (event.status != "found") {
        face = {
          x: videoWidth/2,
          y: videoHeight/2,
          width: videoWidth/3,
          height: videoHeight/3,
          angle: 0,
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
