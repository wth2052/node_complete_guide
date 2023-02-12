const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf =  require('csurf');
const flash = require('connect-flash');
//아래 소스코드는 허가되지 않은 인증서를 거부하지 않겠다는 의미
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
//{}로 무언가를 넣을수있음, 하지만 여기선 기본값인 세션으로 사용함
const csrfProtection = csrf();

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
)
app.use(csrfProtection);
//flash를 함수로 호출
//애플리케이션이 request 객체에 사용가능
app.use(flash())

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
app.use((req, res, next) => {
  //렌더링될 뷰에만 존재하므로 locals
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });