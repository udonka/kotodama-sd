const express = require('express');
const kotodamas_router = module.exports = express.Router();

const co = require('co');
const path = require('path');

const mongoose = require("mongoose");

const UserAnswer = mongoose.model("UserAnswer");
const QuestionnaireAnswer = mongoose.model("QuestionnaireAnswer");
const questionnaires = require("../data/questionnaires");
const questions = require("../data/questions").questions;
const question_ids = require("../data/questions").question_ids;


//設問一覧ページ
kotodamas_router.get('/', function(req, res, next) {
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
    }

    //設問ごとに表示
    res.render("kotodamas",{
      questionnaires_with_ave_var,
      questions
    });
  }).catch(e=>next(e));
});


//設問一覧ページ
kotodamas_router.get('/csv/:questionnaire_id', function(req, res, next) {
  co(function*(){
    const questionnaire_id = req.params.questionnaire_id;
    const answer_feedbacks
      = yield QuestionnaireAnswer.calcAveVar(questionnaire_id);

    const table_head = [questionnaire_id ];
    const table_body = question_ids.map((q_id)=>{


      return [q_id, ...(answer_feedbacks[q_id].data)];
    });

    const table = [table_head, ...table_body];

    console.log(table);

    res.csv(table);

  }).catch(e=>next(e));



});


//設問一覧ページ
kotodamas_router.get('/:questionnaire_id', function(req, res, next) {
  co(function*(){
    const questionnaire_id = req.params.questionnaire_id;
    const answer_feedbacks
      = yield QuestionnaireAnswer.calcAveVar(questionnaire_id);
    console.log(answer_feedbacks);

    return res.render('kotodama', {
      questionnaire_id,
      questions,
      answer_feedbacks
    });
  }).catch(e=>next(e));



});
