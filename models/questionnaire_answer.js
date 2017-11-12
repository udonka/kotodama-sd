var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const questions_obj= require("../data/questions.js");

const question_ids = questions_obj.question_ids;


const co = require('co');
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


//ここなら、questions_obj.scale_numを知ってるから、正規化できる
QuestionnaireAnswerSchema.statics.normalizeAnswerNum = function(answer_id){
  const answer_index = answer_id - 1; //[1,9] => [0.8].length==9
  const bunbo = questions_obj.scale_num -1; //9 => 8

  return answer_index / bunbo;
}

QuestionnaireAnswerSchema.statics.calcAveVar = function (questionnaire_id){
  const QuestionnaireAnswer = this;

  return co(function*(){
    const answer_feedbacks = {};
    
    //一個だけすっ飛ばすオプションとかほしいね。 !!!!!
    //そうすれば、user_answer.getAnswerFeedbackで使える
    var questionnaire_answers = yield QuestionnaireAnswer.find({questionnaire_id}).exec();//そのidの回答をもっておくる

    question_ids.forEach((qid)=>{
      //そのquestionだけとってくる
      const data = questionnaire_answers.map( qna => qna.answers[qid]);

      //合計、平均、分散、標準偏差を計算
      const sum = data.reduce((a,b)=>a+b,0);
      const ave = sum / data.length;
      const vari= data.reduce( (a,b)=> a + (b - ave) * (b - ave),0) / data.length;
      const dev = Math.sqrt(vari);

      answer_feedbacks[qid] = {
        data,
        ave,
        vari,
        dev,
        //あらかじめ正規化すべきかもしれない
        //いや、でも、結局ユーザーに見せるのは1~7だからな
        ave_rate:QuestionnaireAnswer.normalizeAnswerNum(ave),
        dev_rate:QuestionnaireAnswer.normalizeAnswerNum(dev),
      };

    });

    return answer_feedbacks;
      
  });

  console.log(answer_feedbacks)

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





