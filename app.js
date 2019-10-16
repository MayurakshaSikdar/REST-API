const express = require('express');

const feedController = require('./routes/feed');

const app = express();

app.use('/feed', feedController);

app.listen(8000);
console.log('CONNECTED');