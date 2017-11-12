const express = require('express');
const co = require('co');
const questionnaires_router = express.Router();
const path = require('path');
const mongoose = require("mongoose");

const UserAnswer = mongoose.model("UserAnswer");
const QuestionnaireAnswer = mongoose.model("QuestionnaireAnswer");
const questionnaires = require("../data/questionnaires");


const {questions, answer_sheet, scale_num}
      = require("../data/questions");



function fetchUserAnswer(req, res, next){
  return co(function*(){
    const user_answer_id = parseInt(req.cookies.user_answer_id);

    if(isNaN(user_answer_id)){
      res.cookie("user_answer_id", "");
      return res.redirect("/");
    }

    const user_answer = yield UserAnswer
      .findByIdAndPopulateAnswers(user_answer_id).exec();

    if(user_answer){
      console.log("user_answer loaded", user_answer);
      req.user_answer = user_answer;
      res.locals.user_answer = user_answer;
      return next();
    }
    else{
      return res.redirect(path.join(req.baseUrl, "start"));
    }

  }).catch(e=>next(e));
}


//設問一覧ページ
questionnaires_router.get('/', fetchUserAnswer, function(req, res, next) {
  co(function*(){
    const user_answer = req.user_answer;
    const questionnaire_answers = user_answer.questionnaire_answers;

    console.log("user_answer", user_answer);
    console.log("questionnaire_answers", questionnaire_answers);

    //const questionnaire_answers = Array.from(yield QuestionnaireAnswer.find().exec());
    res.render("questionnaires",{questionnaires, questionnaire_answers});

  }).catch(e=>next(e));
});

questionnaires_router.get('/start', function(req, res, next) {
  res.render("start");
});

