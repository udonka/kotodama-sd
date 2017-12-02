
riot.tag2('favorite-nav', '<div class="favoriteParams"><a class="button" href="#{url}" each="{fav_list}">{name} </a> <form onsubmit="{add}"> <input type="text" name="fav_title"> <input type="submit" value="favorite"> </form> <input type="submit" value="start loop" onclick="{startLoop}"> <input type="submit" value="stop loop" onclick="{stopLoop}"> </div>', '', '', function(opts) {
    this.fav_list = [
      {
        name:"pokopoko",
        params:{
          tamaNum:15,sizeDiff:0,forceDiff:1,separation:3,angleSeparation:0,angle:0,shape:7,colorHue:230,colorSat:0.8,colorVal:0.8,colorAlpha:0.8
        }
      },
      {
        name:"kachikochi",
        params:{
          tamaNum:15,sizeDiff:1,forceDiff:-1,separation:1.7,angleSeparation:0.1,angle:3.14,shape:4,colorHue:180,colorSat:0.7,colorVal:0.8,colorAlpha:0.3
        }
      },
      {
        name:"nyurun",
        params:{
          tamaNum:5,sizeDiff:1,forceDiff:-1,separation:0.9,angleSeparation:0,angle:3.14,shape:7,colorHue:120,colorSat:0.7,colorVal:0.8,colorAlpha:0.5

        }
      },
      {
        name:"igaiga",
        params:{
          tamaNum:15,sizeDiff:1,forceDiff:-1,separation:3,angleSeparation:0.1,angle:0,shape:3,colorHue:0,colorSat:0.7,colorVal:0.8,colorAlpha:0.7
        }
      },
      {
        name:"gungun",
        params:{
          tamaNum:15,sizeDiff:1,forceDiff:-1,separation:3,angleSeparation:0,angle:0,shape:3,colorHue:120,colorSat:0.7,colorVal:0.8,colorAlpha:0.7
        }
      },

      {
        name:"kirakira",
        params:{
          tamaNum:15,sizeDiff:1,forceDiff:1,separation:5,angleSeparation:0,angle:0,shape:4,colorHue:60,colorSat:0.9,colorVal:0.8,colorAlpha:0.6
        }
      },
      {
        name:"mokomoko",
        params:{
          tamaNum:9,sizeDiff:0,forceDiff:-1,separation:2.2,angleSeparation:0,angle:0,shape:7,colorHue:330,colorSat:0.9,colorVal:0.8,colorAlpha:0.6
        }
      },
      {
        name:"dokudoku",
        params:{
          tamaNum:15,sizeDiff:0.7,forceDiff:-0.4,separation:2.5,angleSeparation:0.1,angle:0,shape:7,colorHue:280,colorSat:0.9,colorVal:0.5,colorAlpha:0.8
        }
      },
    ];

    function params2url(params_obj){
      var url = "?";
      url += Object.keys(params_obj).map((key)=>{
        var value = params_obj[key];
        return key + "=" + value
      }).join('&');

      return url;
    }

    this.on("update", function(){

      this.fav_list.forEach((item)=>{
        var url = params2url(item.params);
        item.url = url;
      });

    });

    this.add = function(e){
      e.preventDefault();

      var fav_title_text = this.fav_title;

      var name = (fav_title_text.value);

      fav_title_text.value = "";

      if(name == ""){
        return;
      }

      var newFav = {
        name: name,
        params:riot.route.query()
      }

      this.fav_list.push(newFav);
    }.bind(this)

    this.currentIndex = 0;

    var self = this;

    function jumpNext(){
      var index = self.currentIndex;

      console.log("next " + index);
      console.log(self.fav_list[index].url);

      riot.route(self.fav_list[index].url);

      self.currentIndex = (index + 1) % self.fav_list.length;
    }

    this.startLoop = function(e){

      if(this.intervalId){
        return;
      }
      this.intervalId = setInterval(jumpNext, 1200);
    }.bind(this)

    this.stopLoop = function(e){
      clearInterval(this.intervalId);
      this.intervalId = null;
    }.bind(this)
});