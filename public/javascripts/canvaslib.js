function hsva(h,s,v,a){var f=h/60,i=f^0,m=v-v*s,k=v*s*(f-i),p=v-k,q=k+m;
  return 'rgba(' +[[v,p,m,m,q,v][i]*255^0,
    [q,v,v,p,m,m][i]*255^0,
    [m,m,q,v,v,p][i]*255^0,a].join(',')+')';
}





var regularPolygon = function(c, n){
  if(c === undefined){
    throw new Error("graphic context required.");
  }

  n = Math.max(n, 3);
  c.beginPath();
  if( n > 6 ){
    c.arc(0, 0, 1, 0, 2*Math.PI, true);
  }
  else{
    var theta = 2 * Math.PI / n;
    var ang = Math.PI / 2  ;

    c.moveTo( Math.cos(ang), Math.sin(ang) );
    //底辺が水平になるような位置に移動

    for(var i = 0; i < n; i++){
      ang += theta; 
      c.lineTo(Math.cos(ang), Math.sin(ang));
    }
  }
  c.fill();
  c.stroke();
  c.closePath();
};

var normRand = function (m, s) {
  var a = 1 - Math.random();
  var b = 1 - Math.random();
  var c = Math.sqrt(-2 * Math.log(a));
  if(0.5 - Math.random() > 0) {
      return c * Math.sin(Math.PI * 2 * b) * s + m;
  }else{
      return c * Math.cos(Math.PI * 2 * b) * s + m;
  }
};

var gaussian = normRand;

var RandomGenerator = function(seed){
  seed = seed || 0;

  var random = function(min, max, isInt){
    if(min > max){
      throw new Error("min value is bigger than max value");
    }
    max = max || 1;
    min = min || 0;

    seed = (seed * 9301 + 49297) % 233280; //seedを束縛する
    var rnd = seed / 233280;

    var ret = min + rnd * (max - min);
    return isInt ? Math.floor(ret): ret
  };

  random.gaussian = function(m,s){
    m = m || 0;
    s = s || 1;

    var random = this;

    var a = 1 - random();
    var b = 1 - random();
    var c = Math.sqrt(-2 * Math.log(a));
    if(0.5 - random() > 0) {
        return c * Math.sin(Math.PI * 2 * b) * s + m;
    }else{
        return c * Math.cos(Math.PI * 2 * b) * s + m;
    }
  };

  random.init = function(s){
    seed = s;
  };

  return random;
};


var rand = RandomGenerator(35);


/*
console.log(rand());
console.log(rand());
console.log(rand());
console.log(rand.gaussian());
console.log(rand.gaussian());

rand.init(35);

console.log(rand());
console.log(rand());
console.log(rand());

console.log(rand.gaussian());
console.log(rand.gaussian());

*/
