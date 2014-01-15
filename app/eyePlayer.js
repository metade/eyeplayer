// to depend on a bower installed component:
// define(['bower_components/componentName/file'])

define("eyePlayer", ["headtrackr"], function(headtrackr) {
  var htracker;

  return function eyePlayer() {
    this.init = function(videoInput, canvasInput) {
      htracker = new headtrackr.Tracker({
        ui : false, calcAngles : false,
      });
      htracker.init(videoInput, canvasInput);
    };
    this.start = function() {
      htracker.start();
    };
  };
});
