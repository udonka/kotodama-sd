var express = require('express');
var path = require('path');
var router = express.Router();

const questionnaires = require("../data/questionnaires");
const questions_obj      = require("../data/questions");
const questions = questions_obj.questions;
const answer_sheet = questions_obj.answer_sheet;


/* GET home page. */

router.get('/', function(req, res, next) {
  res.render("index", {questionnaires});

});

router.use('/explanation', function(req,res,next){
  res.render("explanation");
});



module.exports = router;
