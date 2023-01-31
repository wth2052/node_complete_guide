const Product = require('../models/product');

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
  // Product.findAll({where: {id : prodId}})
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
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
};


exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      console.log(cart);
      return cart.getProducts()
        .then(products => {
              res.render('shop/cart', {
                path: '/cart',
                pageTitle: '내 장바구니',
                products: products
              });
        })
        .catch(err => {
          console.log(err)
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

  // let fetchedCart;
  // let newQuantity = 1;
  // req.user
  //   .getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then(products => {
  //     //만약 제품이 있다면 변수에 값을 지정, 없으면 undefined
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }
  //
  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     return Product.findByPk(prodId);
  //   })
  //   .then(product => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity }
  //     });
  //   })
  //   .then(() => {
  //     res.redirect('/cart');
  //   })
  //   .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: {id: prodId}});
  })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err))
    //hidden input으로 가격을 백엔드로 전달가능하지만 이게 더 깔끔한 방법.
    //요청을 통해 ID를 검색하면 백엔드에서 모든 데이터를 검색해야 하기 때문.
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();

    })
    .then(products => {
      let fetchedCart;
      return req.user
        .createOrder()
        .then(order => {
          //products를 통해 추가하지만
          // 각각의 제품이 특수 키 혹은 필드를 가져 Sequelize가 이해하도록 해야한다. (map 사용하여 배열로 리턴)
          order.addProducts(products.map(product => {
            // 이때 order-item 모델에 정의할때 그대로 사용해야한다
            //장바구니와 연관된 테이블 이름 다음은 quantity를 입력하면
            //cart에서 quantity를 받고 orderItem에 받고 다음줄에서 반환됨.
            //그럼 products 배열에 기존 제품 데이터와 같이 order에 대한 quantity 정보가 있다.
            // 해당 정보에 따라 addProducts가 quantity만큼 order에 추가한다
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch(err => console.log(err));
    })
    .then(result => {
      return fetchedCart.setProducts(null);
    })
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

  req.user.getOrders({include: ['products']})
    .then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
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
