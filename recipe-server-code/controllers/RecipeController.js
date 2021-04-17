const Recipe = require('../entities/RecipeEntity');
const { fetchUser } = require('../repository/UserRepo');
const { 
        fetchRecipe, addRecipe, 
        updateRecipe, deleteRecipe, fetchRecipesByFilter,
        populateRecipeWithCommentsAndReactions, 
        setUbuntuCountForSingleRecipe,
        setUbuntuCount,
        fetchFeaturedRecipes 
      } = require('../repository/RecipeRepo');
const { getRecipeImagePath, getRecipeVideoPath } = require('../utils/MultiMediaPaths');
const { isValid } = require('../utils/Utils');

exports.getRecipe = async (req, res, next) => {
    if(!isValid(req, next))
        return;
    const recipeId = req.query.recipeId;
    const userId = req.userId;
    try{
        let recipe = await fetchRecipe(recipeId);

        if (recipe) {
            recipe = await populateRecipeWithCommentsAndReactions(recipe);   
            recipe = setUbuntuCountForSingleRecipe(recipe);         
            return res.status(200).json({
                message: 'Recipe fetched successfully.',
                recipe: recipe
            });
        } else {
            return res.status(400).json({
                message: 'Recipe not found'
            });
        }
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// filter criteria -> {title, price [range], avgRating [range], creatorId}
//filter object in request body -> { 
    // filter: { 
    //     title:"", 
    //     priceRange: {lowEnd: 0, highEnd: 10},
    //     avgRatingRange: {lowEnd: 0, highEnd: 10},
    //     creatorId: 604278386826e60792677ca0
    // }
// }
exports.getRecipeList = async (req, res, next) => {
    if(!isValid(req, next))
    return;

    const title = req.body.filter.title || "";
    const priceRange = req.body.filter.priceRange || {};
    const avgRatingRange = req.body.filter.avgRatingRange || {};
    const creatorId = req.body.filter.creatorId || null;

    try{
        let user = await fetchUser(creatorId);
        let recipes = await fetchRecipesByFilter(title, priceRange, avgRatingRange, user);
        if (recipes) {
            for(let recipe of recipes){
                recipe = await populateRecipeWithCommentsAndReactions(recipe);  
            }
            recipes = setUbuntuCount(recipes);
            return res.status(200).json({
                message: 'Recipe list fetched successfully.',
                list: recipes
            });
        } else {
            return res.status(200).json({
                message: 'No recipes found'
            });
        }
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

//  recipeData = { title: String, description: String, price: Number, imageUrls: [String],
//               videoUrl: String, creatorId: ObjectId, avgRating: Number }
exports.updateRecipe = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    const recipeId = req.query.recipeId;
    const recipeData = req.body.recipeData;
    console.log('recipeId recvd', recipeId);
    try{
        const recipe = await updateRecipe(recipeId, recipeData);
        if (recipe) {
            return res.status(200).json({
                message: 'Recipe updated successfully'
            });
        }else{
            return res.status(200).json({
                message: 'Recipe not found'
            });
        }
    }catch(err){
        next(err);
    };
}

//  recipeData = { title: String, description: String, price: Number, imageUrls: [String],
//               videoUrl: String, creatorId: ObjectId, avgRating: Number }
exports.createRecipe = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    const recipeData = req.body.recipeData;
    const userId = req.userId;
    try{      
        console.log('userId: ',userId);
        const creator = await fetchUser(userId);
        const recipe = await addRecipe(creator, recipeData);
        console.log('recipe created: ',recipe);
        res.status(201).json({ message: 'Recipe created!', recipeId: recipe._id });                                 
    }catch(err){
        next(err);
    }
}

exports.ubuntuRecipe = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    let recipeId = req.query.recipeId;
    let ubuntu = req.body.ubuntu;
    let userId = req.userId;

    try{
        let recipe = await fetchRecipe(recipeId);
        let user = await fetchUser(userId);        
        let commentUser = recipe.ubuntuList.find((ubuntuObj)=>{ 
            return ubuntuObj.userId == userId && ubuntuObj.ubuntuType == ubuntu 
        });
        
        if(commentUser){
            let index = recipe.ubuntuList.indexOf(commentUser);
            if(index != -1){
                recipe.ubuntuList.splice(index, 1);
                await recipe.save();
                return res.status(200).json({
                    message: 'Ubuntu removed',
                    recipeId: recipe._id                  
                });
            }
        }else{
            let ubuntuObj = {
                userId: user,
                ubuntuType: ubuntu
            }
            recipe.ubuntuList.push(ubuntuObj);
            await recipe.save();
            return res.status(200).json({
                message: 'Ubuntu added',
                recipeId: recipe._id                
            });
        }        
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};

exports.uploadRecipeImage = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    const image = req.files.recipeImage;
    const recipeId = req.query.recipeId;
    const recipeImagePath = getRecipeImagePath(image);
    let recipe = await fetchRecipe(recipeId);

    image.mv(recipeImagePath, (error) => {
        if (error) {
            next(error);
        }else{
            const url = `http://localhost:8080/recipe_images/${image.name}`;
            if(!recipe.imageUrls){
                recipe.imageUrls = [];        
            }
            recipe.imageUrls.push(url);
            updateRecipe(recipeId, recipe);
            return res.status(200).json({
                message: 'Recipe image uploaded successfully',
                recipeImageUrl: url
            });
        }
      })
}

exports.uploadRecipeVideo = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    const video = req.files.recipeVideo;
    const recipeId = req.query.recipeId;
    const recipeVideoPath = getRecipeVideoPath(video);
    let recipe = await fetchRecipe(recipeId);

     video.mv(recipeVideoPath, (error) => {
        if (error) {
            next(error);
        }else{
            const url = `http://localhost:8080/recipe_videos/${video.name}`;
            if(!recipe.videoUrls){
                recipe.videoUrls = [];        
            }
            recipe.videoUrls.push(url);
            updateRecipe(recipeId, recipe);
            return res.status(200).json({
                message: 'Recipe video uploaded successfully',
                recipeVideoUrl: url
            });
        }
      })
}

exports.deleteRecipe = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    const recipeId = req.query.recipeId;

    try{

        const recipe = await fetchRecipe(recipeId);
        if(recipe == null){
            return res.status(400).json({
                message: 'Recipe not found'                
            });
        }

        const deletedRecipe = await deleteRecipe(recipe);
        if(deletedRecipe){
            return res.status(200).json({
                message: 'Recipe deleted',
                deletedRecipe: deletedRecipe
            });
        }else{
            return res.status(200).json({
                message: 'Recipe delete failed'                
            });
        }
    }catch(err){
        next(err);
    }
}

exports.featuredRecipes = async (req, res, next) => {
    if(!isValid(req, next))
    return;

    try{
        const recipes = await fetchFeaturedRecipes();
        if(recipes == null){
            return res.status(200).json({
                message: 'No featured recipes for now'                
            });
        }

        return res.status(200).json({
            message: 'featured recipes fetched successfully',
            recipes: recipes                
        });
    }catch(err){
        next(err);
    }
}


