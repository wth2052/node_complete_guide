const fs = require('fs');
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
  );

  module.exports = class Cart {
    static addProduct(id, productPrice) {
      // 기존 또는 이전 cart 파일에서 불러온 다음
      fs.readFile(p, (err, fileContent) => {
        let cart = {products: [], totalPrice: 0};
        if (!err) {
          cart = JSON.parse(fileContent);
        }
        // 이를 분석하여 해당 제품이 있는가를 판단
        const existingProductIndex = cart.products.findIndex(
          prod => prod.id === id
        );
        const existingProduct = cart.products[existingProductIndex];
        let updatedProduct;
        // 기존 제품을 찾고 새로운 제품을 추가 or 수량을 증가시킴
        if (existingProduct) {
          updatedProduct = {...existingProduct};
          updatedProduct.qty = updatedProduct.qty + 1;
          cart.products = [...cart.products];
          cart.products[existingProductIndex] = updatedProduct;
        } else {
          updatedProduct = {id: id, qty: 1};
          cart.products = [...cart.products, updatedProduct];
        }
        cart.totalPrice = cart.totalPrice + +productPrice;
        fs.writeFile(p, JSON.stringify(cart), err => {
          console.log(err);
        });
      });
    }


    static deleteProduct(id, productPrice) {
      fs.readFile(p, (err, fileContent) => {
        if (err) {
          return;
        }
        //fileContent가 문자열 JSON형식이라 사용하기 전에 분석해야함.
        const updatedCart = { ...JSON.parse(fileContent) };
        //제품이 없다? 되돌려보냄
        const product = updatedCart.products.find(prod => prod.id === id);
        if (!product) {
          return;
        }
        const productQty = product.qty;
        updatedCart.products = updatedCart.products.filter(
          prod => prod.id !== id
        );
        updatedCart.totalPrice =
          updatedCart.totalPrice - productPrice * productQty;

        fs.writeFile(p, JSON.stringify(updatedCart), err => {
          console.log(err);
        });
      });
    }

    static getCart(cb) {
      fs.readFile(p, (err, fileContent) => {
        const cart = JSON.parse(fileContent);
        if(err){
          cb(null);
        }else {
          cb(cart);
        }
     })
  }
  };
