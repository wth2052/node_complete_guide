//mongodb에 엑세스 하는 이유 : ObjectId 유형에 접근하기 위해
const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }


  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      //포켓몬 업데이트
      //첫번째에는 어떤 여소 혹은 어떤 문서를 업데이트 하는가
      // 두번째 인수에는 문서를 업데이트 하는 방식을 정의
      // $set = 객체를 값으로 받아들이는데 앞서 필터를 적용해 찾은 기존 문서에
      // 만들고 싶은 수정 사항을 설명해야함
      //Mongodb가 다음과 같은 객체에 있는 키-값 필드를 데이터베이스에서 찾은 문서에 저장할것이다.
      //데이터베이스 문서에 있는 키-값 쌍이기때문에 / 새로운 값으로 작성할것임.
      // Update the product
      dbOp = db
        .collection('products')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection('products').insertOne(this);
    }
    return dbOp
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = getDb()
    // find는 promise를 즉시 반환하는 대신, 커서라는것을 반환한다
    //커서 = Mongodb가 제공하는 객체, 단게별로 요소와 문서를 탐색
    //이는 이론적으로 컬렉션에서 수백만개의 문서를 반환할 수도 있지만
    //그만한 분량을 한번에 다 전달하고싶지는 않을것.
    //find는 MongoDb에게 다음 문서를 순차적으로 요청할 수 있는 일종의 손잡이를 제공하는것.
    //toArray? MongoDB에게 모든 문서를 받아서 JavaScript 배열로 바꾸게 할 수 있다.
    //수십개~백개 정도 되는 문서가 있는 경우에만 사용할것.
    //아니면 페이지네이션을 구현하는 편이 낫다.
    return db
      .collection('products')
      .find()
      .toArray()
      .then(products => {
        console.log(products);
        return products;
      })
      .catch(err => {
        console.log(err);
      });
  }



  static findById(prodId) {
    const db = getDb();
    return db
      .collection('products')
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then(product => {
        console.log(product);
        return product;
      })
      .catch(err => {
        console.log(err);
      });
  }

  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection('products')
      .deleteOne({_id: new mongodb.ObjectId(prodId) })
      .then(result => {
        console.log("포켓몬이 성공적으로 삭제되었습니다.")
        console.log(result)
      })
      .catch(err => {
        console.log(err)
      })
  }

}

module.exports = Product;
