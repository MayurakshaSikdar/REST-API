const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedController = require('./routes/feed');

const MONGODB_URI =
    'mongodb+srv://Mayuraksha:Sunnytonny1@cluster0-jyoeh.mongodb.net/messages?retryWrites=true&w=majority';

const app = express();



app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedController);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({
        message: message
    });
})

mongoose.connect(MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(result => {
        app.listen(8080);
        console.log('CONNECTED');
    })
    .catch(err => {
        console.log(err);
    });