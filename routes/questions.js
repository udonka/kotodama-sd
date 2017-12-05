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

//設問一覧ページ
questions_router.get('/merge', function(req, res, next) {
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

    let questions_with_data = questions.map((question)=>{

      let all_data = questionnaires_with_ave_var.reduce((memo,questionnaire_with_ave_var)=>{
        return memo.concat(
          questionnaire_with_ave_var.question_answers_ave_var[question.id].data);
        
      },[]);//??

      const ave = all_data.reduce((a,b)=>a+b) / all_data.length;
      const vari= all_data.reduce( (a,b)=> a + (b - ave) * (b - ave),0) / all_data.length;
      const dev = Math.sqrt(vari);

      return {
        data:all_data,
        ave,
        dev,

        data_rate: all_data.map( v => QuestionnaireAnswer.normalizeAnswerNum(v) ),
        ave_rate: QuestionnaireAnswer.normalizeAnswerNum(ave),
        dev_rate: QuestionnaireAnswer.normalizeDev(dev),

        left:question.left,
        right:question.right,
        id:question.id,
      }
    });
    


    //設問ごとに表示
    res.render("questions-merge",{
      questions: questions_with_data,
    });
  }).catch(e=>next(e));
});


questions_router.get('/ave-of-ave', function(req, res, next) {
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

    let questions_with_data = questions.map((question)=>{

      let all_data = questionnaires_with_ave_var.reduce((memo,questionnaire_with_ave_var)=>{

        let question_answer  = questionnaire_with_ave_var.question_answers_ave_var[question.id];
        memo.push( {
          questionnaire_id:questionnaire_with_ave_var.questionnaire_id,
          ave:question_answer.ave,
          dev:question_answer.dev,
        });

        return memo;
      },[]);//??

    
      console.log (all_data);

      const ave = all_data.reduce((a,b)=>{console.log(a); return a+b.ave} , 0) / all_data.length;
      const vari= all_data.reduce((a,b)=> a + (b.ave - ave) * (b.ave - ave),0) / all_data.length;
      const dev = Math.sqrt(vari);

      console.log("question id " + question.id);
      console.log("ave " + ave);
      console.log("dev " + dev);

      return {
        data:all_data,
        ave,
        dev,

        data_rate: all_data.map( obj => 
          Object.assign({}, obj, {
            ave:QuestionnaireAnswer.normalizeAnswerNum(obj.ave),
            dev:QuestionnaireAnswer.normalizeAnswerNum(obj.dev),
          })
        ),
        ave_rate: QuestionnaireAnswer.normalizeAnswerNum(ave),
        dev_rate: QuestionnaireAnswer.normalizeDev(dev),

        left:question.left,
        right:question.right,
        id:question.id,
      }
    });

    //設問ごとに表示
    res.render("questions-ave-of-ave",{
      questions: questions_with_data,
    });
  }).catch(e=>next(e));
});

