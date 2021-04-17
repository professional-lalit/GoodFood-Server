const { validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var generator = require('generate-password');
var nodemailer = require('nodemailer');
const { isValid } = require('../utils/Utils');

const User = require('../entities/UserEntity');
const { fetchUserByEmail, updatePassword, fetchUser } = require('../repository/UserRepo');

exports.signup = async (req, res, next) => {
    if(!isValid(req, next))
    return;

    const { email, mobile, firstName, lastName, password, bio, imageUrl, videoUrl } = req.body;

    try{
      const hashedPassword = await bcrypt.hash(password, 12);      
      const user = new User({
          email: email,
          password: hashedPassword,
          firstName: firstName,
          lastName: lastName,
          mobile: mobile,
          bio: bio,
          imageUrl: imageUrl,
          videoUrl: videoUrl
      });
      let result = await user.save();
      console.log(result);

      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString()
        },
        'somesupersecretsecret',
        { expiresIn: '24h' }
      );

      res.status(201).json({ message: 'User created!', userId: result._id, token: token });
    }catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

exports.login = async (req, res, next) => {
          const { email, password } = req.body;      

          const user = await fetchUserByEmail(email);
          if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 400;
            next(error);
            return;
          }
          
          try {
              const isPasswordValid = await bcrypt.compare(password, user.password);
              if (!isPasswordValid) {
                  const error = new Error('Wrong password!');
                  error.statusCode = 401;
                  next(error);
                  return;
              }
              const token = jwt.sign(
                {
                  email: user.email,
                  userId: user._id.toString()
                },
                'somesupersecretsecret',
                { expiresIn: '24h' }
              );
              res.status(200).json({ token: token, userId: user._id.toString() });
          } catch(err){
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
          }

};

exports.changePassword = async (req, res, next) => {
  const userId = req.userId;
  const { password, newPassword } = req.body;

  console.log("old pwd revd: " + password + ", new_pwd recvd: " + newPassword);

  const user = await fetchUser(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 400;
    next(error);
    return;
  }

  try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          const error = new Error('Wrong password!');
          error.statusCode = 401;
          next(error);
          return;
      }
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString()
        },
        'somesupersecretsecret',
        { expiresIn: '24h' }
      );
      const isUpdated = await updatePassword(user, newPassword);
      if (isUpdated) {
        res.status(200).json({ message: 'Password changed successfully!', userId: user._id });
      } else {
        res.status(500).json({ message: 'Unable to changed password', userId: user._id });
      }
  } catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
  }


}

exports.forgotPassword = async (req, res, next) => {
  const email = req.body.email;

  console.log(`email recvd: ${email}`);

  var newPassword = generator.generate({
    length: 10,
    numbers: true
  });

  console.log(newPassword);

  try{
      const user = await fetchUserByEmail(email);
      if(user){
          const isUpdated = await updatePassword(user, newPassword);
          if(isUpdated){
              sendEmail(user.email, newPassword);
              res.status(200).json({ message: 'An email has been sent regarding new password', userId: user._id });
          }else{
              res.status(200).json({ message: 'Unable to change password', userId: user._id });
          }
      }else{
          const error = new Error('A user with this email could not be found.');
          error.statusCode = 400;
          throw error;
      }
  }catch(err){
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
}


function sendEmail(email, newPassword) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PWD
        }
    });

    var mailOptions = {
        name: 'com.goodfood',
        from: 'Good Food',
        to: email,
        subject: 'Password Recovery',
        text: 'You have successfully changed your password. Your new temporary password is ' + newPassword
          + '\nPlease enter this password in Old Password field while changing password'
    };

    console.log('sending email to: ',`${mailOptions.to}`);

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}