const fs = require('fs');
const path = require('path');
const Cart = require('./cart')
const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};


module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      //id가 있는경우 save는 새 ID와 제품을 생성해서는 안됨.
      //기존에 있는것을업데이트 해야함.
      if (this.id) {
        //임시 prod 인수 또는 익명 함수의 prod 인수에  저장되어 있는 모든 제품에 엑세스하고 이 배열에서 찾는 id가 this.id인지 확인
        //편집하려고 하는 제품을 현재 보고 있는 상황이라면, 편집하고 싶은 제품의 인덱스를 찾아 해당 제품 배열에서 교체해줌
        const existingProductIndex = products.findIndex(prod => prod.id === this.id);
        const updatedProducts = [...products];
        //여기서의 this = 업데이트된 제품 그 잡채
        // 새로운 제품 인스턴스를 생성, 기존 제품의 관한 정보로 채울거기 때문
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          console.log(err);
        });
      }else{
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log(err);
        });
      }
    });
  }
  //삭제
  static deleteById(id) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id);
      //익명 함수, 함수 반환 기준에 맞지 않는 요소를 새로운 배열로써 반환.
      //삭제하려는 ID와 다른 ID를 가진 모든 요소를 유지해 새로운 배열로써 반환된다.
      const updatedProducts = products.filter(prod => prod.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts),err => {
        if(!err){
          Cart.deleteProduct(id, product.price);
        }
      });
    });

  }
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      cb(product);
    });
  }
};
