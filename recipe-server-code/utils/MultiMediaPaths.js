const path = require('path');


const getProfileImagePath = (userId) => {
    return path.join(__dirname, '..', '/multimedia', 'profile', 'images', `PROFILE_IMG_${userId}.jpg`);
}

const getProfileVideoPath = (video) => {
    return path.join(__dirname, '..', '/multimedia', 'profile', 'videos', video.name);
}

const getRecipeImagePath = (image) => {
    return path.join(__dirname, '..', '/multimedia', 'recipe', 'images', image.name);
}

const getRecipeVideoPath = (video) => {
    return path.join(__dirname, '..', '/multimedia', 'recipe', 'videos', video.name);
}

module.exports = {
    getProfileImagePath,
    getProfileVideoPath,
    getRecipeImagePath,
    getRecipeVideoPath
}
