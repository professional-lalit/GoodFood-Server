const Comment = require('../entities/CommentEntity');
const { fetchReactionsByComment, deleteReaction } = require('../repository/ReactionRepo');

const addComment = async (recipeId, userId, commentObj) => {
    const comment = new Comment({
        recipeId: recipeId,
        commentator: userId,
        description: commentObj.description,
        rating: commentObj.rating
      });

    let result = await comment.save();
    return result;
}

const fetchComment = async (commentId) => {
  let result = await Comment.findOne( { _id: commentId } )
  console.log('fetched comment: ',result);
  return result;
}

const fetchCommentsByRecipe = async (recipeId) => {
  let result = await Comment.find( { recipeId: recipeId } )
  console.log('fetched comments: ',result);
  return result;
}

const populateCommentWithReactions = async (comment) => {
  await comment.populate({
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
                    populate: {
                        path: 'reactor',
                        model: 'User',
                    }
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

  return comment;
}

const deleteComment = async (commentId) => {  
  //check for reactions and delete them first
  const reactions = await fetchReactionsByComment(commentId);
  for(const reaction of reactions){
    await deleteReaction(reaction._id);
  }
  return await Comment.findByIdAndDelete(commentId);
}

exports.addComment = addComment;
exports.fetchComment = fetchComment;
exports.populateCommentWithReactions = populateCommentWithReactions;
exports.fetchCommentsByRecipe = fetchCommentsByRecipe;
exports.deleteComment = deleteComment;