const questions = [
  {left:"明るい",right:"暗い"},
  {left:"暖かい",right:"冷たい"},
  {left:"厚い",right:"薄い"},
  {left:"安心な",right:"不安な"},
  /*

  {left:"良い",right:"悪い"},
  {left:"印象の強い",right:"印象の弱い"},
  {left:"嬉しい",right:"悲しい"},
  {left:"落ち着いた",right:"落ち着きない"},
  {left:"快適",right:"不快"},
  {left:"かたい",right:"やわらかい"},
  {left:"規則的な",right:"不規則な"},
  {left:"きれいな",right:"汚い"},
  {left:"現代風な",right:"古風な"},
  {left:"個性的な",right:"典型的な"},
  {left:"爽やかな",right:"うっとうしい"},
  {left:"自然な",right:"人工的な"},
  {left:"親しみのある",right:"親しみのない"},
  {left:"湿った",right:"乾いた"},
  {left:"シャープな",right:"マイルドな"},
  {left:"重厚な",right:"軽快な"},
  {left:"上品な",right:"下品な"},
  {left:"丈夫な",right:"脆い"},
  {left:"シンプルな",right:"複雑な"},
  {left:"好きな",right:"嫌いな"},
  {left:"滑る",right:"粘つく"},
  {left:"鋭い",right:"鈍い"},
  {left:"静的な",right:"動的な"},
  {left:"洗練された",right:"野暮な"},
  {left:"楽しい",right:"つまらない"},
  {left:"男性的な",right:"女性的な"},
  {left:"弾力のある",right:"弾力のない"},
  {left:"つやのある",right:"つやのない"},
  {left:"強い",right:"弱い"},
  {left:"凸凹な",right:"平らな"},
  {left:"なめらかな",right:"粗い"},
  {left:"伸びやすい",right:"伸びにくい"},
  {left:"激しい",right:"穏やかな"},
  {left:"派手な",right:"地味な"},
  {left:"陽気な",right:"陰気な"},
  {left:"洋風な",right:"和風な"},
  {left:"若々しい",right:"年老いた"},
  {left:"高級感のある",right:"安っぽい"},
  {left:"抵抗力のある",right:"抵抗力のない"},
  */

];

questions.forEach((el, index) => el.id = "q" + index);

//[q1, q2, ....q42]
const question_ids = questions.map(q => q.id);

//解答用紙
//{q0:null, q1:null, q2:null, ....,q42:null}
const answer_sheet = question_ids.reduce((sheet, q_id) => {
  sheet[q_id]=null;
  return sheet;
},{});

module.exports = {questions, answer_sheet, question_ids};

