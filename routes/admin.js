const express = require('express');
const admin_router = module.exports = express.Router();

const co = require('co');
const path = require('path');

const mongoose = require("mongoose");

const UserAnswer = mongoose.model("UserAnswer");
const QuestionnaireAnswer = mongoose.model("QuestionnaireAnswer");
const questionnaires = require("../data/questionnaires");

const kotodamas_router = require('./kotodamas');
const questions_router = require('./questions');
const basicAuth = require('basic-auth-connect');

admin_router.use('/kotodamas', kotodamas_router);
admin_router.use('/questions', questions_router);

admin_router.all('/', basicAuth(function(user, password) {
  return user === 'admin' && password === 'mk1215skmt';
}));


//設問一覧ページ
admin_router.get('/', function(req, res, next) {
  co(function*(){
    //設問ごとに表示
    res.render("admin",{
    });
  }).catch(e=>next(e));
});

//設問一覧ページ
admin_router.get('/users', function(req, res, next) {
  co(function*(){
    //ユーザー回答を網羅
    const all_user_answers = yield UserAnswer.findAndPopulateAnswers({}).exec();

    res.render("users",{
      all_user_answers,
    });
  }).catch(e=>next(e));
});
