const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//이 생성자에 JavaScript객체를 전달,
//이 객체에는 제품이 어떻게 어떻게 되어있는가를 정의함.
const productSchema = new Schema({
  //이때 키만 정의하지말고 유형도 같이 정의하는것이 중요하다.
  //Mongodb가 Schemaless임에도 Schema를 생성하는 이유?
  //-> 특정 스키마에 한정되지 않는 유동성이 있지만, 다루는 데이터가 특정 구조를 가지고있기때문에
  //Mongoose는 사용자가 데이터에만 집중하도록 돕기 위해
  //사용자의 데이터가 어떻게 생겼는지 알아야하고, 이때문에 Schema를 정의해야한다.
  //단 반드시 하진 않아도 된다.
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId:  {
    type: Schema.Types.ObjectId,
    //ref : 문자열을 가져다가 mongoose에게 해당 필드 데이터에 실제로 연관된 다른 Mongoose 모델이 무엇인가를 알려줌
    ref: 'User',
    required: true
  }
  //Id는 정의안해도됨. 이후에 자동생성될것
  //userId는 나중에 추가
  //몽구스가 모델 이름인 Product를 소문자로 바꾼후 복수형으로 씀 = products 테이블이 어디서 왔는가
});
module.exports = mongoose.model('Product', productSchema);
