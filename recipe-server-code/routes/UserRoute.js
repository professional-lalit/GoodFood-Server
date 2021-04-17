const express = require('express');
const { body, query } = require('express-validator/check');
const userController = require('../controllers/UserController');
const isAuth = require('../middleware/RequestValidationFilter');
const router = express.Router();


router.get(
  '/details',
  isAuth,
  [
    query('userId')
      .not().isEmpty()
  ],
  userController.getUser
);

router.get(
  '/me',
  isAuth,
  userController.getMeUser
);

router.put(
  '/update',
  isAuth,
  [
    body('userId')
      .not().isEmpty()
  ],
  userController.updateUser
);

router.post(
  '/imageUpload',
  isAuth,
  userController.uploadProfileImage
);

router.post(
  '/videoUpload',
  isAuth,
  userController.uploadProfileVideo
);

router.post(
  '/complaint',
  isAuth,
  [
    body('description').not().isEmpty()
  ],
  userController.addComplaint
);

router.post(
  '/payment',
  isAuth,
  [
    body('recipeId').not().isEmpty(),
    body('amount').not().isEmpty().isNumeric()
  ],
  userController.addPayment
);

module.exports = router;

