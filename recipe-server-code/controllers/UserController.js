const User = require('../entities/UserEntity');
const Complaint = require('../entities/ComplaintEntity');
const Payment = require('../entities/PaymentEntity');
const { fetchUser } = require('../repository/UserRepo');
const { fetchRecipe } = require('../repository/RecipeRepo');
const { getProfileImagePath, getProfileVideoPath } = require('../utils/MultiMediaPaths');
const { isValid } = require('../utils/Utils');

const fs = require('fs');

exports.getUser = async (req, res, next) => {
    if(!isValid(req, next))
        return;
        
    const userId = req.userId;
    try{
        const user = await fetchUser(userId); 
        if (user) {

            const userId = user._id;
            const imageUrl = `http://localhost:8080/profile_images/PROFILE_IMG_${userId}`
            user.imageUrl = imageUrl;
            
            return res.status(200).json({
                message: 'User fetched successfully.',
                user: user
            });
        } else {
            return res.status(400).json({
                message: 'User not found'
            });
        }       
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// userData = {firstName, lastName, address, bio, imageUrl, videoUrl, password, status}
exports.updateUser = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    const userId = req.userId;
    const userData = req.body;

    try {
        const user = await User.findOne({ '_id': userId });
        if (user) {
            user.firstName = userData.firstName;
            user.lastName = userData.lastName;
            user.address = userData.address;
            user.bio = userData.bio;
            user.imageUrl = userData.imageUrl;
            user.videoUrl = userData.videoUrl;

            const updatedUser = await user.save();

            updatedUser.password = undefined;

            return res.status(200).json({
                message: 'User updated successfully',
                updatedUser: updatedUser
            });
        }else{
            return res.status(400).json({
                message: 'User not found'
            });
        }
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.uploadProfileImage = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    const userId = req.userId;
    const image = req.files.profileImage
    const profileImagePath = getProfileImagePath(userId);

    image.mv(profileImagePath, (error) => {
        if (error) {
            next(error);
        }else{
            return res.status(200).json({
                message: 'Profile image uploaded successfully',
                profileImageUrl: `http://localhost:8080/profile_images/${image.name}`
            });
        }
      })
}

exports.uploadProfileVideo = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    const video = req.files.profileVideo
    const profileVideoPath = getProfileVideoPath(video);

     video.mv(profileVideoPath, (error) => {
        if (error) {
            next(error);
        }else{
            return res.status(200).json({
                message: 'Profile video uploaded successfully',
                profileVideoUrl: `http://localhost:8080/profile_videos/${video.name}`
            });
        }
      })
}

exports.addComplaint = async (req, res, next) =>{
    if(!isValid(req, next))
        return;

    const userId = req.userId;
    const description = req.body.description;
    try{
        const user = await fetchUser(userId); 
        if (user) {
            const complaint = new Complaint();
            complaint.userId = userId;
            complaint.description = description;
            await complaint.save();
            return res.status(200).json({
                message: 'Complaint registered',
                complaint: complaint
            });
        } else {
            return res.status(400).json({
                message: 'User not found'
            });
        }       
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.addPayment = async (req, res, next) =>{
    const userId = req.userId;
    const recipeId = req.body.recipeId;
    const price = req.body.price;

    try{
        const user = await fetchUser(userId); 
        const recipe = await fetchRecipe(recipeId); 
        if (!user) {                        
            return res.status(400).json({
                message: 'User not found'
            });
        } else if (!recipe) {
            return res.status(400).json({
                message: 'Recipe not found'
            });
        } else {
            const payment = new Payment();
            payment.payerId = userId;
            payment.recipeId = recipeId;
            payment.price = price;
            await payment.save();
            return res.status(200).json({
                message: 'Payment successfull',
                paymentDetails: payment
            });
        }              
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

