const express = require('express');
const kotodamas_router = module.exports = express.Router();

const co = require('co');
const path = require('path');

const mongoose = require("mongoose");

const UserAnswer = mongoose.model("UserAnswer");
const QuestionnaireAnswer = mongoose.model("QuestionnaireAnswer");
const questionnaires = require("../data/questionnaires");

//設問一覧ページ
kotodama_router.get('/', function(req, res, next) {
  co(function*(){
    //ユーザー回答を網羅
    const all_user_answers = yield UserAnswer.findAndPopulateAnswers({}).exec();

    //設問ごとに表示
    res.render("kotodamas",{
      all_user_answers,
      questionnaires 
    });
  }).catch(e=>next(e));
});
