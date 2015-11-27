# img-white

Annoyed by colors? Well then you're in luck, now you can insert one script and all your images turn into pleasant black and white!

![](screen_shot.png)

- Works for images on origin
- Works for images with CORS enabled
- Works for images with CORS disabled (using a proxy)
- Doesn't work for `file:///`
- Images are changed through `src` so events for img elements still hold
- Has the following options:
  - Tweak the black & white filter through `brightness`, `contrast`, `black_threshold`, and `white_threshold`.
  - Element selector (e.x. "img" or "img.white")
  - Select CORS proxy (e.x. `http://crossorigin.me/` or `http://cors.io/?u=`)
- See demo at [http://01automonkey.github.io/img-white/](http://01automonkey.github.io/img-white/)

## ToDo

- NPM and Bower package.
- Support more then the img tag (e.x. css background-image)
- **Bug:** In Chrome when adding an image to the page with innerHTML, you need to call White.run() inside a setTimeout set to 0, else you get a cross-origin error.
- **Bug:** When changing values with dat.GUI, sometimes only the CORS-Disabled image in demo gets updated.

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
