const Reaction = require('../entities/ReactionEntity');

const fetchReaction = async (reactionId) => {
    let reaction = await Reaction.findOne({_id: reactionId});
    console.log('reaction fetched: ', reaction);
    return reaction;
}

const fetchReactionsByComment = async (commentId) => {
    let reactions = await Reaction.find({commentId: commentId});
    console.log('reactions fetched: ', reactions);
    return reactions;
}


const deleteReaction = async (reactionId) => {
    const reaction = await Reaction.findByIdAndDelete(reactionId);
    return reaction;
}

exports.fetchReaction = fetchReaction;
exports.fetchReactionsByComment = fetchReactionsByComment;
exports.deleteReaction = deleteReaction;

