const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true)

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('63d8eb62947aa5be36a58162')
    .then(user => {
      //전체가 mongoose model이라 모델 함수, 메서드 등 사용자 객체에 전부 호출 가능
      // 저장하게되는 사용자 객체도 호출 가능~
      //app.js에서 사용자를 검색할 때 요청에 저장하게되면
      //모든 컨트롤러에서 req.user를 사용가능했었다.

      //★req.user에 저장한 데이터를 컨트롤러의 라우트 핸들러 안에서 같은 요청 주기동안 사용할수 있었다.★
      //하지만 controllers/auth.js에 있는 req.isLoggedIn = true;는 응답을 보내기 직전에 요청을 바꾸면
      //데이터를 사용할수 없다.
      //=== 로그인 정보는 요청에 저장하면 안된다. 그래서 쿠키가 필요하다.
      //글로벌 변수에 저장할수도 있음 (내가했던 authmiddleware)
      //허나 이건 모든 요청간 공유되기 때문에
      //-> 사용자 간에도 공유된다.
      // 쿠키는데이터가 해당 사용자에게 맞춤화되어 다른 사용자에 영향을 끼치지 않음
      //쿠키는 요청과 함께 보내지면서 사용자가 이미 인증되었다고 알려줌
      req.user = user
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)
app.use(errorController.get404);

mongoose
  .connect(
    'mongodb+srv://root:3d720307@cluster0.w2bgbed.mongodb.net/shop?retryWrites=true&w=majority'
  )
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