const Comment = require('../entities/CommentEntity');
const { fetchRecipe, addCommentOnRecipe } = require('../repository/RecipeRepo');
const { addComment, fetchComment, populateCommentWithReactions, fetchCommentsByRecipe, deleteComment } = require('../repository/CommentRepo');
const { fetchReaction } = require('../repository/ReactionRepo');
const Reaction = require('../entities/ReactionEntity');
const { isValid } = require('../utils/Utils');

exports.getComment = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    let commentId = req.query.commentId;
    const comment = await fetchComment(commentId);
    if (comment) {
        const modifiedComment = await populateCommentWithReactions(comment);
        return res.status(200).json({
            message: 'Comment fetched successfully.',
            comment: modifiedComment
        });
    } else {
        return res.status(400).json({
            comment: 'Comment not found'
        });
    }          
}

exports.getComments = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    let recipeId = req.query.recipeId;

    try{
        const comments = await fetchCommentsByRecipe(recipeId);
        if (comments) {
            let modifiedCommentList = [];

            for (const comment of comments){
                const modifiedComment = await populateCommentWithReactions(comment);
                modifiedCommentList.push(modifiedComment); 
            }
          
            return res.status(200).json({
                message: 'Comments fetched successfully.',
                list: modifiedCommentList
            });
        } else {
            return res.status(400).json({
                message: 'Comments not found for this recipe'
            });
        }
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);    
    }


}

// Comment Request --> { recipeId: "ABC", comment: {rating: 2, description: "Lorem Ipsum" }}
exports.addComment = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    let recipeId = req.query.recipeId;
    let commentObj = req.body.comment;
    let userId = req.userId;

    try{
        let comment = await addComment(recipeId, userId, commentObj);
        let recipe = await addCommentOnRecipe(recipeId, comment);
        return res.status(200).json({
            message: 'Comment added successfully.',
            recipeId: recipe._id,
            commentId: comment._id
        });
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.addReaction = async (req, res, next) => {
    if(!isValid(req, next))
        return;

    const commentId = req.body.commentId;
    const reactorId = req.userId;
    const description = req.body.description || '';
    const imageUrl = req.body.imageUrl || '';
    const parentReactionId = req.body.parentReactionId || null;

    let reaction;
    let reactionObj;
    try {        
        if(parentReactionId){
            const parentReaction = await fetchReaction(parentReactionId);

            if(!parentReaction){
                return res.status(200).json({
                    message: 'parent reaction not found.'
                });
            }

            reaction = new Reaction({
                commentId: commentId,
                reactor: reactorId,
                description: description,
                imageUrl: imageUrl
            });
            reactionObj = await reaction.save(); 
            console.log('parent reaction: ',parentReaction); 
            parentReaction.reactions.push(reactionObj);
            await parentReaction.save();
        } else {
            reaction = new Reaction({
                commentId: commentId,
                reactor: reactorId,
                description: description,
                imageUrl: imageUrl
            });        
            reactionObj = await reaction.save();            
            const comment = await fetchComment(commentId);
            comment.reactions.push(reactionObj);
            await comment.save();    
        }   

        return res.status(200).json({
            message: 'Reaction added successfully',
            reaction: reactionObj
        });

    } catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteComment = async (req, res, next) => {
    if(!isValid(req, next))
        return;
    
    const commentId = req.query.commentId;
    const recipeId = req.query.recipeId;

    try{    
        const commentatorId = req.userId;
        const comment = await fetchComment(commentId);
        const recipe = await fetchRecipe(recipeId);

        if(comment == null){
            return res.status(400).json({
                message: 'Comment not found'
            });
        }

        if(comment.commentator._id == commentatorId){
            if(recipe){
                const index = recipe.comments.indexOf(comment);
                recipe.comments.splice(index, 1);
                await recipe.save();
            }
            //delete
            const deletedComment = await deleteComment(comment._id);
            return res.status(200).json({
                message: 'Comment deleted',
                deletedComment: deletedComment
            });
        }else{
            return res.status(400).json({
                message: 'You are not allowed to delete this comment'
            });
        }
    }catch(err){
        next(err);
    }
}

exports.deleteReaction = async (req, res, next) => {
    if(!isValid(req, next))
        return;
    
    const commentId = req.query.commentId || undefined;
    const reactionId = req.query.reactionId;
    const parentReactionId = req.query.parentReactionId || undefined;

    try{    
        
        const reaction = await fetchReaction(reactionId);
        if(!reaction){
            return res.status(400).json({
                message: 'Reaction not found'
            });
        }

        //first delete the entry from parent entity (reaction OR comment)
        if(parentReactionId){
            const parentReaction = await fetchReaction(parentReactionId);
            const index = parentReaction.reactions.indexOf(reaction);
            parentReaction.reactions.splice(index, 1);
            await parentReaction.save();
        }else if(commentId){
            const comment = await fetchComment(commentId);
            const index = comment.reactions.indexOf(reaction);
            comment.reactions.splice(index, 1);
            await comment.save();
        }

       const deletedReaction = await Reaction.findByIdAndDelete(reactionId);
       if(deletedReaction){            
            return res.status(200).json({
                message: 'Reaction deleted',
                deletedReaction: deletedReaction
            });
       }else{
            return res.status(400).json({
                message: 'Reaction not found'
            });
       }

    }catch(err){
        next(err);
    }
    

}

