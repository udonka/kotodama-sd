
riot.tag2('kotodama-settings', '<form id="view-params"> <h2>View Params</h2> <table> <tr> <td> <input type="checkbox" name="showBox" id="showBox" onclick="{viewChecked}"> <label for="showBox">Box.</label> </td> <td> <input type="checkbox" name="showAxis" id="showAxis" onclick="{viewChecked}"> <label for="showAxis">Axis.</label> </td> </tr> <tr> <td> <input type="checkbox" name="showForceVec" id="showForceVec" onclick="{viewChecked}"> <label for="showForceVec">Force vector.</label> </td> <td> <input type="checkbox" name="showMomentVec" id="showMomentVec" onclick="{viewChecked}"> <label for="showMomentVec">Moment vector.</label> </td> </tr> </table> </form> <form id="kotodama-params"> <h2>Macro Params</h2> <table id="kotodama-params__macro"> <tr> <td colspan="2"> <p>tamaNum <input type="range" name="tamaNum" value="{q.tamaNum}" oninput="{barmoved}" step="1" min="1" max="15"> </p> </td> </tr> <tr> <td> <p>size variance <input type="range" name="sizeDiff" value="{q.sizeDiff}" oninput="{barmoved}" step="0.1" min="0" max="1"> </p> </td> <td> <p>force variance <input type="range" name="forceDiff" value="{q.forceDiff}" oninput="{barmoved}" step="0.1" min="-1" max="1"> </p> </td> </tr> </table> <h2>Micro Params</h2> <table id="kotodama-params__micro"> <tr> <td> <p>pos separation <input type="range" name="separation" value="{q.separation}" oninput="{barmoved}" step="0.1" min="0" max="5"> </p> </td> <td> <p>ang separation <input type="range" name="angleSeparation" value="{q.angleSeparation}" oninput="{barmoved}" step="0.1" min="0" max="0.1"> </p> </td> </tr> <tr> <td> <p>angle <input type="range" name="angle" value="{q.angle}" oninput="{barmoved}" step="3.14" min="0" max="3.14"> </p> </td> <td> <p>shape > 3 <input type="range" name="shape" value="{q.shape}" oninput="{barmoved}" step="1" min="3" max="7"> </p> </td> </tr> <tr> <td> <p>color hue <input type="range" name="colorHue" value="{q.colorHue}" oninput="{barmoved}" step="10" min="0" max="360"> </p> </td> <td> <p>color sat <input type="range" name="colorSat" value="{q.colorSat}" oninput="{barmoved}" step="0.1" min="0" max="1"> </p> </td> </tr> <tr> <td> <p>color val <input type="range" name="colorVal" value="{q.colorVal}" oninput="{barmoved}" step="0.1" min="0" max="1"> </p> </td> <td> <p>color alpha <input type="range" name="colorAlpha" value="{q.colorAlpha}" oninput="{barmoved}" step="0.1" min="0" max="1"> </p> </td> </tr> </table> </form>', '', '', function(opts) {
    var kotodama = this.kotodama = opts.kotodama;

    kotodama_params_form = this["kotodama-params"];

    riot.route.start(true);

    var self = this;

    riot.route(function(col,id,act){
      var q = riot.route.query();

      kotodama.setOptions(q);
      self.q = q;

      self.update();

    });

    var parseOptions = function(form_array){
      var options = {};
      _.each(form_array, function(input){
        options[input.name] = Number(input.value);
      });

      return options;
    };

    var reflectOptions = function(){
      var form_query = $(kotodama_params_form).serialize();

      riot.route("?"+ form_query);
    };

    this.barmoved = function(e){
      reflectOptions();
    }.bind(this)

    this.viewChecked = function(e){
      kotodamaView.setOptions( {
        showBox       : $(this.showBox).prop("checked") ,
        showAxis      : $(this.showAxis).prop("checked") ,
        showForceVec  : $(this.showForceVec).prop("checked") ,
        showMomentVec : $(this.showMomentVec).prop("checked")
      });
    }.bind(this)
});