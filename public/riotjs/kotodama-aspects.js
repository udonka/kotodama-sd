
riot.tag2('kotodama-aspects', '<input type="button" name="calcButton" value="calc aspects" onclick="{calcAspects}"> <div name="canvases"></div> <dl> <virtual each="{key, value in aspects}"> <dt>{key}</dt> <dd>{value}</dd> </virtual> </dl>', '', 'class="jade"', function(opts) {
    this.kotodama = opts.kotodama;
    this.canvasTags = {};

    this_tag = this;

    this.calcAspects = function(e){

      alert("aspect");

      var obj = AspectsCalcurator.kotodamaAspects(this.kotodama);

      this_tag.aspects = obj.aspects;
      this_tag.update();
    }.bind(this)

});