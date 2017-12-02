var Tama = function(kotodama, options){
  this.kotodama = kotodama;
  this.position = new Vec2(0,0);
    this.velocity =  new Vec2(0,0);

  this.cohK = options.cohK || 0.001;
  this.sepK = options.sepK || 0.1;

  this.angCohK = options.angCohK || 1;
  this.angSepK = options.angSepK || 1;
    this.vision = [];//最初は誰も見えていない

  this.colorHue = options.colorHue || 0;
  this.colorSat = options.colorSat || 0.8;
  this.colorVal = options.colorVal || 0.8;

  this.colorAlpha = options.colorAlpha || 1;

  this.size = options.size || 10;
  this.shapeN = options.shapeN || 3;
  this.angle = new Angle(options.angle || 0); //vec
    this.angleVel = Angle.createDiffAngle(0);
    this.moment = Angle.createDiffAngle(0);
    this.sepMoment = Angle.createDiffAngle(0);
    this.cohMoment = Angle.createDiffAngle(0);


  this.cohForce = new Vec2(0,0);
  this.sepForce = new Vec2(0,0);
  this.force    = new Vec2(0,0);

  this.forceDiff = options.forceDiff || 0;  // abe, 追加

};

var moveRand = RandomGenerator(0);

Tama.prototype.setOptions = function(options){//context,time,environament

  var opt = _.defaults(options, this);

  this.size   = opt.size;
  this.shapeN = opt.shapeN;

  //this.angle  = new Angle(opt.angle);
  this.colorHue  = opt.colorHue;
  this.colorSat  = opt.colorSat;
  this.colorVal  = opt.colorVal;
  this.colorAlpha  = opt.colorAlpha;

  //position
  this.cohK   = opt.cohK;
  this.sepK   = opt.sepK;
  this.forceDiff = opt.forceDiff; 

  //angle
  this.angCohK = opt.angCohK;
  this.angSepK = opt.angSepK;

}



Tama.prototype.see = function(agents, kotodama){//重なってる数を返す
  var newVision = [];
  //var collisionNum = 0;
  for(var i in agents) if(agents[i] != this){ //自分は除く近い奴
    var agent = agents[i];
    var diff = agent.position.getSub(this.position);

    /*
    if( this.size + agent.size > diff.getLength()){
      collisionNum ++;
    }
    */

    var angleDiff = agent.angle.calcDiff(this.angle);


    newVision.push({
      direction: diff,
      angle: angleDiff
    });
  }

  this.vision = newVision;// 視野ないのエージェントの相対位置など
  //return collisionNum;
}

Tama.prototype.move = function( defaultForce){//context,time,environament
  var force = defaultForce || new Vec2(0,0);
  this.moment = Angle.createDiffAngle(0);

  //まだばぐあり
  this.sepMoment = this.angleSeparation(this.angSepK);
  this.cohMoment = this.angleCohesion(this.angCohK);
  this.moment .add(this.sepMoment);
  this.moment .add(this.cohMoment);//max:1

  this.cohForce = this.cohesion(this.cohK);
  this.sepForce = this.separation(this.sepK);


  this.force = force;
  var unit = 0.1;

  /* ランダム振動
  force.add(new Vec2(
        moveRand(-unit,unit),
        moveRand(-unit,unit))); */

  force.add(this.cohForce);
  force.add(this.sepForce);

  this.velocity.add(force);
  this.velocity.mul(0.8);
  this.position.add(this.velocity);

  this.angleVel.add(this.moment);
  this.angleVel.set(this.angleVel.get()*0.8);
  this.angle.add(this.angleVel);

}

Tama.prototype.isStopped = function(){//context,time,environament
  var velLength = this.velocity.getLength();
  var angleVel  = this.angleVel.get();

  return  velLength < 0.01 && angleVel < 0.001;
}

Tama.prototype.cohesion= function(k){//context,time,environament
  if(this.vision.length > 0){
    var center = new Vec2(0,0);

    //集団の中心を計算し、そこへ向かう
    for(var i in this.vision){
      var object = this.vision[i];
      center.add(object.direction);
    }

    center.div(this.vision.length);//平均をもとめて、そこへ向かう

    return center.mul(k); // 中心へ集まろうとする力を k倍する
  }
  else{
    return new Vec2(0,0);
  }
}

