var White = {
  contrast: 80,
  brightness: 33,
  black_threshold: 50,
  canvasReference: [],
  images: [],
  origin: window.location.origin,
  proxies: ["http://crossorigin.me/", "http://cors.io/?u="],
  init: function() {
    this.hideImages();
    this.canvasReference = [];
    var images = document.getElementsByTagName("img");
    for (var img in this.images) {
      if (this.images[img][0].style != undefined) {
        var image = this.images[img]
        this.applyToImage(image, false);
      }
    }
  },
  applyToImage: function(image, proxy) {
    var that = this;
    var vimg = new Image();
    vimg.onload = function() {
      var h = image[0].height;
      var w = image[0].width;
      var data = that.filterImage(vimg);
      var c = document.createElement("canvas");
      c.height = h;
      c.width = w;
      var ctx = c.getContext('2d');
      ctx.putImageData(data, 0, 0);
      image[0].parentNode.insertBefore(c, image[0].nextSibling);
      that.canvasReference.push(c);
    }
    vimg.onerror = function() {
      if (proxy == true) { // Show original image if nothing can be done.
        image[0].style.display = image[1];
      } else {
        that.applyToImage(image, true);
      }
    }
    if (image[0].src.indexOf(this.origin) != 0) { // Setting this when on origin causes a hang
      vimg.crossOrigin = "Anonymous";
    }
    var src;
    if (proxy) {
      src = this.proxies[0]+image[0].src;
    } else {
      src = image[0].src;
    }
    vimg.src = src;
  },
  hideImages: function() {
    var images = document.getElementsByTagName("img");
    for (var img in images) {
      if (images[img].style != undefined) {
        this.images.push([images[img], images[img].style.display])
        images[img].style.display = "none";
      }
    }
  },
  getPixels: function(img) {
    var c = this.getCanvas(img.width, img.height);
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return ctx.getImageData(0,0,c.width,c.height);
  },
  getCanvas: function(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  },
  filterImage: function(image) {
    return this.filter(this.getPixels(image));
  },
  filter: function(pixels, args) {
    this.brightness = White.brightness;
    this.contrast = White.contrast;
    this.black_threshold = White.black_threshold;
    var data = pixels.data;
    var d = pixels.data;

    // Greyscale
    for (var i=0; i<d.length; i+=4) {
      var r = d[i];
      var g = d[i+1];
      var b = d[i+2];
      // CIE luminance for the RGB
      // The human eye is bad at seeing red and blue, so we de-emphasize them.
      var v = 0.2126*r + 0.7152*g + 0.0722*b;
      d[i] = d[i+1] = d[i+2] = v
    }

    // Brightness
    for (var i=0; i<d.length; i+=4) {
      d[i] += this.brightness;
      d[i+1] += this.brightness;
      d[i+2] += this.brightness;
    }

    // Contrast
    var factor = (259 * (this.contrast + 255)) / (255 * (259 - this.contrast));
    for (var i=0; i<data.length; i+=4) {
      data[i] = factor * (data[i] - 128) + 128;
      data[i+1] = factor * (data[i+1] - 128) + 128;
      data[i+2] = factor * (data[i+2] - 128) + 128;
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

    return pixels
  }
};
