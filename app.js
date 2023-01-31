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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('63d8eb62947aa5be36a58162')
    .then(user => {
      //전체가 mongoose model이라 모델 함수, 메서드 등 사용자 객체에 전부 호출 가능
      // 저장하게되는 사용자 객체도 호출 가능~
      req.user = user
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

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