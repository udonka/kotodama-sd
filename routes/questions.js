const express = require('express');
const questions_router = module.exports = express.Router();

const co = require('co');
const path = require('path');

const mongoose = require("mongoose");

const UserAnswer = mongoose.model("UserAnswer");
const QuestionnaireAnswer = mongoose.model("QuestionnaireAnswer");
const questionnaires = require("../data/questionnaires");
const questions = require("../data/questions").questions;



//設問一覧ページ
questions_router.get('/', function(req, res, next) {
  co(function*(){
    
    const questionnaires_with_ave_var = [];

    for(const questionnaire of questionnaires){
      const questionnaire_id = questionnaire.id;

      const question_answers_ave_var
        = yield QuestionnaireAnswer.calcAveVar(questionnaire_id);

      questionnaires_with_ave_var.push({
        questionnaire_id,
        question_answers_ave_var
      });

      console.log(question_answers_ave_var);
    }


    //設問ごとに表示
    res.render("questions",{
      questionnaires_with_ave_var,
      questions,
    });
  }).catch(e=>next(e));
});



