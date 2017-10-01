var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const question_ids = require("../data/questions.js").question_ids;

//  answers:{
//    q1:Number,
//    q2:Number,...
//  }

const answer_sheet = question_ids.reduce((sheet, q_id) => {
  sheet[q_id]=Number;
  return sheet;
},{});


var QuestionnaireAnswerSchema = new Schema({
  //_id:ObjectId
  questionnaire_id:String,
  answers:answer_sheet
});


QuestionnaireAnswerSchema.virtual("hasEmpty").get(function(){
  return Object.keys(this.answers).find(q_id => !the_answer.answers[q_id]);
});

QuestionnaireAnswerSchema.virtual("questionsLength").get(function(){
  return Object.keys(this.answers).length;
});

QuestionnaireAnswerSchema.virtual("answersLength").get(function(){
  return Object.keys(this.answers).filter(q_id => !!the_answer.answers[q_id]).length;

});

QuestionnaireAnswerSchema.virtual("answeredRate").get(function(){
  return this.answersLength / this.questionsLength;
});

module.exports = QuestionnaireAnswerSchema;





