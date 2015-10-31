# White.js

Annoyed by colors? Well then you're in luck, now you can insert one script and all your images turn into pleasant black and white!

![](screen_shot.png)

- Works for images on origin
- Works for images with CORS enabled
- Works for images without CORS enabled (using a proxy)
- Doesn't work for `file:///`
- Images are changed through `src` so events for img elements still hold
- Options
  - Tweak the black & white filter through `brightness`, `contrast` and `black_threshold`.
  - Element selector (all images on page are selected by default)
- See demo at [http://01automonkey.github.io/White.js/](http://01automonkey.github.io/White.js/)

## ToDo

- Make a .min.js and build process
- Allow for setting brightness, contrast, and black threshold in .init() call
- Include a selector, in case a user doesn't want *all* images on the page converted
- Allow selecting CORS proxy
- Cleanup, organize, optimize.

## How to Use

- Add the script to body: `<script src="white.js"></script>`
- Call `White.init()`
