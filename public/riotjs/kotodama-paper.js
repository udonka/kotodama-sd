
riot.tag2('kotodama-paper', '<canvas class="kotodama-canvas" name="kotodama_canvas"></canvas>', '', '', function(opts) {
    var kotodama = this.kotodama = opts.kotodama;
    var kotodamaView = this.kotodamaView = opts.kotodamaView;

    var kotodama_canvas = this.kotodama_canvas;

    this.on("mount", function(){

      var parent = this.root.parentNode;

      var window_height =  window.innerHeight;

      var container_width = parent.offsetWidth;

      this.width = Math.min(container_width, window_height) ;
      this.height= this.width;

      kotodama_canvas.width=this.width;
      kotodama_canvas.height=this.height;

      console.log(this.width + " " + this.height);

      kotodamaView.setOptions({
        position:new Vec2(this.width/2, this.height/2),
        size:this.width*0.9
      });
    });

    var c = kotodama_canvas.getContext("2d");
    var this_tag = this;

    function drawKotodama(t){

      kotodama.move(t);

      if(!kotodama.isStopped() || kotodama.hasChanged()){
        c.clearRect(0,0,this_tag.width,this_tag.height);
        kotodamaView.draw(c);
      }
    }

    (function animationSettings(){

      (function() {
        var requestAnimationFrame =
          window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.msRequestAnimationFrame;

        window.requestAnimationFrame = requestAnimationFrame;
      }());

      function frame(timestamp) {
        drawKotodama(timestamp );
        requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);

    }());
});