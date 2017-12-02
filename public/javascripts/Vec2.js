/**
* 2Dベクトルを扱うクラスです。

* 内積や外積、ベクトルの加算乗除などほぼ全ての演算ができます。
* 
* @author saharan
* 
*/
console.log("loading vec2");

function nancheck(x,y){
  if(isNaN(x) || isNaN(y)){
    throw new Error("isNaN");
  }
}

var Vec2 = function (x, y){

  if(x instanceof Vec2){
    var vec = x;
    return new Vec2(vec.x, vec.y); 
  }

  nancheck(x,y);

  /** ベクトルの値です。 */
  this.x = typeof x === "number" ? x : 0;
  this.y = typeof y === "number" ? y : 0;
};

//使われないみたい。
Vec2.prototype.toString = function(){
  return "[Vec "+this.x+", "+this.y+"]";
};
  


/**
* 値をセットします。
* 
* @param x
* x値
* @param y
* y値
*/
Vec2.prototype.set = function(x, y){
  if(x instanceof Vec2){
    var vec = x;

    this.x = vec.x;
    this.y = vec.y;
    return;
  }

  this.x = x;
  this.y = y;
};
  
  
  /**
  * 角座標Rの値をセットします。
  * 
  * @param r
  * 長さ
  */
Vec2.prototype.setLength = function(r){
  this.normalize(); //長さ1にしてから
  this.mul(r); //長さをかける
};
  


  /**
  * 角座標θの値をセットします。
  * 
  * @param theta
  * 角度
  */
Vec2.prototype.setTheta = function(theta){
    var r = this.getLength();
    this.x = r * Math.cos(theta);
    this.y = r * Math.sin(theta);
};


  /**
  * 角座標θの値をゲットします。
  */
  
Vec2.prototype.getTheta = function(){
  return Math.atan2(y,x);
};

  /**
  * 値を0にリセットします。
  
Vec2.prototype.zero = function(){
  this.set(0,0);
}
  */


  /**
  * ベクトルを加算します。
  * 
  * @param v
  * 加算するベクトル
  * @return 加算されたベクトル
  */
  
Vec2.prototype.add = function(vec){
    this.x += vec.x;
    this.y += vec.y;

    nancheck(this.x,this.y);
    return this;
};
  /**
  * ベクトルを減算します。
  * 
  * @param v
  * 減算するベクトル
  * @return 減算されたベクトル
  */
  
Vec2.prototype.sub = function(vec){
    this.x -= vec.x;
    this.y -= vec.y;

    nancheck(this.x,this.y);

    return this;

};
  /**
  * ベクトルを乗算します。
  * 
  * @param v
  * 乗算するベクトル
  * @return 乗算されたベクトル
  */
Vec2.prototype.mul = function(f){
    this.x *= f;
    this.y *= f;

    nancheck(this.x,this.y);
    return this;

};
  /**
  * ベクトルを除算します。
  * 
  * @param v
  * 除算するベクトル
  * @return 除算されたベクトル
  */

Vec2.prototype.div = function(f) {
  if (f === 0)
    throw new Error("DIV BY 0");
  this.x /= f;
  this.y /= f;

  nancheck(this.x,this.y);
  return this;
};
  
  /**
  * ベクトルを加算した結果を返します。
  * 
  * @param v
  * 加算するベクトル
  * @return 加算されたベクトル
  */
  
Vec2.prototype.getAdd = function(vec){
  return new Vec2(this.x + vec.x, this.y + vec.y);

};
  /**
  * ベクトルを減算した結果を返します。
  * 
  * @param v
  * 減算するベクトル
  * @return 減算されたベクトル
  */
  
Vec2.prototype.getSub = function(vec){
  return new Vec2(this.x - vec.x, this.y - vec.y);
};
  /**
  * ベクトルを乗算した結果を返します。
  * 
  * @param v
  * 乗算するベクトル
  * @return 乗算されたベクトル
  */

