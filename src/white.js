var White = {
  selector: "img",
  brightness: 33,
  contrast: 50,
  black_threshold: 40,
  white_threshold: 255,
  images: [],
  origin: window.location.origin,
  proxy: "http://crossorigin.me/", //or: "http://cors.io/?u=
  loadLeft: 0,
  run: function(selector) {
    this.selector = selector;
    if (this.loadLeft == 0) {
      this.initImages();
      for (var img in this.images) {
        this.applyToImage(this.images[img], false);
      }
    }
  },
  restore: function(selector) {
    var images = document.querySelectorAll(selector);
    for (var img in images) {
      this.restoreImage(images[img]);
    }
  },
  initImages: function() {
    this.images = [];
    var images = document.querySelectorAll(this.selector);
    for (var img in images) {
      if (images[img].style != undefined && images[img].tagName == "IMG") {
        // Element, src attribute, width & height, visibility style
        this.images.push([
          images[img],
          images[img].dataset.src || images[img].src,
          [[images[img].width],
          [images[img].height]],
          images[img].style.visibility
        ]);

        var i = this.images[this.images.length-1]
        i[0].style.visibility = "hidden";
      }
    }
    this.loadLeft = this.images.length;
  },
  applyToImage: function(image, proxy) {
    var that = this;
    var vimg = new Image();

    vimg.onload = function() {
      var w = image[0].width;
      var h = image[0].height;
      var c = that.getCanvas(w, h);
      var data = that.filterImage(vimg, w, h, c);
      var ctx = c.getContext('2d');
      ctx.putImageData(data, 0, 0);
      var dataURI = c.toDataURL();
      if (image[0].dataset.src == undefined) { // Remember original src, useful when applying White.run multiple times
        image[0].dataset.src = image[0].src;
      }
      image[0].src = dataURI;
      image[0].style.visibility = image[3];
      that.loadLeft -= 1;
    }

    vimg.onerror = function(a,b,c) {
      if (proxy == true) { // Show original image if nothing can be done.
        image[0].src = image[1];
        that.loadLeft -= 1;
      } else {
        that.applyToImage(image, true); // If error, try using proxy
      }
    }

    var src;
    if (proxy) {
      src = this.proxy+image[1];
    } else {
      src = image[1];
    }

    if (src.indexOf(this.origin) != 0) { // Enable cross-origin if src url is not on origin
      vimg.crossOrigin = "Anonymous";
    }

    vimg.src = src;
  },
  restoreImage: function(img) {
    if (img.dataset.src != undefined && img.tagName == "IMG") {
      img.src = img.dataset.src;
    }
  },
  getCanvas: function(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  },
  filterImage: function(image, w, h, c) {
    return this.filter(this.getPixels(image, w, h, c));
  },
  getPixels: function(img, w, h, c) {
    var ctx = c.getContext('2d');

    // Grayscale
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'luminosity';

    ctx.drawImage(img, 0, 0, c.width, c.height);
    return ctx.getImageData(0,0,c.width,c.height);
  },
  filter: function(pixels) {
    var d = pixels.data;

    // Brightness
    for (var i=0; i<d.length; i+=4) {
      d[i] += this.brightness;
      d[i+1] += this.brightness;
      d[i+2] += this.brightness;
    }

    // Contrast
    var factor = (259 * (this.contrast + 255)) / (255 * (259 - this.contrast));
    for (var i=0; i<d.length; i+=4) {
      d[i] = factor * (d[i] - 128) + 128;
      d[i+1] = factor * (d[i+1] - 128) + 128;
      d[i+2] = factor * (d[i+2] - 128) + 128;
    }

    // Black Threshold
    for (var i=0; i<d.length; i+=4) {
      var r = d[i];
      var g = d[i+1];
      var b = d[i+2];
      if (r < this.black_threshold) {
        d[i] = this.black_threshold;
      }
      if (g < this.black_threshold) {
        d[i+1] = this.black_threshold
      }
      if (b < this.black_threshold) {
        d[i+2] = this.black_threshold;
      }
    }

    // White Threshold
    for (var i=0; i<d.length; i+=4) {
      var r = d[i];
      var g = d[i+1];
      var b = d[i+2];
      if (r > this.white_threshold) {
        d[i] = this.white_threshold;
      }
      if (g > this.white_threshold) {
        d[i+1] = this.white_threshold
      }
      if (b > this.white_threshold) {
        d[i+2] = this.white_threshold;
      }
    }

    return pixels
  }
};
