const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf =  require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const dotenv = require('dotenv');
dotenv.config();
const env = process.env
//아래 소스코드는 허가되지 않은 인증서를 거부하지 않겠다는 의미
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
mongoose.set('strictQuery', true)

const errorController = require('./controllers/error');
const User = require('./models/user');
//나중에 다시 사용할 상수 값 = 전부 대문자
const MONGODB_URI =

  env.MONGODB_URL

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  //파일의 저장 위치와 이름을 어떻게 지정할지
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req,file,cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
})
const fileFilter = (req, file, cb) => {
  //저장하고싶다 true 하기싫다 false
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {

  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      //throw new Error('Dummy!'); (동기식 코드에서는 오류를 출력할 수 있지만)
      //promise, then, catch, callback 내부에서는 오류 주변의 next를 사용해라.
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      throw new Error(err);
    });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

//오류가 전달된 next를 반환시
//다른 모든 미들웨어를 건너뛰어 오류 처리 미들웨어로 빠지게 함
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');

  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });

});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });