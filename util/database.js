const mysql = require('mysql2');

const pool = mysql.createPool({
   host: 'localhost',
  user: 'root',
  database: 'node-complete',
  password: '3d720307'
});
//promise를 쓰는이유, 이 연결들을 작업할때 promise를 사용함으로써 콜백 대신
//비동기적 태스크, 비동기적 데이터를 다룰 수 있게된다.
// promise는 코드를 좀더 체계화된 방식으로 작성할수 있도록 해서
// 다수의 콜백 중첩을 추가하여, promise 체인을 사용할 예정
module.exports = pool.promise();