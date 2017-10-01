var express = require('express');
var co = require('co');
var questionnaires_router = express.Router();

var path = require('path');

const mongoose = require("mongoose");

const UserAnswer = mongoose.model("UserAnswer");
const QuestionnaireAnswer = mongoose.model("QuestionnaireAnswer");

const questionnaires = require("../data/questionnaires");
const questions_obj      = require("../data/questions");
const questions = questions_obj.questions;
const answer_sheet = questions_obj.answer_sheet;

const scale_num = 9;


//設問一覧ページ
questionnaires_router.get('/', function(req, res, next) {
  co(function*(){

    const questionnaire_answers = Array.from(yield QuestionnaireAnswer.find().exec());
    res.render("questionnaires",{questionnaires, questionnaire_answers});

  }).catch(e=>next(e));
});

questionnaires_router.get('/start', function(req, res, next) {
  res.render("start");
});

questionnaires_router.post('/start', function(req, res, next) {
  co(function*(){
    const name = req.body.yourname; //めんどくさい
    const email = req.body.email;
    const sex = req.body.sex ;
    const age = req.body.age;


    const new_user_answer = UserAnswer.createNew(name,email,sex,age);
    const result = yield new_user_answer.save();

    res.cookie("user_answer_id", new_user_answer.id, {maxAge:600000000});
    res.redirect(path.join(req.baseUrl, "start_really"));

  }).catch(e=>next(e));
});


//あなたの回答番号はこちらです的な
questionnaires_router.get('/start_really', function(req, res, next) {
  const user_answer_id = req.cookies.user_answer_id;
  res.render("start_really",{user_answer_id});
});

questionnaires_router.get('/restart', function(req, res, next) {
  //回答IDがあれば
  //  渡されて、
  //  DBにありvalidであれば。
 
  if(false){
    res.redirect(path.join(req.baseUrl, "next"));
  }
  else{
    //flash ID ... の回答はありませんでした。新しく回答を始めてください
    res.redirect(path.join(req.baseUrl, "start"));
  }

});




questionnaires_router.get('/finish', function(req, res, next) {
  res.render("finish");
});



//設問を、回答があれば回答を表示する。
questionnaires_router.get('/:questionnaire_id', function(req, res, next) {

  co(function*(){
  

    const questionnaire_id = req.params.questionnaire_id;

    //設問が見つからなかったら
    //
    if(questionnaires.findIndex(q => q.id == questionnaire_id) == -1){
      return next();
    }

    //すでにある回答を検索
    const existing_answer = yield QuestionnaireAnswer.findOne({questionnaire_id});



    if(existing_answer){
      //回答があるならば
      const my_answers = existing_answer.answers;

      //空欄を調べる。空欄があってはならない。
      const empty_questions = Object.keys(my_answers).filter(key => my_answers[key] == null);


      //回答を含めて表示
      res.render('questionnaire', {
        questionnaire_id,
        questions,
        scale_num,
        answers:my_answers,
        empty_questions
      });

    }
    else{
      res.render('questionnaire', {questionnaire_id, questions, scale_num});
    }
  }).catch(e=>next(e));
});



questionnaires_router.post('/:questionnaire_id', function(req, res, next) {
  co(function*(){
    const answers = req.body;
    const questionnaire_id = req.params.questionnaire_id;

    //設問が見つからなかったら
    //k1とかのやつ
    if(questionnaires.findIndex(q => q.id == questionnaire_id) == -1){
      return next();
    }


    //すでに回答が存在すれば消す。
    //todo!!!! user_answerの中でもnullにする
    yield QuestionnaireAnswer.deleteOne({questionnaire_id});


    let my_answer_sheet = Object.assign({},answer_sheet); //コピー

    //解答用紙に回答を書き込む
    Object.assign(my_answer_sheet, answers);

    //DBに入れる
    const new_q_answer =  new QuestionnaireAnswer({
      questionnaire_id,
      answers:my_answer_sheet,

    });

    yield new_q_answer.save();



    /*
    user_answers.push({
      questionnaire_id,
      answers:my_answer_sheet,
    });
    */



    // 空欄を調べる。空欄があってはならない。
    const empty_questions = Object.keys(my_answer_sheet).filter(key => my_answer_sheet[key] == null);

    // 
    if(empty_questions.length == 0 ){
      const left_questionnaires = yield getLeftQuestionnaires(questionnaires);

      return res.render('thanks', {questionnaire_id, questionnaires, left_questionnaires});
    }
    else{
      return res.redirect(path.join(req.baseUrl, req.url));
    }
  }).catch(e=>next(e));
});



questionnaires_router.get('/next', function(req, res, next) {
  co(function*(){
    //回答を見つける
    //残ってる回答

    const user_answers = QuestionnaireAnswer.find();

    console.log("user_answers");
    console.log(user_answers);

    let left_questionnaires = yield getLeftQuestionnaires(questionnaires, user_answers);

    if(left_questionnaires.length == 0){
      return res.redirect(path.join(req.baseUrl,"finish"));
    }

    const random_index = Math.floor( Math.random() * left_questionnaires.length) ;
    const random_next_questionnaire = left_questionnaires[random_index];

    res.redirect(path.join(req.baseUrl, random_next_questionnaire.id));

  }).catch(e=>next(e));
});

questionnaires_router.get('/next', function(req, res, next) {
  
});


//Model行き
function getLeftQuestionnaires(questionnaires){
  return co(function*(){

    const questionnaire_answers = (yield QuestionnaireAnswer
      .find({questionnaire_id:{$in:questionnaires.map(q=>q.id)}}));

    console.log("questionnaire_answers");
    console.log(questionnaire_answers);

    return questionnaires.filter( qn => {
      //回答が存在するか？

      let the_answer = questionnaire_answers.find(qa => qa.questionnaire_id == qn.id);

      console.log("the_answer");
      console.log(the_answer);

      //存在しないなら、残ってる
      if(!the_answer){
        console.log("the answer not exist")
        return true;
      }

      if(!(the_answer.answers)){
        console.log("the answers in answer not exist")
        return true;
      }

      let null_exist = Object.keys(the_answer.answers).find(q_id => !the_answer.answers[q_id]);

      //nullが存在するなら残ってる
      if(null_exist) {
        console.log("the answer contains null")
        return true;
      }

      console.log("the answer is perfect")
      //回答が存在して、空欄が存在しないなら、残ってない
      return false;
      
    });

  });
}


module.exports = questionnaires_router;
