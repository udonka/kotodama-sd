function average(image1, image2){

  if(image1.width != image2.width || image1.height != image2.height)
  {
    throw new Error("image size different");
  }


  var newImage = new ImageData(image1.width, image1.height);
  var newPixels = newImage.data;
  //単なる配列でもよい

  var pixels1 = image1.data;
  var pixels2 = image2.data;
  var height = image1.height;
  var width = image1.width;


  var red   = 0;
  var green = 1;
  var blue  = 2;
  var alpha = 3;

  // ピクセル単位で操作できる
  for (var y = 0; y < height; ++y) {
    for (var x = 0; x < width; ++x) {
      var base = (y * width + x) * 4;
      // なんかピクセルに書き込む
      newPixels[base + red]   = (pixels1 [base + red]   + pixels2 [base + red]   )/2;
      newPixels[base + green] = (pixels1 [base + green] + pixels2 [base + green] )/2;
      newPixels[base + blue]  = (pixels1 [base + blue]  + pixels2 [base + blue]  )/2;
      newPixels[base + alpha] = (pixels1 [base + alpha] + pixels2 [base + alpha] )/2;
    }
  }

  return {
    image:newImage
  };



}

function linize(imageData){
  var v_linized = verticalLinize(imageData);
  var h_linized = horizontalLinize(imageData);

  var linized = average(h_linized.image,v_linized.image);

  return linized;
}


function verticalLinize(imageData){
  var win = [
    [ 0, -1, 0],
    [ 0,  0, 0],
    [ 0,  1, 0],
  ];

  var ret =filter(imageData,win);

  return ret;
}

function horizontalLinize(imageData){

  var win = [
    [ 0, 0, 0],
    [-1, 0, 1],
    [ 0, 0, 0],
  ];

  var ret =filter(imageData,win);

  return ret;
}

function filter(imageData, win){
  var newImage = new ImageData(imageData.width,imageData.height);

  var height = imageData.height;
  var width = imageData.width;


  for (var y = 1; y < height-1; ++y) {
    for (var x = 1; x < width-1; ++x) {
      var value = 0;
      for(var i = -1; i <= 1; i++){
        for(var j = -1; j <= 1; j++){
          if(!(i == 0 && j == 0)){
            var base = ((y+j) * width + (x+i)) * 4;
            var winValue = win[1+j][1+i];
            value += getPixel(imageData, x + i, y + j).red * winValue; 
          }
        }
      }

      value = Math.floor(Math.abs(value));
      setPixel(newImage, x, y, value, value, value, 255);
    }
  }


  var p = getPixel(newImage, 1, 1);
  for (var y = 0; y < height; ++y) {
    setPixel(newImage, 0,       y, p.red, p.green, p.blue, p.alpha);
    setPixel(newImage, width-1, y, p.red, p.green, p.blue, p.alpha);
  }

  for (var x = 0; x < width; ++x) {
    setPixel(newImage, x,       0, p.red, p.green, p.blue, p.alpha);
    setPixel(newImage, x, height-1, p.red, p.green, p.blue, p.alpha);
  }


  return {
    image:newImage
  };
}



function grayize(imageData){
  var newImage = new ImageData(imageData.width,imageData.height);
  //単なる配列でもよい

  var height = imageData.height;
  var width = imageData.width;


  // ピクセル単位で操作できる
  for (var y = 0; y < height; ++y) {
    for (var x = 0; x < width; ++x) {

      var color = getPixel(imageData, x, y);

      var value = (color.red + color.green + color.blue)/3; 

  
      setPixel(newImage, x, y, value,value,value,255);
      
    }
  }

  return {
    image:newImage
  };
}

