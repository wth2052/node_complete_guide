const Product = require('../models/product');
//제품을 찾은 후
//장바구니를 정리하는 과정을
//주기별로 진행하기도 함. (애플리케이션에서)

//혹은

//Cart 페이지를 로딩할 때, 즉
//user.js에서 getCart를 호출할 때
//user 객체에 this.cart.items가 있는데
//그에 따라 받는 제품 배열은 비어있으면 장바구니에 있는 제품과
//데이터베이스에 있는 제품이 일치하지 않게 된다.
// = 뒤에서 요청을 보내야함
//장바구니를 업데이트할 때 사용했던 툴을 이용해
//데이터베이스 데이터와 일치시킴
//빈 제품 배열을 받았는데
//장바구니에 제품이 있다면 장바구니를 초기화, 데이터베이스로부터 받은 데이터에 장바구니에 있는 것보다 제품이 적다면
//어떤 차이가 있는지 보고 장바구니를 알맞게 업데이트하는 방법을 사용.


exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: '전체 포켓몬',
        path: '/products'
      });
    })
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};


exports.getIndex = (req, res, next) => {
 //구조분해 인수목록에 인수로서 수신하는 값의 정보를 끌어낼 수 있는 기능
  Product.fetchAll()
    .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    })
  })
    .catch(err => {
      console.log(err);
    });
};


exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(products => {
              res.render('shop/cart', {
                path: '/cart',
                pageTitle: '내 장바구니',
                products: products
              });
        })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(cart => {
      res.redirect('/cart')
  })
    .catch(err => console.log(err))
    //hidden input으로 가격을 백엔드로 전달가능하지만 이게 더 깔끔한 방법.
    //요청을 통해 ID를 검색하면 백엔드에서 모든 데이터를 검색해야 하기 때문.
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .addOrder()
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  //products인 이유 : app.js에서 Order와 Product간의 관계를 설정하였고
  //Sequelize가 이름을 복수로 만들어 Eager Loading라는 개념을 통해
  //Sequelize가 orders를 가져올때 관련된 products까지 가져와서
  //주문과 주문에 해당하는 제품을 포함한 배열을 제공하도록 하는것
  //orders products 사이의 관계를 설정해두었기 때문에 둘을 함께 로딩할 수 있는것이다.

  req.user.getOrders()
    .then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: '주문',
      orders: orders
    });
  })
    .catch(err => console.log(err))

};



exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
