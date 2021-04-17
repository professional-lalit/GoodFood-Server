const express = require('express');
const { body, query } = require('express-validator/check');
const recipeController = require('../controllers/RecipeController');
const isAuth = require('../middleware/RequestValidationFilter');
const router = express.Router();

router.post(
  '/create',
  isAuth,
  [
    body('recipeData').exists()
  ],
  recipeController.createRecipe
);

router.put(
    '/update',
    isAuth,
    [
      query('recipeId').trim().not().isEmpty(),
      body('recipeData').exists()
    ],
    recipeController.updateRecipe
);

router.delete(
  '/delete',
  isAuth,
  [
    query('recipeId').trim().not().isEmpty()
  ],
  recipeController.deleteRecipe
);

router.post(
    '/list',
    isAuth,
    [
      body('filter').exists()
    ],
    recipeController.getRecipeList
);

router.get(
  '/details',
  isAuth,
  [
    query('recipeId').not().isEmpty()
  ],
  recipeController.getRecipe
);

router.get(
  '/featured',
  isAuth,
  recipeController.featuredRecipes
);

router.post(
  '/toggleUbuntu',
  isAuth,
  [
    body('ubuntu').exists(),
    query('recipeId').not().isEmpty()
  ],
  recipeController.ubuntuRecipe
);

router.post(
  '/imageUpload',
  isAuth,
  [
    query('recipeId').not().isEmpty()
  ],
  recipeController.uploadRecipeImage
);

router.post(
  '/videoUpload',
  isAuth,
  [
    query('recipeId').not().isEmpty()
  ],
  recipeController.uploadRecipeVideo
);

module.exports = router;