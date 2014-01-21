require.config({
  paths: {
  }
});

if (!window.requireTestMode) {
  require(['motionPlayer'], function(){ });
}
