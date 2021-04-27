const Recipe = require('../entities/RecipeEntity');
const Video = require('../entities/VideoEntity');
const { getAvgRatingFromCommentsOfRecipe } = require('./CommentRepo');

const fetchRecipe = async (recipeId) => {
    try{
        let recipe = await Recipe.findOne({ _id: recipeId });
        console.log('fetched recipe details', recipe);
        return recipe;
    }catch(err){
        return undefined;
    }    
}

const fetchRecipesByFilter = async (title, priceRange, avgRatingRange, creator) => {
    let filter;
    if(creator){
        filter = {
            title: { "$regex": title },
            price: { $gte: priceRange.lowEnd || 0, $lte: priceRange.highEnd || 1000000000 },
            avgRating: { $gte: avgRatingRange.lowEnd || 0, $lte: avgRatingRange.highEnd || 5 },
            creatorId: creator || undefined
        }
    }else{
        filter = {
            title: { "$regex": title },
            price: { $gte: priceRange.lowEnd || 0, $lte: priceRange.highEnd || 1000000000 },
            avgRating: { $gte: avgRatingRange.lowEnd || 0, $lte: avgRatingRange.highEnd || 5 }
        }
    } 
    //get the latest first
    return await Recipe.find(filter).sort({ createdAt: -1 });         
}

const setUbuntuCount = (recipes) => {
    const modifiedRecipes = [];
    for(const recipe of recipes){
        const modifiedRecipe = recipe.toJSON();
        if(modifiedRecipe.ubuntuList != null){
            modifiedRecipe.likeCount = modifiedRecipe.ubuntuList.filter(function(ubuntu) {
                return ubuntu.ubuntuType == 'like';
            }).length;
            modifiedRecipe.smileyCount = modifiedRecipe.ubuntuList.filter(function(ubuntu) {
                return ubuntu.ubuntuType == 'smiley';
            }).length;
            modifiedRecipe.prayerCount = modifiedRecipe.ubuntuList.filter(function(ubuntu) {
                return ubuntu.ubuntuType == 'prayer';
            }).length;
        }
        delete modifiedRecipe.ubuntuList;
        modifiedRecipes.push(modifiedRecipe);
    }
    return modifiedRecipes;
}

const setUbuntuCountForSingleRecipe = (recipe) => {
    const modifiedRecipe = recipe.toJSON();
    if(modifiedRecipe.ubuntuList != null){
        modifiedRecipe.likeCount = modifiedRecipe.ubuntuList.filter(function(ubuntu) {
            return ubuntu.ubuntuType == 'like';
        }).length;
        modifiedRecipe.smileyCount = modifiedRecipe.ubuntuList.filter(function(ubuntu) {
            return ubuntu.ubuntuType == 'smiley';
        }).length;
        modifiedRecipe.prayerCount = modifiedRecipe.ubuntuList.filter(function(ubuntu) {
            return ubuntu.ubuntuType == 'prayer';
        }).length;
    }
    delete modifiedRecipe.ubuntuList;
    return modifiedRecipe;
}

const fetchFeaturedRecipes = async () => {
    //get the latest first
    const recipes = await Recipe.find({ isFeatured: true }).sort({ createdAt: -1 });
    console.log('fetched featured recipes: ', recipes);
    return setUbuntuCount(recipes);
}

const addRecipe = async (creator, recipeData) => {
    const recipe = new Recipe(recipeData);
    delete recipeData.avgRating;
    delete creator.password;
    recipe.creator = creator;
    console.log("after recipe created, creatorId: ",recipe.creatorId);
    return await recipe.save();
}

const addRecipeVideo = async (creator, thumbUrl, url, title) => {
    const video = new Video();
    video.creator = creator;
    video.thumbUrl = thumbUrl;
    video.url = url;
    video.title = title;
    console.log("after recipe created, creatorId: ",video.creatorId);
    return await video.save();
}

const updateRecipe = async (recipeId, recipeData, video) => {
    const { title, description, price, imageUrls} = recipeData;
    const recipe = await fetchRecipe(recipeId);

    if(recipe){
        recipe.title = title;
        recipe.description = description;
        recipe.price = price;
        recipe.imageUrls = imageUrls;
        
        if(!recipe.videos){
            recipe.videos = [];
        }
        recipe.videos.push(video);

        console.log("after recipe update, creatorId: ",recipe.creator);
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
        recipe.avgRating = await getAvgRatingFromCommentsOfRecipe(recipeId);
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

const populateRecipeWithCreator = async (recipe) => {
    await recipe.populate({
      path: 'creator',
      model: 'User',
    }).execPopulate();
    return recipe;
}

exports.fetchRecipe = fetchRecipe;
exports.addCommentOnRecipe = addCommentOnRecipe;
exports.addRecipe = addRecipe;
exports.addRecipeVideo = addRecipeVideo;
exports.updateRecipe = updateRecipe;
exports.deleteRecipe = deleteRecipe;
exports.fetchRecipesByFilter = fetchRecipesByFilter;
exports.populateRecipeWithCommentsAndReactions = populateRecipeWithCommentsAndReactions;
exports.populateRecipeWithCreator = populateRecipeWithCreator;
exports.fetchFeaturedRecipes = fetchFeaturedRecipes;
exports.setUbuntuCountForSingleRecipe = setUbuntuCountForSingleRecipe;
exports.setUbuntuCount = setUbuntuCount;