var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionnaireAnswerSchema = require("./questionnaire_answer.js");

const questionnaires = require("../data/questionnaires.js");

//{
//  "k1":{ type:Schema.Types.ObjectId, ref:"QuestionnaireAnswer" },
//  "k2":{ type:Schema.Types.ObjectId, ref:"QuestionnaireAnswer" },
//  "k3":{ type:Schema.Types.ObjectId, ref:"QuestionnaireAnswer" },
//  "k4":{ type:Schema.Types.ObjectId, ref:"QuestionnaireAnswer" }
//}

const questionnaires_schema = questionnaires.reduce((obj, q)=>{
  obj[q.id] = { type:Schema.Types.ObjectId, ref:"QuestionnaireAnswer" }
  return obj;
},{});


var UserAnswerSchema = new Schema({
  id:Number,
  user_info:{
    name:String,
    email:String,
    sex:Number, //0:男 1:女
    age:Number, //何歳か
  },

  questionnaire_answers: questionnaires_schema 

});

//virtuals
//completed
//完成度 progress
//
UserAnswerSchema.statics.createNew = function(name, email, sex, age){ 
  const UserAnswer = this;
  const random_id = 333;
  const questionnaires_sheet = questionnaires.reduce((obj, q)=>{
    obj[q.id] = null;
    return obj;
  },{});

  return new UserAnswer({
    id: random_id,
    user_info: {
      name, 
      email,
      sex, //0:男 1:女
      age //何歳か
    },
    questionnaire_answers: questionnaires_sheet 
  });
}

module.exports= UserAnswerSchema;
