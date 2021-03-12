const User = require('../entities/UserEntity');
const bcrypt = require('bcrypt');

const fetchUser = async (userId) => {
    let user = await User.findOne({ _id: userId });
    console.log('user details', user);
    return user;
}

const fetchUserByEmail = async (email) => {
    let user = await User.findOne({ email: email });
    console.log('user details', user);
    return user;
}

const updatePassword = async (loadedUser, newPassword) => {
    var pwdHash = await bcrypt.hash(newPassword, 12);
    if (pwdHash != null) {
        loadedUser.password = pwdHash;
        var isSaved = await loadedUser.save();
        return isSaved;
    }
    return false;
}

exports.fetchUser = fetchUser;
exports.fetchUserByEmail = fetchUserByEmail;
exports.updatePassword = updatePassword;