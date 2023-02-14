const fs = require('fs');
const path = require('path')

const Product = require('../models/product');
const Order = require('../models/order');
const PDFDocument = require('pdfkit')
//얼마나 많이 보여줄껀지?
const ITEMS_PER_PAGE = 2;
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
  const page = +req.query.page || 1;
  let totalItems;
  //커서를 이용하여 필요한 항목만 검색할 수 있다.
  Product.find()
    //모든 데이터를 받지 않고 숫자만 세어 데이터를 받는것 보다 빠름!!
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: '포켓몬 리스트',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  //findById로 문자열을 전달시, Mongoose가 알아서 ObjectId로 변환함 WOW!
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getIndex = (req, res, next) => {
  //page=우리가 지은 페이지 이름, 상수에 저장
  //올바른 값을 가지던, 1이여야함
  const page = +req.query.page || 1;
  let totalItems;
  //페이지마다 얼마나 많은 페이지가 보여야 하는가? 맨위 상수에 저장 끝.
  //이제 DB로부터 검색하는 데이터의 양을 조절해야함
  //이전 페이지 번호
  // 보여줄 자료 구하기
  //이전 페이지 번호 x 몇개나 보여줄껀지 수
  //페이지 2에 있다면 1을 뺀 1에 곱하기 2 만큼 (처음 두 포켓몬만큼 생략함.)
  // -> skip 메서드
  //이때 생략 뿐 아니라
  //받게 되는 항목의 양도 제한해야한다.
  // -> 이전 페이지의 항목을 생략하고 현재 페이지에 보여줄 만큼의
  // 항목만 가져올수 있기 때문이다.
  // -> limit 메서드
  //https://sequelize.org/docs/v6/core-concepts/model-querying-basics/ 시퀄라이즈 사용시

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
      //currentPage: 현재 활성화된 페이지
      //hasNextPage: 다음 페이지가 있는지?
      // 현재 페이지에 페이지당 항목을 곱한 값보다 클때 = 다음 페이지가 있음을 의미
      // 10개의 포켓몬이 있고 현재 페이지 4에 있다면
      // 2 * 4 8개의 제품을 보았음을 의미, 다음 페이지가 있다.
      // hasPreviousPage = 이전 페이지, 현재 페이지가 1보다 큰지 확인한다.
      // 1보다 크다? true면 이전 페이지가 표시되고
      // 작으면 1페이지라는 얘기기때문에 표시되지 않음.
      // nextPage 다음 페이지
      // PreviousPage 이전 페이지
      //  lastPage 마지막 페이지, 열 한개의 제품이 있고 페이지당 두개의 제품을 보여준다면
      // 계산값이 5.5인데, 반개만 보여줄수 없으므로 반올림하여 6을 반환시킴.
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      console.log(user.cart.items)
      const products = user.cart.items
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: '내 장바구니',
        products: products,

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  //hidden input으로 가격을 백엔드로 전달가능하지만 이게 더 깔끔한 방법.
  //요청을 통해 ID를 검색하면 백엔드에서 모든 데이터를 검색해야 하기 때문.
};


exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: '주문',
        orders: orders,
        //csurf에서 알아서 생성해줌

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order => {
    if (!order) {
      return next(new Error('주문을 찾을 수 없습니다'));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('사용자가 일치하는 주문만 볼 수 있습니다.'));
    }
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="' + invoiceName + '"'
    )
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    pdfDoc.fontSize(26).text('주문서', {
      underline: true,
    });
    pdfDoc.text('--------------------------------');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice = totalPrice + prod.quantity * prod.product.price;
      pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price);
    })
    pdfDoc.text('----');
    pdfDoc.fontSize(20).text('총 가격 : $' + totalPrice);
    pdfDoc.end();
    //아래와 같이 읽게 시키는건 어느 시점에 컴퓨터 메모리는 overflow될것
    //--> 스트리밍 데이터가 좋다
    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) {
    //     return next(err);
    //   }
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
    //   res.send(data);
    //아래와 같이 스트리밍 방식으로 데이터를 제공할 시 overflow를 걱정하지 않아도 된다.
    // 큰 파일을 제공할 때 권장하는 방법.
    // const file = fs.createReadStream(invoicePath);
    //
    // //읽어들인 데이터를
    // //res로 전달, = res = 쓰기가능한 객체
    // //읽기 가능한 스트림을 사용해 출력값을 쓰기 스트림으로 전달
    // file.pipe(res);
  })
    .catch(err => next(err));
};