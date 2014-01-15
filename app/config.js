require.config({
  // make components more sensible
  // expose jquery
  paths: {
    "components": "../bower_components",
    "jquery":     "../bower_components/jquery/jquery",
    "headtrackr": "../bower_components/headtrackr/headtrackr"
  }
});

if (!window.requireTestMode) {
  require(['eyePlayer'], function(){ });
}
