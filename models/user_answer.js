var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var co = require('co');
var QuestionnaireAnswerSchema = require("./questionnaire_answer.js");


const questionnaires = require("../data/questionnaires.js");
const questionnaires_schema = questionnaires.reduce((obj, q)=>{
  obj[q.id] = { type:Schema.Types.ObjectId, ref:"QuestionnaireAnswer" }
  return obj;
},{});


var UserAnswerSchema = new Schema({
  id:Number,
  user_info:{
    name:  String,
    email: String,
    is_male:   Number, //0:男 1:女
    age:   Number, //何歳か
  },
  questionnaire_answers: questionnaires_schema 
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


UserAnswerSchema.statics.createNew = function(name, email, is_male, age){ 
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
        age 
      },
      questionnaire_answers: questionnaires_sheet 
    });
  });
}

UserAnswerSchema.statics.findByIdAndPopulateAnswers = function(user_answer_id){ 
  const UserAnswer =  this;
  let query = UserAnswer.findOne({id:user_answer_id});

  questionnaires.forEach(function(questionnaire){
    query.populate("questionnaire_answers." + questionnaire.id);
  });

  return query;
};

UserAnswerSchema.methods.getLeftQuestionnaires = function getLeftQuestionnaires(){

  const this_user_answer = this;

  return co(function*(){

    const answers_obj = this_user_answer.questionnaire_answers;

    const questionnaire_answers = Object.keys(answers_obj)
      .map(key => answers_obj[key])
      .filter(ans => ans);

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

module.exports= UserAnswerSchema;
