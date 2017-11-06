var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var co = require('co');
var QuestionnaireAnswerSchema = require("./questionnaire_answer.js");
const questions_obj      = require("../data/questions"); 
const questionnaires = require("../data/questionnaires.js");


const questionnaires_schema = questionnaires.reduce((obj, q)=>{
  obj[q.id] = { type:Schema.Types.ObjectId, ref:"QuestionnaireAnswer" }
  return obj;
},{});

/*
 * {
 *    k1: { type:Schema.Types.ObjectId, ref:"QuestionnaireAnswer" }
 *    k2: { type:Schema.Types.ObjectId, ref:"QuestionnaireAnswer" }
 * }
 * */


/*
性別その他
  radioを追加
姓、名、ふりがな
出身（県or国）
学籍番号（電通大生の場合）

*/

var UserAnswerSchema = new Schema({
  id:Number,
  user_info:{
    name:  {
      sei:String,
      mei:String,
      sei_kana:String,
      mei_kana:String,
    },
    email: String,
    is_male:   Number, //0:男 1:女 2:その他
    age:   Number, //何歳か
    from: String,
    student_id: String,
  },
  questionnaire_answers: questionnaires_schema ,

  
});

//virtuals
//completed
//完成度 progress
//


function randomFromIntRange(min, max){ // 100000 ~ 999999
  const diff = max - min;
  return Math.floor(Math.random() * diff) + min;
}

function findEmptyId(UserAnswer){
  return co(function*(){
    let random_id = 0;

    while(true){

      random_id = randomFromIntRange(100000, 999999); //6桁の数
      let user = yield UserAnswer.findOne({id:random_id}).exec();

      if(user){
        continue;
        console.log("again! " , random_id);
      }
      else{
        break;
        console.log("found! " , random_id);
      }
    }

    return random_id;

  });
}


UserAnswerSchema.statics.createNew = function(name, email, is_male, age, from, student_id){ 
  const UserAnswer = this;
  return co(function*(){

    let random_id = yield findEmptyId(UserAnswer);


    const questionnaires_sheet = questionnaires.reduce((obj, q)=>{
      obj[q.id] = null;
      return obj;
    },{});

    return new UserAnswer({
      id: random_id,
      user_info: {
        name, 
        email,
        is_male, //1:男 0:女
        age ,
        from,
        student_id,
      },
      questionnaire_answers: questionnaires_sheet 
    });
  });
}

UserAnswerSchema.statics.findByIdAndPopulateAnswers = function(user_answer_id){ 
  return this.findOneAndPopulateAnswers({id:user_answer_id});
};


UserAnswerSchema.statics.findOneAndPopulateAnswers = function(q){ 
  const UserAnswer =  this;
  let query = UserAnswer.findOne(q);

  questionnaires.forEach(function(questionnaire){
    query.populate("questionnaire_answers." + questionnaire.id);
  });

  return query;
};

UserAnswerSchema.statics.findAndPopulateAnswers = function(q){ 
  const UserAnswer =  this;
  let query = UserAnswer.find(q);

  questionnaires.forEach(function(questionnaire){
    query.populate("questionnaire_answers." + questionnaire.id);
  });

  return query;
};


/* 削除するやつ？するやつ？
UserAnswerSchema.statics. = function (questionnaire_id){


}
*/


UserAnswerSchema.methods.getAnswerFeedbacks = function (questionnaire_id){

  const this_user_answer = this;
  const QuestionnaireAnswer = mongoose.model("QuestionnaireAnswer");

  return co(function*(){

    const my_questionnaire_answer = this_user_answer.questionnaire_answers[questionnaire_id];

    if(!my_questionnaire_answer){
      throw new Error("未回答の設問に結果はありません。");
    }

    const other_questionnaire_answers = 
      Array.from(yield QuestionnaireAnswer.find({questionnaire_id}).exec())
        .filter(qa => !qa._id.equals(my_questionnaire_answer._id)) //自分を排除
        .map(qa => qa.answers);

    console.log("other_questionnaire_answers");
    console.log(other_questionnaire_answers );

    //questionnaireごとのを、questionごとに転置する

    const question_ids = questions_obj.question_ids;
    const answer_feedbacks = Object.assign({},questions_obj.answer_sheet);

    question_ids.forEach((qid)=>{
      const data = other_questionnaire_answers.map( qna => qna[qid]);

      const sum = data.reduce((a,b)=>a+b,0);
      const ave = sum / data.length;
      const vari= data.reduce( (a,b)=> a + (b - ave) * (b - ave),0) / data.length;
      const dev = Math.sqrt(vari);

      const pointCalcurator = function(x){
        return Math.exp(- Math.pow((x-ave),2) / (2 *vari ));
      }

      const my_answer = my_questionnaire_answer.answers[qid];

      answer_feedbacks[qid] = {
        data,
        ave,
        vari,
        dev,
        ave_rate:QuestionnaireAnswer.normalizeAnswerNum(ave),
        dev_rate:QuestionnaireAnswer.normalizeAnswerNum(dev),
        my_answer,
        my_answer_rate:QuestionnaireAnswer.normalizeAnswerNum(my_answer),
        my_point : pointCalcurator(my_answer) 
      };
      
    });


    const total_point = Object.keys(answer_feedbacks).map(qid => answer_feedbacks[qid].my_point).reduce((a,b)=>a+b)/Object.keys(answer_feedbacks).length;


    return {answer_feedbacks, total_point}
  });
}

UserAnswerSchema.virtual("user_info.name_str").get(function(){
  return this.user_info.name.sei + " " + this.user_info.name.mei;
});

//残ってる設問の列
UserAnswerSchema.virtual("left_questionnaires").get(function(){
  const this_user_answer = this;
  const answers_obj = this_user_answer.questionnaire_answers;
  const questionnaire_answers = Object.keys(answers_obj)
    .map(key => answers_obj[key])
    .filter(ans => ans);

  return questionnaires.filter( qn => {
    //回答が存在するか？
    let the_answer = questionnaire_answers.find(qa => qa.questionnaire_id == qn.id);

    //存在しないなら、残ってる
    if(!the_answer){ return true; }

    //中身が存在しなければ、それも残ってる
    if(!(the_answer.answers)){ return true; }

    //回答の中に、空欄があるか。
    let null_exist = Object.keys(the_answer.answers).find(q_id => !the_answer.answers[q_id]);

    //nullが存在するなら残ってる
    if(null_exist) {
      return true;
    }

    //回答が存在して、空欄が存在しないなら、残ってない
    return false;
    
  });

});

module.exports = UserAnswerSchema;
