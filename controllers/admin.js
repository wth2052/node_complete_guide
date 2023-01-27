const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add- product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  //belongToMany 연관관계같은 경우 sequelize는 생성할수있는 메서드 등을 추가한다.
  //관게를 정의해두었기때문에 sequelize는 create.product 메서드를 사용자에게 추가해준다.
  // 모델 이름이 product이므로 create.product
  //메서드 이름의 첫 부분에 자동으로 추가해줌.
  // SO COOL!
  //create = 모델에 기반한 새 요소를 생성후 즉시 데이터베이스에 저장
  //build = 새 JavaScript 객체를 생성, 객체를 받은후 직접 저장해야함.
  req.user
    .createProduct({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
  })
    .then(result => {
    // console.log(result)
    console.log('제품이 생성되었습니다.')
    res.redirect('/admin/products')
  })
    .catch(err => {
    console.log(err)
  });

};


//쿼리스트링을 통해 현재 수정중임을 나타낼수 있음.
//부차적 데이터
exports.getEditProduct = (req, res, next) => {
  //추출된 값은 항상 스트링임. "true"
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  req.user
    .getProducts({where: {id: prodId}})
  // Product.findByPk(prodId)
    .then(products => {
      //현재 products 제품들을 확보했으니 하나만 뽑으면 됨. [0] 첫번째 상품
      const product = products[0];
   if(!product) {
     return res.redirect('/');
   }
    res.render('admin/edit-product', {
      pageTitle: '포켓몬 정보 수정',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  }).catch(err => { console.log(err)})
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log("프로덕트아이디",prodId)
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  //지금은 JavaScript 앱에서의 로컬 변경만 이루어지는중.
  //
  Product.findByPk(prodId)
    .then(product => {
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl = updatedImageUrl;
    //이 메서드를 통해 비로소 데이터베이스에 저장되는것.
      //save를 통해 반환된 promise를 리턴시킬수 있고
    return product.save();
  }).then(result => {
    console.log('포켓몬이 수정 되었습니다')
    res.redirect('/admin/products');
  })
    //이 catch는 첫번째 Promise, 두번째 Promise의 오류를 전부 잡아낸다.
    .catch(err => console.log(err))
};


exports.getProducts = (req, res) => {
    req.user
      .getProducts()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: '관리자 메뉴',
        path: '/admin/products'
      });
  })
  .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then(product => {
      return product.destroy();
    })
    .then(result => {
      console.log('포켓몬이 삭제되었습니다.')
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}