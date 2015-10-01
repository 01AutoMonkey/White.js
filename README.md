# White.js

Annoyed by colors? Well then you're in luck, now you can insert one script and all your images turn into pleasant black and white!

![](screen_shot.png)

- Works for images on origin
- Works for images with CORS enabled
- Works for images without CORS enabled (using a proxy)
- Doesn't work for `file:///`
- Tweak the black & white filter through variables
- Images are changed through `src` so events for img elements still hold
- See demo at [http://01automonkey.github.io/White.js/](http://01automonkey.github.io/White.js/)

## ToDo

- Make a .min.js
- Make usage guidline in README

## How to Use

- Add the script to body: `<script src="white.js"></script>`
- Call `White.init()`
