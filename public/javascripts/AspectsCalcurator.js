var AspectsCalcurator  = { };


AspectsCalcurator.kotodamaAspects = function( kotodama){
  var aspects_canvas = document.createElement('canvas');
  aspects_canvas.width = 200;
  aspects_canvas.height = 200;
  var c = aspects_canvas.getContext("2d");

  //白く塗る
  c.fillStyle="#fff";
  c.fillRect(0,0,aspects_canvas.width, aspects_canvas.height);

  this.kotodamaView = new KotodamaView(kotodama, new Vec2(100,100),200);

  this.kotodamaView.draw(c);

  var imageData = c.getImageData(0,0,aspects_canvas.width,aspects_canvas.height);
  console.log(imageData);

  //alphaはない画像を渡す
  obj = this.processImageData(imageData);

  var aspects = obj.aspects;
  var images = obj.images;


  return {
    aspects:aspects,
    images:images
  };
}


AspectsCalcurator.processImageData = function(imageData){
  console.log("process");

  var aspects = {};
  var images = {};
  var ret = {images:images, aspects:aspects};

  console.log(imageData);
  imageData = antiAntialias(imageData).image;

  var grayized  = grayize (imageData);
  images.grayized = grayized.image;


  var linized = linize(imageData);
  images.linized = linized.image;

  var binarizedLinized = binarize(linized.image, 1);
  images.binarizedLinized = binarizedLinized.image;
  aspects.lineVolume = binarizedLinized.whiteVolume;

  var binarized = binarize(imageData, 250);
  images.binarized  = binarized.image;
  aspects.areaVolume = binarized.blackVolume;

  aspects.areaComplexity = aspects.lineVolume / aspects.areaVolume;


  var linizedBinarized = linize(binarized.image);
  //images.linizedBinarized = linizedBinarized.image;

  var binarizedLinizedBinarized = binarize(linizedBinarized.image, 1);
  images.binarizedLinizedBinarized  = binarizedLinizedBinarized.image;

  aspects.lineComplexity = binarizedLinized.whiteVolume/binarizedLinizedBinarized.whiteVolume;

  aspects.complexity = aspects.lineVolume / aspects.areaVolume;

  return ret;
}
