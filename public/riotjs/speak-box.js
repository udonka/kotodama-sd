
riot.tag2('speak-box', '<div class="speakBox" onclick="{next}"> <div id="speakContent"> </div> <div class="button button--right" onclick="{next}"> <span class="button__content">&raquo;</span></div> <div class="button button--left" onclick="{prev}"> <span class="button__content">&laquo;</span></div> <div class="progress"> <div class="progress__bar" riot-style="width:{progress}%"></div> </div> <div class="additional"><img class="additional__image" riot-src="{imgurl}" if="{imgurlExists}"></div> </div>', 'speak-box .speakBox,[riot-tag="speak-box"] .speakBox,[data-is="speak-box"] .speakBox{ border:solid 10px black; background:white; padding:30px; min-height:10em; font-size:21px; font-family:serif; line-height:1.41; position:relative; } speak-box .button,[riot-tag="speak-box"] .button,[data-is="speak-box"] .button{ position:absolute; top:0; bottom:0; background:transparent; width:30px; text-align:center; } speak-box .button:hover,[riot-tag="speak-box"] .button:hover,[data-is="speak-box"] .button:hover{ background:#aaa; opacity:0.8; } speak-box .button__content,[riot-tag="speak-box"] .button__content,[data-is="speak-box"] .button__content{ margin-top:-0.5em; position:absolute; top:50%; left:0; right:0; } speak-box .button--right,[riot-tag="speak-box"] .button--right,[data-is="speak-box"] .button--right{ right:0; } speak-box .button--left,[riot-tag="speak-box"] .button--left,[data-is="speak-box"] .button--left{ left:0; } speak-box .additional,[riot-tag="speak-box"] .additional,[data-is="speak-box"] .additional{ position:absolute; left: 0px; top: -20px; height:0px; width: 100%; text-align:center; } speak-box .additional__image,[riot-tag="speak-box"] .additional__image,[data-is="speak-box"] .additional__image{ position:absolute; bottom:0px; left:0px; } speak-box .progress,[riot-tag="speak-box"] .progress,[data-is="speak-box"] .progress{ position:absolute; top:0; left:0; right:0; height:30px; } speak-box .progress__bar,[riot-tag="speak-box"] .progress__bar,[data-is="speak-box"] .progress__bar{ height:100%; background:#eee; }', '', function(opts) {
    this.texts = this.opts.speaches;
    this.kotodama = this.opts.kotodama;
    this.currentIndex = 0;

    this.on("update", function(){
      var currentSpeach = this.texts[this.currentIndex];
      this.speakContent.innerHTML = currentSpeach.text;

      if(currentSpeach.kotodamaParams){

        if(Array.isArray(currentSpeach.kotodamaParams )){
          console.log(currentSpeach.kotodamaParams[0]);

          var this_tag = this;
          for(var i = 0; i < currentSpeach.kotodamaParams.length; i++){

            (function(){
              var options = currentSpeach.kotodamaParams[i];
              setTimeout(function (){
                this_tag.kotodama.setOptions(options);
              },i * 1000 + 500);
            }());

          }
        }
        else{
          setTimeout(function (){
            this.kotodama.setOptions(currentSpeach.kotodamaParams);
          },500);
        }
      }

      if(currentSpeach.imgurl && typeof currentSpeach.imgurl === "string"){
        this.imgurl = currentSpeach.imgurl;
        this.imgurlExists = true;
      }
      else{
        this.imgurl = "";
        this.imgurlExists = false;
      }

      this.progress = this.currentIndex/this.texts.length * 100;
    });

    this.next = function(e){
      this.currentIndex = (this.currentIndex + 1)%this.texts.length;

      e.stopPropagation();
    }.bind(this)
    this.prev = function(e){
      if(this.currentIndex - 1 < 0){
        this.currentIndex = this.texts.length-1;
      }
      else{
        this.currentIndex = this.currentIndex - 1;
      }

      e.stopPropagation();
    }.bind(this)
});