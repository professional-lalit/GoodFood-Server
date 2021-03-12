const express = require('express');
const { body, query } = require('express-validator/check');
const commentController = require('../controllers/CommentController');
const isAuth = require('../middleware/RequestValidationFilter');
const router = express.Router();


router.post(
  '/add',
  isAuth,
  [
    query('recipeId')
      .not().isEmpty(),
    body('comment')
      .exists()    
  ],
  commentController.addComment
);

router.get(
  '/details',
  isAuth,
  [
    query('commentId')
      .not().isEmpty()
  ],
  commentController.getComment
);

router.get(
    '/list',
    isAuth,
    [
      query('recipeId')
        .not().isEmpty()
    ],
    commentController.getComments
);

router.post(
  '/addReaction',
  isAuth,
  [
    body('recipeId')
      .not().isEmpty(),
    body('commentId')
      .not().isEmpty(),
    body('description')
      .exists()    
  ],
  commentController.addReaction
);

router.delete(
  '/deleteComment',
  isAuth,
  [
    query('commentId').not().isEmpty()
  ],
  commentController.deleteComment
);

router.delete(
  '/deleteReaction',
  isAuth,
  [
    query('commentId').not().isEmpty(),
    query('reactionId').not().isEmpty()
  ],
  commentController.deleteReaction
);

module.exports = router;