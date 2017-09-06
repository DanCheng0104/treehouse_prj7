const express = require('express');
const config = require('../config.js');
const Twit = require('twit');
const T = new Twit(config);

const app = express();

app.listen(3000);

