var Kotodama = function(options, viewOptions){
  riot.observable(this); //make it event emmitter

  var defaults = {
    cohesion   : 0.5,
    separation : 0.5,

    shape      : 3,
    colorHue   : 0,
    colorSat   : 0.8,
    colorVal   : 0.8,
    colorAlpha: 0.8,
    angle      : 0,

    tamaNum    : 3,
    sizeDiff   : 0.9,
    forceDiff   : 0,
    seed       : 0, //random seed
  };

  this.changed = true;
  this.viewOptions = viewOptions;
  this.options = _.defaults(options.generateOptions || {}, defaults);
  this.tamas = [];
  this.setOptions(this.options);
};

Kotodama.prototype.generateTamas = function(tamaNum){
  if(tamaNum > this.tamas.length){
    //add
    var diffNum = tamaNum - this.tamas.length;
    for(var i = 0; i < diffNum; i++){
      var newTama = new Tama(this, { 
        position:new Vec2(0,0)
      });
      this.tamas.push(newTama);
    }
  }
  else if(tamaNum < this.tamas.length){
    //delete
    var diffNum = this.tamas.length - tamaNum;
    for(var i = 0; i < diffNum; i++){
      this.tamas.pop();
    }
  }
  else{ // if(tamaNum == this.tamas.length)

  }
};



Kotodama.prototype.getOptions = function(){
  return Object.assign({}, this.options);
};

Kotodama.prototype.setOptions = function(options){
  this.options = _.defaults(options, this.options);

  this.drawSize = 200;

  //決定的な定数
  this.tamaSizeAve = 20; //図形の大きさの平均値
  this.cohK = 0.01;
  this.angCohK = 0.1;

  //これは非常に重要。separationの大きさと協力して、印象に大きな差をもたらす

  // 自分の角度
  this.angle = new Angle(this.options.angle); //例外的

  // 数合わせをする。
  // 足りなければ補充、余分なら削除、数が変わらないなら何もしない。
  this.generateTamas(this.options.tamaNum);


  var diff = Number(this.options.sizeDiff);//[0,1]

  var length = this.tamas.length;

  for(var i = 0; i < length; i++ ){
    var tama = this.tamas[i];
    var ratio= i/length; //[0,1)
    var size =  this.tamaSizeAve * ( - 2*diff*ratio + 1+diff) ;


    tama.setOptions({
      size:    size, //size
      shapeN:   this.options.shape,

      colorHue:    this.options.colorHue,
      colorSat:    this.options.colorSat,
      colorVal:    this.options.colorVal,
      colorAlpha:    this.options.colorAlpha,

      sepK:     this.options.separation,
      cohK:     this.cohK,
      forceDiff:    this.options.forceDiff, 

      angSepK:     this.options.angleSeparation,
      angCohK:     this.angCohK,
      angle:    this.options.angle,
   });

  }

  this.changed = true;

  var this_kotodama = this;
  setTimeout(function(){
    this_kotodama.trigger("changed");
  },100);
};


//kotodam.setOption({seed: 3});
//とかできる


Kotodama.prototype.move = function(t){
    var leader = this.tamas[0];


    for(var i in this.tamas){
      var tama = this.tamas[i];
      tama.see(this.tamas, this);
    }

    //動きながら、位置の中心を求め、 止まってるかどうかを確認する

    var pAve = new Vec2(0,0);
    var vAve = new Vec2(0,0);
    for(var i in this.tamas){
      var tama = this.tamas[i];
		
      if(i == 0){
        tama.move(new Vec2(0,0.3* Math.sin(t/800)));
      }



      tama.move();
      pAve.add(tama.position);
      vAve.add(tama.velocity);
    }

    pAve.div(this.tamas.length); 
    vAve.div(this.tamas.length); 

    //位置の中心がずれていたら、その分引き算する
    //c.translate(-pAve.x, -pAve.y); これでもいいけど、どっちみちpAveまだ使う

    var maxR = 0;
    //中心を補正しつつ、一番はじをもとめる
    for(var i in this.tamas){
      var tama = this.tamas[i];
      tama.position.sub(pAve);
      var r = tama.position.getLength() + tama.size;
      if(r > maxR){
        maxR = r;
      }
      tama.velocity.sub(vAve);
    }

    this.maxR = maxR;

    this.calcStopped();

}


Kotodama.prototype.getDrawingRatio = function(){
  var ratio = this.drawSize / (this.maxR * 2 ) ;
  return ratio * 0.95;
}

Kotodama.prototype.hasChanged = function(){
  return this.changed;
}

Kotodama.prototype.isStopped = function(){
  return this.stopped;
}

Kotodama.prototype.calcStopped = function(){
  var stopped = true;

  for(var i in this.tamas){
    var tama = this.tamas[i];
    stopped = stopped && tama.isStopped();
  }

  //前と状態が変わったら
  if(this.stopped == false && stopped == true){

    var this_kotodama = this;
    setTimeout(function(){
      this_kotodama.trigger("stopped");
    },100);
  }

  this.stopped = stopped;

  return stopped;
}



