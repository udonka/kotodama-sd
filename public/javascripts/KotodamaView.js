function KotodamaView(kotodama, opts){
  this.kotodama = kotodama;

  opts = _.defaults(opts, {
    position: new Vec2(100,100),
    size: 200,
    showBox: false,
    showAxis: false,
    showForceVec: false,
    showMomentVec: false
  });


  _.extend(this, opts);

  console.log(this);

}



KotodamaView.prototype.draw = function(c){
  this.kotodama.changed = false;

  //move のときに計算される、maxRに依存している
  var ratio = this.kotodama.getDrawingRatio();

  c.save();
    c.translate(this.position.x, this.position.y);
    var screenRatio = this.size / this.kotodama.drawSize;
    c.scale(screenRatio, -screenRatio);//x → y ↑
    //以下、原点 0,0 のまわりの 辺がdrawSize*2の正方形の中に書くことだけ考えればよい

    c.lineWidth = 0.5;
    c.strokeStyle= "#eee";

    var drawSize = this.kotodama.drawSize;

    if(this.showBox){
      c.strokeRect(-drawSize/2,- drawSize/2,drawSize, drawSize);
    }

    if(this.showAxis){
      c.strokeRect(0,0,drawSize/2,drawSize/2);
      c.strokeRect(0,0,drawSize/2,drawSize/2);
    }


    c.scale(ratio,ratio);

    for(var i in this.kotodama.tamas){
      var tama = this.kotodama.tamas[i];
      tama.draw(c,{
        showForceVec:  this.showForceVec,
        showMomentVec: this.showMomentVec
     });
    }

  c.restore();

}


KotodamaView.prototype.setOptions = function(opts){
  _.extend(this, opts);

  console.log(this);


}