Tama.prototype.separation = function(k){//context,time,environament
  if(this.vision.length > 0){
    var force = new Vec2(0,0);

    var slope = this.forceDiff; // = forceDiff [-1, 1]
    var intersept = - slope + 1; // [0,2]
    var sizeRatio = this.size/this.kotodama.tamaSizeAve ; // (0,2]

    var f = (slope) * (sizeRatio) + (intersept);


    for(var i in this.vision){
      var object = this.vision[i];
      var F = new Vec2(object.direction).mul(-1);
      var distLength = F.getLength();

      if(distLength == 0){//完全に重なっている場合、
        //ランダムな力をかけるほかあるまい。

        force.add(new Vec2(rand.gaussian(), rand.gaussian() ));
        continue;
      }

      F.normalize().mul(1/distLength*f*k);// /this.size*30); サイズによって変えると、動いちゃう。
      force.add(F);
    }

    return force;
  }
  else
  {
    return new Vec2(0,0);
  }
}


Tama.prototype.angleCohesion = function(k){//context,time,environament
  var cohMom = this.kotodama.angle.calcDiff(this.angle);

  return cohMom.get() / (this.vision.length+1) * k;

  /*
  if(this.vision.length > 0){
    var cohMom = this.kotodama.angle.calcDiff(this.angle);

    return cohMom.get()/this.vision.length*k;//平均だから
  }
  else{
    return 0;
  }
  */
}

Tama.prototype.angleSeparation = function(k){//context,time,environament
  if(this.vision.length > 0){
    var moment = 0;
    for(var i in this.vision){
      var object = this.vision[i];

      if(object.angle.get() == 0)
      {
        moment += moveRand(-0.000001,0.000001);
      }
      else if(object.angle.get() == -Math.PI){
        moment += 0;
      }
      else{
        var ang = object.angle.get();
        //var f = -1/ang;
        var f = Math.exp(-ang*ang) * (ang > 0 ? -1:1);

        //fが大きくなりすぎると危険
        //今はkでやわらげている
        moment += (f*k);
      }
    }
    return moment;
  }
  else
  {
    return 0;
  }
}

function drawVec(c, vec, color){
  c.beginPath();
  c.moveTo(0,0);
  c.lineTo(vec.x, vec.y);
  c.strokeStyle = color;
  c.lineWidth = 3;
  c.stroke();
  c.closePath();
}



Tama.prototype.draw = function(c,options){//context,time

  c.save();

    c.translate(this.position.x, this.position.y);


    c.save();

      c.rotate(this.angle.get() / this.shapeN);
      c.scale(this.size,this.size);
      //color
      c.strokeStyle = "rgba(0,0,0,0)";
      c.fillStyle = hsva(
          this.colorHue   || 0.8,
          this.colorSat   || 0.8,
          this.colorVal   || 0.8,
          this.colorAlpha || 0.8);

      //fill & draw
      regularPolygon(c,this.shapeN); //半径1のn角形を描く


      c.strokeStyle = "rgb(0,0,0)";

    c.restore();

    if(options && options.showForceVec){
      drawVec(c,this.sepForce.getMul(50), "rgb(255,0,0)");
      drawVec(c,this.cohForce.getMul(50), "rgb(0,255,0)");
      drawVec(c,this.force   .getMul(50), "rgb(0,0,0)");
    }

    if(options && options.showMomentVec){

      c.save();
        c.rotate(this.angle.get() / this.shapeN);
        c.beginPath();
          c.moveTo(0,0);
          c.lineTo(0,this.size);
          c.lineWidth = 1;
          c.strokeStyle = "rgb(1,1,1)";
          c.stroke();
        c.closePath();

        c.beginPath();
          c.arc(0,0,this.size,
              Math.PI/2,
              Math.PI/2+this.moment.get()*100,
              this.moment.get() < 0)

          c.lineWidth = 1;
          c.strokeStyle = "rgb(1,1,200)";
          c.stroke();

        c.closePath();

        c.beginPath();
          c.arc(0,0,this.size*0.8,
              Math.PI/2,
              Math.PI/2+this.sepMoment*10,
              this.sepMoment < 0)

          c.lineWidth = 1;
          c.strokeStyle = "rgb(200,0,0)";
          c.stroke();

        c.closePath();

        c.beginPath();
          c.arc(0,0,this.size*0.9,
              Math.PI/2,
              Math.PI/2+this.cohMoment*10,
              this.cohMoment < 0)

          c.lineWidth = 1;
          c.strokeStyle = "rgb(1,255,1)";
          c.stroke();
        c.closePath();

      c.restore();
    }

  c.restore();

};



