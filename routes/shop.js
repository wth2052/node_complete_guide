
//동적 세그먼트와 특정 라우트가 있으면 구체적인 라우트를 앞에 둘것. 예 ) /products/delete
// /products/delete에 매칭되지 않는 다른 대상이 있다면 이 동적 라우트로 들어가게 됨.

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct)

router.get('/orders', shopController.getOrders);

router.get('/checkout', shopController.getCheckout);


module.exports = router;