const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (callback) => {
MongoClient.connect('mongodb+srv://root:3d720307@cluster0.w2bgbed.mongodb.net/shop?retryWrites=true')
  .then(client => {
    console.log('몽고DB와 성공적으로 연결되었습니다.');
    _db = client.db();
    callback();
  })
  .catch(err => {
    console.log(err);
    throw err;
  });
};
//Mongodb는 뒤에서 연결 풀링이라는 방법으로 이 process를 관리하는데
//DB와 동시 상호작용을 다수 진행하기 충분한 연결을 제공한다.


const getDb = () => {
  if (_db) {
    return _db;
  }
  throw '데이터베이스를 찾을 수 없습니다.';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;