Vec2.prototype.getMul = function(f){
  return new Vec2(this.x * f, this.y * f);
};
  
  /**
  * ベクトルを除算した結果を返します。
  * 
  * @param v
  * 除算するベクトル
  * @return 除算されたベクトル
  */
  
Vec2.prototype.getDiv = function(f){
  if (f === 0)
    throw new Error("DIV BY 0");

  return new Vec2(this.x / f, this.y / f);
};
  /**
  * ベクトルの長さを返します。
  * 
  * @return このベクトルの長さ
  */

Vec2.prototype.getLength = function(){
  return Math.sqrt(this.getSquareLength());
};

Vec2.prototype.getSquareLength = function(){
  var x = this.x;
  var y = this.y;

  nancheck(x,y);
  return x * x + y * y;
};
  
  /**
  * ベクトルを正規化します。 
  
  * 正規化されたベクトルは getLength() == 1 という条件を見たします。
  
  * ただし非常に長さが短いときや、長さが0のときは正しく正規化されません。
  */

Vec2.prototype.normalize = function(){
    var length = this.getLength();
    if (length < 0.0001)
      length = 1.0;
    this.x /= length;
    this.y /= length;

    nancheck(this.x,this.y);
    return this;
};
  
  /**
  * 正規化されたベクトルを返します。
  * 
  * @return 正規化されたベクトル
  * @see #normalize()
  */

Vec2.prototype.getNormalize = function(){
  var length = this.getLength();
  if (length < 0.0001)
    length = 1.0;

  return new Vec2(this.x / length, this.y / length);
};

  /**
  * ベクトルを反転させます。
  */
  
Vec2.prototype.reverse = function(){
  this. x *= -1;
  this.y *= -1;
  return this;
};
  /**
  * 反転したベクトルが返されます。
  * 
  * @return 反転されたベクトル
  */

Vec2.prototype.getReverse = function(){
  return new Vec2(-x, -y);
};

  /**
  * ベクトルをラジアン角で回転させます。
  
  * 度数からラジアンへの変更は Mathf.toRadians が使えます。
  * 
  * @param radian
  * ラジアン単位の角度
  * @see Mathf#toRadians(float degree)
  */

Vec2.prototype.rotate = function(radian){
    var x2 = (-Math.sin(radian) * this.y + Math.cos(radian) * this.x);
    var y2 = (Math.cos(radian) * this.y + Math.sin(radian) * this.x);
    this.x = x2;
    this.y = y2;

};
  /**
  * ベクトルをラジアン角で回転させた結果を返します。
  
  * 度数からラジアンへの変更は Mathf.toRadians が使えます。
  * 
  * @param radian
  * ラジアン単位の角度
  * @return 回転後のベクトル
  * @see Mathf#toRadians(float degree)
  */
  
Vec2.prototype.getRotate = function(radian){
  var x2 = (-Math.sin(radian) * this.y + Math.cos(radian) * this.x);
  var y2 = (Math.cos(radian) * this.y + Math.sin(radian) * this.x);
  return new Vec2(x2,y2);
};
  /**
  * @see Object#clone()
  */

Vec2.prototype.clone = function(){
  return new Vec2(this.x, this.y);
};
  

 
  
  /**
  * 二つのベクトルの内積を返します。
  * 
  * @param v
  * 一つ目のベクトル
  * @param v2
  * 二つ目のベクトル
  * @return 内積
  */

Vec2.prototype.dot = function(v){
  return this.x * v.x + this.y * v.y;
};
  
  /**
  * 長さの二乗を返します。
  * 
  * @return 長さの二乗
  */


  /**
  * 2つの点の距離を返します
  * @param v
  * 相手のベクトル
  * @return 点間の距離
  */  
Vec2.prototype.distance = function(v){
  return this.getSub(v).getLength();
};

//test code
if(1){
  var vec = new Vec2(3, 5);

  var vec2 = new Vec2(2,6);
  console.assert(vec);
  console.assert(vec2);

  vec.add(vec2);

  console.assert(vec);
  console.assert(vec.getLength());
}
