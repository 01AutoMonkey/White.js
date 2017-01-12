var White = {
  selector: "img",
  brightness: 33,
  contrast: 50,
  black_threshold: 40,
  white_threshold: 255,
  images: [],
  origin: window.location.origin,
  proxy: ["http://crossorigin.me/", "http://cors.io/?u="],
  proxy_index: 0,
  loadLeft: 0,
  canvas: document.createElement('canvas'),
  run: function(selector) {
    this.proxy_index = 0;
    this.loadLeft = 0;
    this.selector = this.selector || selector;
    this.factor = (259 * (this.contrast + 255)) / (255 * (259 - this.contrast));
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
      var w = image[0].naturalWidth || image[0].width;
      var h = image[0].naturalHeight || image[0].height;
      var c = that.canvas; //that.getCanvas(w, h);
      c.width = w;
      c.height = h;
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
      if (proxy === true && that.proxy_index === that.proxy.length-1) { // Show original image if nothing can be done.
        that.loadLeft -= 1;
        that.proxy_index = 0;
        image[0].src = image[1];
      } else if (proxy === true && that.proxy_index < that.proxy.length-1) {
        that.proxy_index += 1;
        that.applyToImage(image, true); // try next proxy
      } else { 
        that.applyToImage(image, true); // If error, try using proxy
      }
    }

    var src;
    if (proxy) {
      src = this.proxy[this.proxy_index]+image[1];
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
    var pixels_data_length = pixels.data.length;

    // Pixel Loop
    var r,g,b;
    for (var i = 0; i < pixels_data_length; i += 4) {
      r = i;
      g = i+1;
      b = i+2;

      // Brightness
      pixels.data[r] += this.brightness; // r
      pixels.data[g] += this.brightness; // g
      pixels.data[b] += this.brightness; // b

      // Contrast
      pixels.data[r] = this.factor * (pixels.data[i] - 128) + 128; // r
      pixels.data[g] = this.factor * (pixels.data[i+1] - 128) + 128; // g
      pixels.data[b] = this.factor * (pixels.data[i+2] - 128) + 128; // b

      // Black Threshold
      if (pixels.data[r] < this.black_threshold) { // r
        pixels.data[r] = this.black_threshold;
      }
      if (pixels.data[g] < this.black_threshold) { // g
        pixels.data[g] = this.black_threshold;
      }
      if (pixels.data[b] < this.black_threshold) { // b
        pixels.data[b] = this.black_threshold;
      }

      // White Threshold
      if (pixels.data[r] > this.white_threshold) { // r
        pixels.data[r] = this.white_threshold;
      }
      if (pixels.data[g] > this.white_threshold) { // g
        pixels.data[g] = this.white_threshold;
      }
      if (pixels.data[b] > this.white_threshold) { // b
        pixels.data[b] = this.white_threshold;
      }
    }

    return pixels
  }
};

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  //var query = window.location.search.substring(1);
  var query = document.currentScript.getAttribute("src").split("?")[1];
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();

if (QueryString.proxy) White.proxy = QueryString.proxy;
if (QueryString.selector) White.selector = QueryString.selector;
if (QueryString.brightness) White.brightness = parseInt(QueryString.brightness);
if (QueryString.contrast) White.contrast = parseInt(QueryString.contrast);
if (QueryString.black_threshold) White.black_threshold = parseInt(QueryString.black_threshold);
if (QueryString.white_threshold) White.white_threshold = parseInt(QueryString.white_threshold);
if (QueryString.selector) White.selector = QueryString.selector;
if (QueryString.run === "true") White.run();