function antiAntialias(imageData){
  //まわりの色と同じ場合、そのまま
  //ちがう場合黒く塗ってみる

  var newImage = new ImageData(imageData.width,imageData.height);

  var height = imageData.height;
  var width = imageData.width;


  for (var y = 0; y < height; ++y) {
    for (var x = 0; x < width; ++x) {

      var value = 0;
      //ヒストグラムをつくくって、多数決

      var histogram = {};
      for(var i = -1; i <= 1; i++){

        if(x + i < 0 || x + i >= width){
          continue;
        }

        for(var j = -1; j <= 1; j++){
            if(y + j < 0 || y + j >= height){
              continue;
            }

            var color = colorToInt(getPixel(imageData, x + i, y + j));

            //投票
            histogram[color] = (histogram[color]  || 0 ) + 1;
        }
      }


      var maxColor = Object.keys(histogram)[0];
      var maxValue = histogram[maxColor];

      for(color in histogram){
        if(histogram[color] > maxValue){
          maxColor = color;
          maxValue = histogram[color];
        }
      }

      maxColor = intToColor(maxColor); //intだったのをオブジェクトに変換


      setPixel(newImage, x, y, maxColor.red , maxColor.green, maxColor.blue, maxColor.alpha);

    }
  }

  return {
    image:newImage
  };

}


var getPixel =(function(){

  var RED_INDEX  = 0;
  var GREEN_INDEX= 1;
  var BLUE_INDEX = 2;
  var ALPHA_INDEX= 3;

  return function (image, x, y){
    var width = image.width;
    var base = (y * width + x) * 4;

    var pixels = image.data;

    return { 
      red:pixels[base + RED_INDEX],
      green:pixels[base + GREEN_INDEX],
      blue:pixels[base + BLUE_INDEX],
      alpha:pixels[base + ALPHA_INDEX],
    };
  }

}());


function colorToInt(pixelObj){
  var shiftRed = pixelObj.red << 24;
  var shiftGreen= pixelObj.green << 16;
  var shiftBlue = pixelObj.blue << 8;
  var shiftAlpha= pixelObj.alpha << 8;

  return 0 | shiftRed | shiftGreen | shiftBlue | shiftAlpha;
}


function intToColor(intValue){
  intValue 

  var wind = 255;

  var alpha = intValue & wind;
  intValue = intValue >> 8;
  var blue = intValue & wind;
  intValue = intValue >> 8;
  var green= intValue & wind;
  intValue = intValue >> 8;
  var red  = intValue & wind;

  return {
    red:red,
    green:green,
    blue:blue,
    alpha:alpha
  };
}






var setPixel =(function(){

  var RED_INDEX  = 0;
  var GREEN_INDEX= 1;
  var BLUE_INDEX = 2;
  var ALPHA_INDEX= 3;

  return function (image, x, y , red, green, blue, alpha){
    var width = image.width;
    var base = (y * width + x) * 4;

    var pixels = image.data;

    pixels[base + RED_INDEX] = red;
    pixels[base + GREEN_INDEX] = green;
    pixels[base + BLUE_INDEX] = blue;
    pixels[base + ALPHA_INDEX] = alpha;
  };
}());

function binarize(imageData, thre){
  thre = thre || 0;
  var newImage = new ImageData(imageData.width,imageData.height);
  var newPixels = newImage.data;

  var pixels = imageData.data;
  var height = imageData.height;
  var width = imageData.width;
  var area = 0;

  var red   = 0;
  var green = 1;
  var blue  = 2;
  var alpha = 3;

  // ピクセル単位で操作できる
  for (var y = 0; y < height; ++y) {
    for (var x = 0; x < width; ++x) {
      var base = (y * width + x) * 4;

      var gray_value = (pixels[base + red] + pixels[base + green] + pixels[base + blue])/3;
      

      if(gray_value < thre){
        area++;
        newPixels[base + red]   = 0;
        newPixels[base + green]   = 0;
        newPixels[base + blue]   = 0;
        newPixels[base + alpha]   = 255;
      }
      else{
        newPixels[base + red]   = 255;
        newPixels[base + green]   = 255;
        newPixels[base + blue]   = 255;
        newPixels[base + alpha]   = 255;

      }
      

    }
  }

  return {
    blackVolume:area / (width*height),
    whiteVolume:1 - area / (width*height),
    image:newImage
  };
}

