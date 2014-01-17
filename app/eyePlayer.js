// to depend on a bower installed component:
// define(['bower_components/componentName/file'])

define("eyePlayer", ["headtrackr", "blobMotionDetector"], function(headtrackr, blobMotionDetector) {
  return function eyePlayer() {
    var htracker, htrackerCanvas,
      video, videoWidth, videoHeight,
      canvas, ctx,
      motiondetector,
      glassesImg;

    var debug = true;
    if (debug) {
      var debugLastLoop = new Date().getTime();
    }

    function drawBox(box, colour) {
      ctx.save();
      ctx.strokeStyle = colour;
      ctx.strokeRect(box.x-1, box.y-1, 3, 3);
      ctx.translate(box.x, box.y)
      if (box.angle) ctx.rotate(box.angle);
      ctx.strokeRect((-(box.width/2)) >> 0,
        (-(box.height/2)) >> 0, box.width, box.height);
      ctx.restore();
    }

    function drawFace(face) {
      ctx.save();
      ctx.translate(face.x, face.y)
      if (face.angle) ctx.rotate(face.angle);
      ctx.strokeStyle = '#000000';

      ctx.beginPath();
      ctx.lineWidth = face.width/20;
      ctx.arc(0, 0, face.width/2, 0, Math.PI*2);
      ctx.closePath()
      ctx.stroke();

      ctx.restore();
    }

    function drawEyes(eyes) {
      ctx.save();
      ctx.translate(eyes.x, eyes.y)
      if (eyes.angle) ctx.rotate(eyes.angle);
      var w = eyes.width * 0.8;
      ctx.drawImage(glassesImg, -w, -w, w*2, w*2);
      ctx.restore();
    }

    function detectBlink(eyes, blobs) {
      if (blobs.length == 2) {
        if (blobs[0].x < blobs[1].x) {
          left = blobs[0], right = blobs[1];
        } else {
          left = blobs[1], right = blobs[0];
        }

        leftIsLeft = left.x < eyes.width / 2;
        rightIsRight = right.x > eyes.width / 2;
        alignedVertically = Math.abs(left.y - right.y) < eyes.height/3;

        if (leftIsLeft && rightIsRight && alignedVertically) {
          return true;
        }
      }
      return false;
    }

    var countdown = 0;
    function faceFound(face) {
      if (!videoWidth || !videoHeight) return;

      var eyes = {
        x: face.x,
        y: face.y,
        width: Math.floor(face.width - face.width/5),
        height: Math.floor(face.height/3),
        angle: face.angle
      };

      ctx.clearRect(0, 0, videoWidth, videoHeight );
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

      var frame = ctx.getImageData(0, 0, videoWidth, videoHeight);
      motiondetector.tick(frame);
      blobs = motiondetector.detectInBox(eyes);

      if (debug) {
        drawBox(face, '#00CC00');
        drawBox(eyes, '#CC0000');

        var debugThisLoop = new Date().getTime();
        var fps = 1000 / (debugThisLoop - debugLastLoop);

        ctx.font="14px Georgia";
        ctx.fillText(fps,5,15);
        debugLastLoop = debugThisLoop;
      }

      drawFace(face);
      drawEyes(eyes);

      if (countdown == 0 && detectBlink(eyes, blobs)) {
        console.log("BLINK!");
        countdown = 5;
      }
      if (countdown > 0) {
        ctx.font="100px Georgia";
        ctx.fillText("BLINK",0,videoHeight/2);
        countdown -= 1;
      }
    }

    function handleFaceTrackingStatus(event) {
      if (event.status != "found") {
        var face = {
          x: Math.floor(videoWidth/2),
          y: Math.floor(videoHeight/2),
          width: Math.floor(videoWidth/3),
          height: Math.floor(videoHeight/2),
          angle: 0.0,
        }
        faceFound(face);
      }
    }

    function handleFaceTrackingEvent(event) {
      if (event.detection == 'CS') {
        var face = {
          x: event.x,
          y: event.y,
          width: event.width,
          height: event.height,
          angle: event.angle - Math.PI/2
        }
        faceFound(face);
      }
    }

    this.init = function(videoInput, canvasOverlay) {
      video = videoInput, canvas = canvasOverlay;
      ctx = canvas.getContext('2d');

      motiondetector = new blobMotionDetector();

      glassesImg = new Image;
      glassesImg.src = "assets/glasses.svg";
      faceImg = new Image;
      faceImg.src = "assets/face.svg";

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
      videoHeight = video.offsetHeight;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      htrackerCanvas.width = videoWidth;
      htrackerCanvas.height = videoHeight;
    }
  };
});
