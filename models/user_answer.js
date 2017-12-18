var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var co = require('co');
var QuestionnaireAnswerSchema = require("./questionnaire_answer.js");

const questions_obj = require("../data/questions"); 
const {questions, answer_sheet, question_ids, scale_num} = questions_obj;

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
  questionnaire_answers: Schema.Types.Mixed

  
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


UserAnswerSchema.methods.populateAnswers = function (){
  const this_user_answer_doc = this; //doc
  return co(function*(){
    questionnaires.forEach(function(questionnaire){
      this_user_answer_doc.populate("questionnaire_answers." + questionnaire.id)
    });

    return this_user_answer_doc.execPopulate();
  }).catch(e=>next(e));
}

//この人のセンスの傾向(各質問ごと)を調べる
UserAnswerSchema.methods.calcSenseTends = function (){
  const this_user_answer = this; //document

  //自分に対してpopulateすんのめんどくね？ !!!!
  const QuestionnaireAnswer = mongoose.model("QuestionnaireAnswer");

  return co(function*(){
    const populated_user_answer = yield this_user_answer.populateAnswers();

    //answer_feedbacks の列
    const array_of_answer_feedbacks = yield Promise.all(
      questionnaires.map(qn=>qn.id).map(qn_id=>
        QuestionnaireAnswer.calcAveVar(qn_id) // , my_questionnaire_answer._id)自分のやつ入っちゃうけど、まいっか⭐︎
      )
    );

    const questionnaires_answer_feedbacks =
      questionnaires.map(qn=>qn.id).map((qn_id,index)=>
        ({questionnaire_id:qn_id, answer_feedbacks: array_of_answer_feedbacks[index] }));



    //それぞれの質問に対し ::質問ごとの傾向を見たいので先にこちらをループする。
    const tends = questions.map((question)=>{
      //このユーザーの、平均と比べた回答の傾向

      //それぞれの設問に対し平均との差を求めたい
      const tend_over_questionnaires = questionnaires.map(qn=>{
        const qn_id = qn.id;
        //questionの回答を得る
        const questionnaire_answer =  populated_user_answer.questionnaire_answers[qn_id];
        const question_answer = questionnaire_answer.answers[question.id];

        //平均の回答
        const answer_feedbacks = questionnaires_answer_feedbacks.find(q => q.questionnaire_id == qn_id).answer_feedbacks;

        const feedback =  answer_feedbacks[question.id];

        const ave  = feedback.ave;

        const dev = question_answer - ave;//偏差
        const tend = dev / feedback.dev; //を標準偏差でわる

        //console.log(`設問${qn_id} の質問 ${question.id} について回答は${question_answer} 平均は${ave.toPrecision(3)} 偏差は${dev.toPrecision(3)} 標準偏差は${feedback.dev.toPrecision(3)}なので、傾向は${tend.toPrecision(3)} `);

        return tend;


      }).reduce((a,b)=>a+b) / questionnaires.length;

      return {
        question_id:question.id,
        question:question,
        tend:tend_over_questionnaires,
      }
    });

    return tends

  });
};


UserAnswerSchema.methods.getAnswerFeedbacks = function (questionnaire_id){

  const this_user_answer = this;
  const QuestionnaireAnswer = mongoose.model("QuestionnaireAnswer");

  return co(function*(){
    const my_questionnaire_answer = this_user_answer.questionnaire_answers[questionnaire_id];
    if(!my_questionnaire_answer){
      throw new Error("未回答の設問に結果はありません。");
    }

    const answer_feedbacks = yield QuestionnaireAnswer.calcAveVar(questionnaire_id, my_questionnaire_answer._id);

    /* こんなののれつ {
        data,
        ave,
        vari,
        dev,
        ave_rate:QuestionnaireAnswer.normalizeAnswerNum(ave),
        dev_rate:QuestionnaireAnswer.normalizeDev(dev),
        data_rate: data.map(point => QuestionnaireAnswer.normalizeAnswerNum(point))
      };
    */


    //平均はわかった。自分の情報を付け足して返す
    Object.keys(answer_feedbacks).forEach(function(qid){
      const feedback = answer_feedbacks[qid];

      const pointCalcurator = function(x){
        const val = Math.exp(- Math.pow((x-feedback.ave),2) / (2 * feedback.vari ));
        //分散が0だと、分母が0になってしまう。その場合、支持率100か0
        return isNaN(val) ? 1 : val;
      }

      const my_answer = my_questionnaire_answer.answers[qid];

      Object.assign(answer_feedbacks[qid],{
        my_answer,
        my_answer_rate:QuestionnaireAnswer.normalizeAnswerNum(my_answer),
        my_point : pointCalcurator(my_answer) 
      });
    });

    console.log("answer_feedbacks");
    //console.log(answer_feedbacks);

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
