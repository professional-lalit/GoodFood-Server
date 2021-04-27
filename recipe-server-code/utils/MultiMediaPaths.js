const path = require('path');


const getProfileImagePath = (userId) => {
    return path.join(__dirname, '..', '/multimedia', 'profile', 'images', `PROFILE_IMG_${userId}.jpg`);
}

const getProfileVideoPath = (video) => {
    return path.join(__dirname, '..', '/multimedia', 'profile', 'videos', video.name);
}

const getProfileVideoThumbPath = (image) => {
    return path.join(__dirname, '..', '/multimedia', 'profile',
     'videos', 'thumbnails', image.name);
}

const getRecipeImagePath = (image) => {
    return path.join(__dirname, '..', '/multimedia', 'recipe', 'images', image.name);
}

const getRecipeVideoPath = (video) => {
    return path.join(__dirname, '..', '/multimedia', 'recipe', 'videos', video.name);
}

const getRecipeVideoThumbPath = (image) => {
    return path.join(__dirname, '..', '/multimedia', 'recipe',
     'videos', 'thumbnails', image.name);
}

module.exports = {
    getProfileImagePath,
    getProfileVideoPath,
    getRecipeImagePath,
    getRecipeVideoPath,
    getRecipeVideoThumbPath
}