questionnaires_router.post('/start', function(req, res, next) {
  co(function*(){
    const sei = req.body.sei; //めんどくさい
    const mei = req.body.mei; //めんどくさい
    const sei_kana = req.body.sei_kana; //めんどくさい
    const mei_kana = req.body.mei_kana; //めんどくさい

    const name_str = sei + mei;
    const email = req.body.email;
    const email_confirm = req.body.email_confirm;
    const is_male = req.body.is_male;
    const age = parseInt(req.body.age);

    const from= req.body.from;
    const student_id= req.body.student_id;


    if(name_str == "" ){
      return res.render("start",{sei,mei,sei_kana,mei_kana,email,email_confirm,is_male,age,error:"名前が空欄です"});
    }
    if(email == "" ){
      return res.render("start",{sei,mei,sei_kana,mei_kana,email,email_confirm,is_male,age,error:"メールアドレスが空欄です"});
    }
    if(email_confirm == "" ){
      return res.render("start",{sei,mei,sei_kana,mei_kana,email,email_confirm,is_male,age,error:"メールアドレスを再入力してください"});
    }
    if(email != email_confirm ){
      return res.render("start",{sei,mei,sei_kana,mei_kana,email,email_confirm,is_male,age,error:"同じメールアドレスを二回入力してください"});
    }
    if(isNaN(age)){
      return res.render("start",{sei,mei,sei_kana,mei_kana,email,email_confirm,is_male,age,error:"年齢は半角数字で入力してください"});
    }

    const name = {
      sei,
      mei,
      sei_kana,
      mei_kana,
    };

    const new_user_answer = yield UserAnswer.createNew(name,email,is_male,age,from,student_id);
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
  co(function*(){
    //回答IDがあれば
    //  渡されて、
    //  DBにありvalidであれば。
    const user_answer_id = parseInt(req.query.user_answer_id);

    if(isNaN(user_answer_id)){
      return res.redirect("/");
      
    }
    const user_answer = yield UserAnswer.findOne({id:user_answer_id}).exec();
  
    if(user_answer){
      res.cookie("user_answer_id", user_answer.id);
      res.redirect( path.join(req.baseUrl, "next") );
    }
    else{
      //flash ID ... の回答はありませんでした。新しく回答を始めてください
      res.redirect( path.join(req.baseUrl, "start") );
    }
  }).catch(e=>next(e));
});







//設問を、回答があれば回答を表示する。
questionnaires_router.get('/:questionnaire_id',fetchUserAnswer, function(req, res, next) {
  return co(function*(){
    const questionnaire_id = req.params.questionnaire_id;

    //設問が見つからなかったら
    //
    if(questionnaires.findIndex(q => q.id == questionnaire_id) == -1){
      return next();
    }


    const user_answer = req.user_answer;

    //すでにある回答を検索
    const existing_answer = user_answer.questionnaire_answers[questionnaire_id];

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



questionnaires_router.post('/:questionnaire_id', fetchUserAnswer, function(req, res, next) {
  co(function*(){
    const questionnaire_id = req.params.questionnaire_id;

    //設問が見つからなかったら(k1とかのやつ)
    if(questionnaires.findIndex(q => q.id == questionnaire_id) == -1){
      return next();
    }

    const user_answer = req.user_answer;


    const answers = req.body;

    //すでに回答が存在すれば消す。
    //todo!!!! user_answerの中でもnullにする

    const questionnaire_answer = user_answer.questionnaire_answers[questionnaire_id];

    if(questionnaire_answer){
      yield QuestionnaireAnswer.deleteOne({_id: questionnaire_answer._id});
      user_answer.questionnaire_answers[questionnaire_id] = null;
    }



    let my_answer_sheet = Object.assign({},answer_sheet); //コピー

    //解答用紙に回答を書き込む
    Object.assign(my_answer_sheet, answers);

    //DBに入れる
    const new_q_answer =  new QuestionnaireAnswer({
      questionnaire_id,
      answers:my_answer_sheet,
    });


    const saved_questionnaire_answer = yield new_q_answer.save();

    console.log("saved_questionnaire_answer", saved_questionnaire_answer );

    user_answer.questionnaire_answers[questionnaire_id] = saved_questionnaire_answer;

    const saved_user_answer = yield user_answer.save();

    console.log("saved_user_answer");
    console.log(saved_user_answer);


    // 空欄を調べる。空欄があってはならない。
    const empty_questions = Object.keys(my_answer_sheet).filter(key => my_answer_sheet[key] == null);

    if(empty_questions.length == 0 ){
      const left_questionnaires = saved_user_answer.left_questionnaires;

      return res.redirect(path.join(req.baseUrl, req.url,"thanks"));
    }
    else{
      return res.redirect(path.join(req.baseUrl, req.url));
    }
  }).catch(e=>next(e));
});

questionnaires_router.get('/:questionnaire_id/thanks', fetchUserAnswer, function(req, res, next) {
  co(function*(){
    const questionnaire_id = req.params.questionnaire_id;
    const user_answer = req.user_answer;//あることは保証されてる
    const my_questionnaire_answer = user_answer.questionnaire_answers[questionnaire_id];

    if(!my_questionnaire_answer){
      return next();
    }

    const {answer_feedbacks, total_point} 
      = yield user_answer.getAnswerFeedbacks(questionnaire_id);

    const left_questionnaires = user_answer.left_questionnaires;

    return res.render('thanks', {
      questionnaire_id,
      questionnaires,
      left_questionnaires,
      answer_feedbacks,
      total_point
    });
  }).catch(e=>next(e));
});

questionnaires_router.get('/finish', fetchUserAnswer, function(req, res, next) {
  co(function*(){
    const user_answer = req.user_answer;//あることは保証されてる

    let results = yield Promise.all(questionnaires.map(q=>{
      const qid = q.id;

      //const {answer_feedbacks, total_point} = yield 
      return user_answer.getAnswerFeedbacks(qid);
    }));

    results = results.map((result,index) => ({
      id:questionnaires[index].id,
      total_point:result.total_point
    }));

    const total_total_point = results.reduce((a,b)=>a+b.total_point,0) / results.length;

    res.render("finish", {results, total_total_point});

  }).catch(e=>next(e));
});





questionnaires_router.get('/next',fetchUserAnswer, function(req, res, next) {
  co(function*(){
    //回答を見つける
    //残ってる回答

    const user_answer = req.user_answer;

    let left_questionnaires = user_answer.left_questionnaires;

    console.log("left_questionnaires");
    console.log(left_questionnaires);

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




module.exports = questionnaires_router;
