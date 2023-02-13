const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
<<<<<<< HEAD
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);
=======
const isAuth = require('../middleware/is-auth')

const router = express.Router();

// // /admin/add-product => GET
// // use = 전부 사용하겠다
router.get('/add-product', isAuth,adminController.getAddProduct);
//
// // /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);
//
// // /admin/add-product => POST
router.post('/add-product',isAuth, adminController.postAddProduct);
//
router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);
>>>>>>> d1f94ccd1ff26aeb6ba94bd4a0c5755feb157a58

// /admin/add-product => POST
router.post(
  '/add-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
