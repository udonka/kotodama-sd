var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const questions_obj= require("../data/questions.js");

const question_ids = questions_obj.question_ids;

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


QuestionnaireAnswerSchema.statics.normalizeAnswerNum = function(answer_id){
  const answer_index = answer_id - 1; //[1,9] => [0.8].length==9
  const bunbo = questions_obj.scale_num -1; //9 => 8

  return answer_index / bunbo;
}

QuestionnaireAnswerSchema.virtual("hasEmpty").get(function(){
  return Object.keys(this.answers).find(q_id => !this.answers[q_id]);
});

QuestionnaireAnswerSchema.virtual("questionsLength").get(function(){
  return Object.keys(this.answers).length;
});

QuestionnaireAnswerSchema.virtual("answersLength").get(function(){
  return Object.keys(this.answers).filter(q_id => !!this.answers[q_id]).length;

});

QuestionnaireAnswerSchema.virtual("answeredRate").get(function(){
  return this.answersLength / this.questionsLength;
});

module.exports = QuestionnaireAnswerSchema;





