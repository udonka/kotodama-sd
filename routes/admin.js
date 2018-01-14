const express = require('express');
const admin_router = module.exports = express.Router();

const co = require('co');
const path = require('path');

const mongoose = require("mongoose");

const UserAnswer = mongoose.model("UserAnswer");
const QuestionnaireAnswer = mongoose.model("QuestionnaireAnswer");
const questionnaires = require("../data/questionnaires");
const questions = require("../data/questions").questions;

const kotodamas_router = require('./kotodamas');
const questions_router = require('./questions');
const questionnaires_router = require('./questionnaires');
const basicAuth = require('basic-auth-connect');

admin_router.use('/kotodamas', kotodamas_router);
admin_router.use('/questions', questions_router);

admin_router.all('/', basicAuth(function(user, password) {
  return user === 'admin' && password === 'koseigatakusan';
}));


//admin top
admin_router.get('/', function(req, res, next) {
  co(function*(){
    res.render("admin",{ });
  }).catch(e=>next(e));
});


//users 
admin_router.get('/users', function(req, res, next) {
  co(function*(){
    //ユーザー回答を網羅
    const all_user_answers = yield UserAnswer.findAndPopulateAnswers({}).exec();

    res.render("users",{
      all_user_answers,
    });
  }).catch(e=>next(e));
});

//users 
admin_router.get('/users.json', function(req, res, next) {
  co(function*(){
    //ユーザー回答を網羅
    const all_user_answers = yield UserAnswer.findAndPopulateAnswers({}).exec();

    res.json(all_user_answers);

  }).catch(e=>next(e));
});

//users 
admin_router.get('/users.csv', function(req, res, next) {
  co(function*(){
    //ユーザー回答を網羅
    const all_user_answers = Array.from(yield UserAnswer.findAndPopulateAnswers({}).exec());

    const user_answers_table = all_user_answers.filter((user_answer)=>{
      return user_answer.left_questionnaires.length == 0;
    }).map((user_answer)=>{
      const row_obj = {
        name: user_answer.user_info.name_str
      };

      questionnaires.forEach((questionnaire)=>{
        const qn_answer = user_answer.questionnaire_answers[questionnaire.id];

        if(qn_answer){
          const answers = qn_answer.answers;
          console.log("answers");
          console.log(answers);
          questions.forEach((question)=>{
            const answer = answers[question.id];
            row_obj[questionnaire.id + "-" + question.id] = answer;
          });
        }
      });
      return row_obj;
    });

    res.csv(user_answers_table, true);

  }).catch(e=>next(e));
});

admin_router.get('/users/:user_answer_id(\\d+)',
  function(req, res, next) {
    req.cookies.user_answer_id = req.params.user_answer_id;
    next();
  },
  questionnaires_router.fetchUserAnswer, 
  function(req, res, next) {
    co(function*(){
      const user_answer = req.user_answer;
      res.render("user", {user_answer});
    }).catch(e=>next(e));
  }
);


admin_router.get('/users/:user_answer_id(\\d+).json',
  function(req, res, next) {
    req.cookies.user_answer_id = req.params.user_answer_id;
    next();
  },
  questionnaires_router.fetchUserAnswer, 
  function(req, res, next) {
    co(function*(){
      const user_answer = req.user_answer;//あることは保証されてる

      res.json(user_answer);

    }).catch(e=>next(e));
  }
);



admin_router.post('/users/:user_answer_id(\\d+)/delete', (req, res, next) => {
  co(function*(){
    const user_answer_id = req.params.user_answer_id;

    const removed = yield UserAnswer.removeWithAnswersById(user_answer_id);

    if(removed){
      //req.flash("deleted");
      res.redirect(path.join(req.baseUrl,"users"))
    }
    else{
      next(new Error("nothing has not removed"))
    }
  }).catch(e=>next(e));
});



admin_router.post('/users/:user_answer_id(\\d+)', (req, res, next) => {
  co(function*(){
    const sei      = req.body.sei; //めんどくさい
    const mei      = req.body.mei; //めんどくさい
    const sei_kana = req.body.sei_kana; //めんどくさい
    const mei_kana = req.body.mei_kana; //めんどくさい

    const name_str = sei + mei;
    const email = req.body.email;
    const email_confirm = req.body.email_confirm;
    const is_male = req.body.is_male;
    const age = parseInt(req.body.age);

    const from= req.body.from;
    const student_id= req.body.student_id;


    let error ;

    if(name_str == "" ){
      error = "名前が空欄です";
    }
    else if(email == "" ){
      error = "メールアドレスが空欄です";
    }
    else if(email_confirm == "" ){
      error = "メールアドレスを再入力してください";
    }
    else if(email != email_confirm ){
      error = "同じメールアドレスを二回入力してください";
    }
    else if(isNaN(age)){
      error = "年齢は半角数字で入力してください";
    }

    if(error){
      return res.render("user",{sei,mei,sei_kana,mei_kana,email,email_confirm,is_male,age,error});
    }

    const name = {
      sei,
      mei,
      sei_kana,
      mei_kana,
    };


    const new_user_answer = yield UserAnswer.update({id: req.params.user_answer_id}, {
      $set: {
        user_info:{ 
          name,
          email, 
          is_male, 
          age, 
          from, 
          student_id 
        }
      }
    });
    

    res.redirect(path.join(req.baseUrl, req.url));

  }).catch(e=>next(e));

});


function findUserAnswerByQuestionnaireAnswer(q_answer, user_answers){
  //こいつを回答にもってるやつを探す
  const found = user_answers.find((u_ans) => {
    return Object.keys(u_ans.questionnaire_answers).find((questionnaire_id)=>{
      return q_answer._id.equals(u_ans.questionnaire_answers[questionnaire_id]);
    });
  });
  return found;
}


admin_router.get('/questionnaire_answers/', (req, res, next) => {
  co(function*(){
    const questionnaire_answers = Array.from( yield QuestionnaireAnswer.find().exec() );
    const user_answers = Array.from( yield UserAnswer.find().exec() );

    const questionnaire_answers_and_user_answer = questionnaire_answers.map((q_answer)=>{
      const user_answer = findUserAnswerByQuestionnaireAnswer(q_answer, user_answers)

      const ret = { //ふつーのオブジェクトじゃないと、user_answerを追加できない
        q_answer,
        user_answer
      };

      return ret;
    });

    res.render("questionnaire_answers", { questionnaire_answers : questionnaire_answers_and_user_answer} )

  }).catch(e=>next(e));
});

admin_router.get('/questionnaire_answers/:answer_id', (req, res, next) => {
  co(function*(){
    const answer_id = req.params.answer_id;
    const user_answers = Array.from( yield UserAnswer.find().exec() );

    const q_answer = yield QuestionnaireAnswer.findById( answer_id ).exec();

    const user_answer = findUserAnswerByQuestionnaireAnswer(q_answer, user_answers);

    res.render("questionnaire_answer", { q_answer, user_answer} );

  }).catch(e=>next(e));
});



admin_router.post('/questionnaire_answers/:answer_id/delete', (req, res, next) => {
  co(function*(){
    const answer_id = req.params.answer_id;

    const removed = yield QuestionnaireAnswer.deleteOne({_id: answer_id});

    if(removed){
      //req.flash("deleted");
      res.redirect(path.join(req.baseUrl,"questionnaire_answers"))
    }
    else{
      next(new Error("nothing has not removed"))
    }
  }).catch(e=>next(e));
});
