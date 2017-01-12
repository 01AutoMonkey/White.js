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
  run: function(selector) {
    this.proxy_index = 0;
    this.loadLeft = 0;
    this.selector = this.selector || selector;
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

    console.log(src)
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