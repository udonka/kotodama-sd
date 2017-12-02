
function isNumber(x){ 
    if( typeof(x) != 'number' && typeof(x) != 'string' )
        return false;
    else 
        return (x == parseFloat(x) && isFinite(x));
}

var Angle = function(init, min, max){
  //numeric construction

  if(isNumber(init) && isNumber(min) && isNumber(max)){
    this.theta = 0;

    this.max = max;
    this.min = min;

    this.set(init)
  }
  else if(min == undefined && max == undefined && init instanceof Angle){
    Angle.call(this, init.theta, init.min, init.max);
  }
  //これが一番使いそう
  else if(min == undefined && max == undefined && isNumber(init)){
    Angle.call(this, init,0,2*Math.PI);
  }
  else if(min == undefined && max == undefined && init == undefined){
    this.max = 2*Math.PI;
    this.min = 0;
    this.set(0);
  }
}


//static method
Angle.createAbsAngle = function(theta){
  return new Angle(theta, 0, 2* Math.PI);
}


Angle.createDiffAngle = function(theta){
  if(isNumber(theta)){
    return new Angle(theta, -Math.PI, Math.PI);
  }
  else{
    return new Angle(0, -Math.PI, Math.PI);
  }
}


Angle.prototype.add = function(ang) {
  if(ang instanceof Angle)
  {

    this.set(
      this.get() 
      + ang.get());
  }
  else if(isNumber(ang)){
    this.set(this.get() + ang);
  }
  return this;
};

Angle.prototype.getAdd = function(ang) {
  if(ang instanceof Angle)
  {
    return new Angle( this.get() + ang.get());
  }
  else if(isNumber(ang)){
    return new Angle(this.get() + ang);
  }

  throw Error("ang should be Angle or number :" + ang);
};

//オーバーロードできた
Angle.prototype.set = function(th){ // min <= th < max
  if(th instanceof Angle){
    this._set(ang.get());
  }
  else if(isNumber(th)){
    this._set(th);
  }
  else
  {
    console.log("数値か角度以外だめです")

    throw Error("ang should be Angle or number :" + th); 
  }

} 

Angle.prototype._set = function(th){ // min <= th < max







  var max = this.max;
  var min = this.min;

  var diff = max - min; // > 0
  var grounded = th - min;
  var dived =  Math.floor(grounded/diff); // int 
  var subed = grounded - diff*dived;

  /*
  if(th >= this.max){

    this._set(this.min + (th-this.max));
    return ;
  }

  if(th < this.min){
    
    this._set(this.max + (th-this.min));
    return ;
  }
  */

  this.theta = subed + min;
}

Angle.prototype.get = function(){ // min <= th < max
  return this.theta;
}


Angle.prototype.toString = function(){ // min <= th < max
  return "(" + this.theta +  ", " + this.min +", " + this.max + ")";
}


Angle.prototype.calcDiff = function(other){
  if(!other instanceof Angle){
    return 0;
  }

  var diff = this.get() - other.get();

    if((-Math.PI <= diff) && (diff <= Math.PI))
    {
      return new Angle(diff, -Math.PI, Math.PI);
    }
    else if(diff < -Math.PI)
    {
      return new Angle(diff + 2*Math.PI, -Math.PI, Math.PI);
    }
    else
    {
      return new Angle(diff - 2*Math.PI, -Math.PI, Math.PI);
    }
}

this['Angle'] = Angle;
this['isNumber'] = isNumber;
