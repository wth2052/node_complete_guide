const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const db = require('./util/database')
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

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
