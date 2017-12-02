
riot.tag2('params-combinator', '<h1>combinations</h1> <input type="submit" value="start loop" onclick="{startLoop}"> <input type="submit" value="stop loop" onclick="{stopLoop}"> <div style="height: 30em;overflow:scroll"> <ul> <li each="{combi,index in combinations}"><a href="#{combi.url}">{index} - {JSON.stringify(combi)} </a></li> </ul> </div>', '', '', function(opts) {
    var param_variations = {
      tamaNum:  [3, 15], sizeDiff: [0, 1], forceDiff: [-1, 1],
      separation: [0, 1], angleSeparation: [0, 0.1],
      angle: [0], shape: [3, 4, 10], colorHue:[0], colorSat: [0],
      colorVal: [0.5], colorAlpha: [0.8]
    };

    console.log(param_variations);

    var param_keys = Object.keys(param_variations);

    function makeCombis(variations, keys, memo, combis){
      var depth = memo.length;

      if(depth == keys.length){
        combis.push(memo);
        return combis;
      }

      var key = keys[depth];
      var variation = variations[key];

      for(var i in variation){
        var value = variation[i];
        var newMemo = [].concat(memo);
        newMemo[depth] = value;

        combis = makeCombis(variations, keys, newMemo, combis);
      }
      return combis;
    }

    var combinations = makeCombis(param_variations, param_keys, [],  []);

    combinations =  combinations.map((combi_array)=>{

      var combi_object = _(combi_array).reduce((memo,value,index)=>{
        var key = param_keys[index];
        memo[key] = value;
        return memo;
      },{});

      var url = params2url(combi_object);
      return {params: combi_object, url:url};
    });

    function params2url(params_obj){
      var url = "?";
      url += Object.keys(params_obj).map((key)=>{
        var value = params_obj[key];
        return key + "=" + value
      }).join('&');

      return url;
    }

    combinations = _(combinations).filter((combi)=>{
      var params = combi.params;
      if(params.shape == 10){

        if(params.angle != param_variations.angle[0]){
          return false;
        }

        if(params.angleSeparation != param_variations.angleSeparation[0]){
          return false;
        }
      }

      if(params.separation == 0 && params.angleSeparation == 0 ){
        if(params.tamaNum != param_variations.tamaNum[0]){
          return false;
        }

        if(params.sizeDiff != param_variations.sizeDiff [0]){
          return false;
        }

        if(params.forceDiff != param_variations.forceDiff[0]){
          return false;
        }
      }

      if(params.tamaNum == 3){
        if(params.forceDiff != param_variations.forceDiff[0]){
          return false;
        }
      }

      if(params.sizeDiff == 0){
        if(params.forceDiff != param_variations.forceDiff[0]){
          return false;
        }
      }

      if(params.angleSeparation == 0.1){
        if(params.angle != param_variations.angle[0]){
          return false;
        }
      }

      return true;
    });

    console.log(combinations);

    this.combinations = combinations

    this.currentIndex = 0;

    var self = this;
    function jumpNext(){
      var index = self.currentIndex;

      console.log("next " + index);
      console.log(self.combinations[index].url);

      riot.route(self.combinations[index].url);

      self.currentIndex = (index + 1) % self.combinations.length;
    }

    this.next = function(e){

    }.bind(this)

    this.startLoop = function(e){
      if(this.intervalId){
        return;
      }
      this.intervalId = setInterval(jumpNext, 1000);
    }.bind(this)

    this.stopLoop = function(e){
      clearInterval(this.intervalId);
      this.intervalId = null;
    }.bind(this)

});