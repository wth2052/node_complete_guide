const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  res.render('admin/edit-product', {
    pageTitle: '포켓몬 추가',
    path: '/admin/add-product',
    editing: false,
  });
};


exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(
    {
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      //생성할때는 userId를 저장해주어야 한다, 생성자로 전달하는 필드의 객체로 userId를 추가해주면 됨
      //.id도 가능 아래와 같이 저장하면 user 객체 그 자체
      //DB에 진짜 쓴사람이 저장이된다! 신기
      userId: req.user
    }
    //콜론의 오른쪽이 컨트롤러에서 받는 데이터
    // 왼쪽이 스키마에서 정의한 키를 의미
  );
  product
    .save()
    //프로미스를 받지는 않지만 몽구스에서 then, catch를 지원해준다!!!
    .then(result => {
      console.log('포켓몬이 성공적으로 등록되었습니다.');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
 Product.findById(prodId)
    // Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findById(prodId).then(product => {
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl = updatedImageUrl;

    return product.save()
  })
    .then(result => {
      console.log('포켓몬이 정상적으로 업데이트 되었습니다.');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    //이처럼 products가 들어간 then에서 제품들을 loop한후 findbyId 등.. 받은 ID로 사용자를 가져오는 쿼리를 입력해주면되긴 하는데 좀 번거롭다
    //find 다음에 populate 라는 메서드를 붙일수있다.
    //이는 Mongoose에게 특정 필드에 ID뿐만 아니라
    //모든 세부 정보를 채우도록 알리는 기능을 가지고있다.
    //.select('title price -_id')

    //.populateo('userId')
    //2번째 인자에 'name'를 전달하면 이름을 가져오겠다는 문자열이 됨.
    //ID는 명시안해두면 항상 검색함.
    //실제로는 애플리케이션을 멈추게한다.
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndDelete(prodId)
    .then(() => {
      console.log('포켓몬이 정상적으로 삭제되었습니다.');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};