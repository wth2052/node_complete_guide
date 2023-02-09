const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

mongoose.set('strictQuery', true)

const errorController = require('./controllers/error');
const User = require('./models/user');
//나중에 다시 사용할 상수 값 = 전부 대문자
const MONGODB_URI =
  'mongodb+srv://root:3d720307@cluster0.w2bgbed.mongodb.net/shop '
const app = express();
//세션스토어
//이를 사용함으로써
//단일유저에 집중하고 사용자 전반에 데이터를 공유하지 않아도 된다.
//세션에 장바구니를 비롯한 다른것도 저장이 가능하다.
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
//secret: 비밀리에 쿠키를 저장하는 해시를 등록시 사용
//resave: 세션이 완료되는 모든 요청마다 저장되는게 아니라 세션이 변경되었을때만 저장이 됨
//saveUninitialized: 저장할 필요가 없는 요청의 경우 변경된 내용이 없어서 아무 세션도 저장되지 않도록 한다


app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  //유저를 먼저 session.user_id에서 가져온 후
  //위가 이행되면 user라는 프로미스 리턴값을 req.user에 담아준다
  //이 방법을 통해 작업 가능한 Mongoose 모델의 존재를 확인, Mongoose메서드가 다시 사용될수있게 한다.
  //req.session.user를 req.user로 바꾸는 이유?
  //여기서 Mongoose 모델인 user를 저장하기 때문
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
})


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    //유저 생성자, 카트도 손에 쥐어준다!
    //findOne에 인수를 제공 안하면, 발견하는 첫 사용자를 항상 리턴함.
    User.findOne().then(user => {
      //then에는 user 객체가 정의되지 않은경우에 새로운 사용자를 생성해라.
      if(!user){
        const user = new User({
          name: 'Taehyeon',
          email: 'taehyeon@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch(err => {
    console.log(err)
  })