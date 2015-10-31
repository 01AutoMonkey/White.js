# White.js

Annoyed by colors? Well then you're in luck, now you can insert one script and all your images turn into pleasant black and white!

![](screen_shot.png)

- Works for images on origin
- Works for images with CORS enabled
- Works for images without CORS enabled (using a proxy)
- Doesn't work for `file:///`
- Images are changed through `src` so events for img elements still hold
- Options
  - Tweak the black & white filter through `brightness`, `contrast`, `black_threshold`, and `white_threshold`.
  - Element selector (all images on page are selected by default)
  - Select CORS proxy (e.x. `http://crossorigin.me/`, `http://cors.io/?u=`)
- See demo at [http://01automonkey.github.io/White.js/](http://01automonkey.github.io/White.js/)

## ToDo

- Make a .min.js and build process
- Cleanup, organize, optimize.
- NPM and Bower package.

## How to Use

- Add the script to body: `<script src="white.js"></script>`
- Call `White.run()`
- You can also change the following variables before calling `.run()`:
  - `White.proxy = "http://crossorigin.me/";`
  - `White.proxy = "http://cors.io/?u=";`
  - `White.selector = "img";`
  - `White.brightness = 33;`
  - `White.contrast = 50;`
  - `White.black_threshold = 40;`
  - `White.white_threshold = 255;`
