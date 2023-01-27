const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const sequelize = require('./util/database')
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')
const app = express();



app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
// then = promise를 쓸때 제공되는 기능.
// catch도 있음. 이 둘은 execuete에 연결가능한데
// 리턴값을 토대로 실행할것이고, 이걸 promise라고 부름

//브라우저에서 JavaScript를 사용해 비동기적 코드 작업 가능
//콜백을 사용하는 대신 promise는 좀더 체계적인 코드 작성가능
// 중첩된 익명 함수를 두번째 인수로 두는 대신 then을 사용하면
// 익명 함수를 가져와 실행하게 된다.
// 중첩된 코드는 상호의존적인 비동기적 작업이 많으면 많을수록 더 문제가 된다.

//catch는 오류가 발생하는 경우 실행되는 함수도 존재한다. (연결 실패 등)
//db.execute('SELECT * FROM products')
// .then(result => {
//   console.log(result)
// })
//.catch(err => {
// console.log(err)
// });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 들어오는 요청에 대해 미들웨어에 등록할뿐.
app.use((req, res, next) => {
  User.findByPk(1).then(user => {
    //요청 객체에 새 필드를 추가해 줄 수 있음
    //본문을 비롯한 기존의 필드를 덮어쓰기하는것만 피할것.
    //이제 데이터베이스에서 검색한 사용자를 저장하게 되는데
    //우리가 데이터베이스에서 검색하는 사용자는 단순히 데이터베이스에 있는
    //값을 포함하는 JavaScript객체가 아니라는점에 주의할것.
    //데이터베이스의 값을 포함하는 Sequelize 객체이며, sequelize 에서 추가한 destory를 비롯한 기능성 메서드를 포함한다.
    //따라서 이 요청에서는 sequelize 객체가 저장되며, 단순히 필드 값이 있는 JavaScript 객체가 아니다.
    //확장판이 생긴 셈.
    //사용자를 요청할 때마다 destroy 메서드도 사용가능
    req.user = user;
    //사용자를 설정, 검색했으면 다음 미들웨어로 가라.
    next();
  }).catch(err => console.log(err))
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
//Product는 User에게 속한다.
// 구매에 대한 언급은 하지 않음
// 두번째 인수를 넣을수 있는데, 이때 이 관계가 어떻게 관리될지를 정의함.
// constraints true = 삭제에서 사용자가 삭제되었을 때, CASCADE 처리를 할것인가의 여부
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'})
//User는 하나이상의 제품을 상점에 추가 가능함
//belongsTo는 hasMany로 대체가 가능하다.
User.hasMany(Product)
//관계의 작용 방식을 분명하게 하고자, 양방향을 정의할 예정.

//User와 Cart는 서로를 1개만 소유할수 있음.
User.hasOne(Cart);
//상관관계의 역
Cart.hasOne(User);
//한 장바구니는 여러 제품이 담길수 있다.
//through sequelize에게 이 연결들의 저장 위치를 알려줌 , cart-item
Cart.belongsToMany(Product, {through: CartItem});
//한 제품이 여러 다른 장바구니에 들어갈 수 있다
Product.belongsToMany(Cart, {through: CartItem});
//주문한 한 명의 사용자에 속한다
Order.belongsTo(User);
//한 사용자가 다수의 주문을 할 수 있다.
User.hasMany(Order)
Order.belongsToMany(Product, {through: OrderItem})
//반대로 한 제품이 다수의 주문에 속할 수 있는데
//생략

//정의한 모든 모델을 둘러봄 모델을 데이터베이스로 동기화해 해당하는 테이블, 관계를 생성함
sequelize
  // .sync({force: true})
  // 매번 테이블에 대한 변경사항을 덮어쓰겠다.
  .sync()
  .then(result => {
  // console.log(result)
    return User.findByPk(1) //더미코드
})
  .then(user => {
    if(!user) {
      return User.create({name: 'Woo', email: 'wth2052@gamil.com'})
    }
    //Promise resolve? 즉시 사용자를 확인하는 Promise
    return user;
  })
  .then(user => {
    return user.createCart();
    // console.log(user)

  })
  .then(cart => {
    app.listen(3000);
  })
.catch(err => {
    console.log(err)
  })
