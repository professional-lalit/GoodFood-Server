const Recipe = require('../entities/RecipeEntity');

const fetchRecipe = async (recipeId) => {
    try{
        let recipe = await Recipe.findOne({ _id: recipeId });
        console.log('fetched recipe details', recipe);
        return recipe;
    }catch(err){
        return undefined;
    }    
}

const fetchRecipesByCreator = async (creatorId) => {
    try{
        let recipes = await Recipe.find({ creatorId: creatorId });
        console.log('fetched recipe details', recipe);
        return recipes;
    }catch(err){
        return undefined;
    }    
}

const fetchRecipesByFilter = async (title, priceRange, avgRatingRange, creator) => {
    const filter = {
        title: { "$regex": title },
        price: { $gte: priceRange.lowEnd || 0, $lte: priceRange.highEnd || 1000000000 },
        avgRating: { $gte: avgRatingRange.lowEnd || 0, $lte: avgRatingRange.highEnd || 5 },
        creatorId: creator
    }
    return await Recipe.find(filter);    
}

const addRecipe = async (creator, recipeData) => {
    const recipe = new Recipe(recipeData);
    recipe.creatorId = creator;
    console.log("after recipe created, creatorId: ",recipe.creatorId);
    return await recipe.save();
}

const updateRecipe = async (recipeId, recipeData) => {
    const { title, description, price, imageUrls, videoUrl, avgRating} = recipeData;
    const recipe = await fetchRecipe(recipeId);

    if(recipe){
        recipe.title = title;
        recipe.description = description;
        recipe.price = price;
        recipe.imageUrls = imageUrls;
        recipe.videoUrl = videoUrl;
        recipe.avgRating = avgRating;
        console.log("after recipe update, creatorId: ",recipe.creatorId);
        return await recipe.save();
    }
    return undefined;
}

const deleteRecipe = async (recipeId) => {
    return await Recipe.findByIdAndDelete(recipeId);
}

const addCommentOnRecipe = async (recipeId, comment) => {
    let recipe = await fetchRecipe(recipeId);   
    if(recipe){ 
        recipe.comments.push(comment);
        let updatedRecipe = await recipe.save();
        return updatedRecipe;
    }
    return undefined;
}

const populateRecipeWithCommentsAndReactions = async (recipe) => {
    await recipe.populate({
      path: 'comments',
      model: 'Comment',
      populate: [
          {
              path: 'reactions',
              model: 'Reaction',
              populate: [
                  {
                      path: 'reactions',
                      model: 'Reaction',
                      populate: [
                        {
                            path: 'reactions',
                            model: 'Reaction',
                        },
                        {
                            path: 'reactor',
                            model: 'User',
                        }
                      ]                        
                  },
                  {
                      path: 'reactor',
                      model: 'User',
                  }
              ]
          },
          {
              path: 'reactor',
              model: 'User',
          }
      ]
    })
    .populate('commentator')
    .execPopulate();
  
    return recipe;
  }

exports.fetchRecipe = fetchRecipe;
exports.addCommentOnRecipe = addCommentOnRecipe;
exports.addRecipe = addRecipe;
exports.updateRecipe = updateRecipe;
exports.deleteRecipe = deleteRecipe;
exports.fetchRecipesByFilter = fetchRecipesByFilter;
exports.populateRecipeWithCommentsAndReactions = populateRecipeWithCommentsAndReactions;