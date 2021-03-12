const express = require('express');
const { body } = require('express-validator/check');

const User = require('../entities/UserEntity');
const authController = require('../controllers/AuthController');
const isAuth = require('../middleware/RequestValidationFilter');

const router = express.Router();

router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      })
      .normalizeEmail({gmail_remove_dots: false}),
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('firstName')
      .trim()
      .not()
      .isEmpty(),
    body('lastName')
    .trim()
    .not()
    .isEmpty()
  ],
  authController.signup
);

router.post('/login', authController.login);

router.post('/change-password',
  isAuth,
  [
    body('newPassword')
    .trim()
    .not()
    .isEmpty(),

    body('newPassword')
      .trim()
      .isLength({ min: 5 })
  ],
  authController.changePassword
);

router.post('/forgot-password',
  [
    body('email')
      .trim()
      .not()
      .isEmpty()
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail({gmail_remove_dots: false}),
  ],
  authController.forgotPassword
);

module.exports = router;