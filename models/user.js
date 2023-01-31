const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    console.log("설마..못찾니?",this.cart)
    this._id = id;
  }
  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if(cartProductIndex >= 0 ) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({productId: new ObjectId(product._id), quantity: newQuantity });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  const db = getDb();
  return db
    .collection('users')
    .updateOne(
      { _id: new ObjectId(this._id)},
      { $set: { cart: updatedCart }}
    );



  }
  getCart() {
    const db = getDb();
    //map으로 모든 제품을 살펴봄
    const productIds = this.cart.items.map(i => {
      return i.productId;
    });
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            //find는 제품 객체만을 전달하지만 수량도 전달할것.(보유중 장바구니 품목에서 나온 제품의 수량을 추출함.quantity)
            quantity: this.cart.items.find(i => {
              return i.productId.toString() === p._id.toString();
            }).quantity
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    //더 쉬운방법 : this.cart.items.filter()
    //filter는 배열의 요소를 필터링하는 방식에 대한 기준을 정의할수 있게 해준다.
    //품목 배열 요소
    //모든 필터링된 품목을 담은 새로운 배열을 반환한다.
    const updatedCartItems = this.cart.items.filter(item => {
      //품목을 제거하려면 false를 반환해야함
      //이유 : 품목을 담기 위해서는 true를 반환하기 때문
      return item.productId.toString() !== productId.toString();
    });
    //이로써 장바구니에 삭제한 걸 제외한 모든 품목들이 있도록 업데이트 됨
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id)},
        { $set: { cart: {items: updatedCartItems}}}
      );
  }
  //주문내역은 길어지므로 새 컬렉션을 만들어야함
  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          //주문에 대한 정보를 많이 저장하면(가격.. 등) 좋음
          user: {
            _id: new ObjectId(this._id),
            name: this.name,
          }
        };
        return db.collection('orders').insertOne(order);
      })
        //주문에 성공했다면, 이때 장바구니를 비운다
        .then(result => {
          this.cart = {items: [] };
          //그와 동시에 db에 있는 장바구니도 같이 비운다.
          return db
            .collection('users')
            .updateOne(
              { _id: new ObjectId(this._id)},
              { $set: { cart: {items: []}}}
            );
        });
  }

  getOrders() {
    const db = getDb();
    //따옴표 안에 경로 쓸것
     return db
       .collection('orders')
       .find({ 'user._id': new ObjectId(this._id) })
       //사용자의 주문 배열을 반환해라.
       .toArray();
  }


  static findById(userId) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) })
      .then(user => {
        console.log("유저 :",user);
        return user;
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = User;
