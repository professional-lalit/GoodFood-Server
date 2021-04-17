//Load HTTP module
const http = require("http");
const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const fileupload = require('express-fileupload');

const authRoutes = require('./routes/AuthRoute');
const userRoutes = require('./routes/UserRoute');
const recipeRoutes = require('./routes/RecipeRoute');
const commentRoutes = require('./routes/CommentRoute');
const isAuth = require('./middleware/RequestValidationFilter');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

dotenv.config();

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.json());
app.use(fileupload());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/profile_images', [ isAuth, express.static(path.join(__dirname, 'multimedia/profile/images')) ]);
app.use('/profile_videos', [ isAuth, express.static(path.join(__dirname, 'multimedia/profile/videos')) ]);

app.use('/recipe_images', [ express.static(path.join(__dirname, 'multimedia/recipe/images')) ]);
app.use('/recipe_videos', [ isAuth, express.static(path.join(__dirname, 'multimedia/recipe/videos')) ]);

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/recipe', recipeRoutes);
app.use('/comment', commentRoutes);


app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(result => {
    app.listen(process.env.PORT || 8080)
  })
  .catch(
    err =>console.log(err)
  );