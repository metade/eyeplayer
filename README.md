# eyePlayer

A series of experiments to control stuff using a webcam.

## Getting Started

Make sure you have the latest packages installed

```
npm install
bower install
```

Note: If you don't have `npm` installed, make sure you have
[node](http://nodejs.com) installed. If you don't have bower,
`npm install -g bower`.

The above steps will download all the required software to
build and run this app, such as [grunt](http://gruntjs.com),
[requirejs](http://requirejs.org), and [jquery](http://jquery.com).

## Running the server

You can run your app using `grunt preview`. This will start a
server on `localhost:8000`, meaning you can simply go to the
urls [localhost:8000/examples/blink.html](http://localhost:8000/examples/blink.html) and [localhost:8000/examples/motion.html](http://localhost:8000/examples/motion.html)
while it's running.

## Building the application

This application uses requirejs to load the various modules in
the app folder. However, upon build, all of these files are
concatenated and minified together to create a small, compressed
javascript file.

Running `grunt` by itself will run through all of the steps of
linting the javascript, building out dependencies and ultimately
creating `/dist/eyePlayer.js` and `/dist/motionPlayer.js`.

### Tests

There are some Jasmine tests which be ran by launching the server
`grunt preview` and going to `localhost:8000/SpecRunner.html`.

