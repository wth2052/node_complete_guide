const fs = require('fs');
const path = require('path');
const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);
const getProductsFromFile = (cb) => {

  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
    //이 콜백을 호출하게되면 -> controllers에 가서 FetchAll을 호출하는 컨트롤러로 이동, 함수 내부로 전달함
  });
}


module.exports = class Product {
  constructor(t) {
    this.title = t;
  }

  save() {
    getProductsFromFile(products => {
      // 여기서 this가 바인딩한 대상을 잃지 않고 클래스와 클래스에 기반한
      // 객체를 가리키도록 항상 화살표 함수를 사용해야함.
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    })
  }

  static fetchAll(cb) {
    getProductsFromFile(cb)
  }
};

//현재 수정해야할 사항,
//너무 제한된 기능만을 사용중
// 제품 필드도 1개밖에없음 등...
