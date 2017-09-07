const express = require('express');
const Twit = require('twit');
const config = require('../config.js');
const T = new Twit(config);



T.get('search/tweets', { count: 5 }, function(err, data, response) {
  console.log(data)
})

const app = express();

app.set('view engine','pug');
app.use(express.static('static'));
app.get('/',(req,res)=>{
    res.render('index');
});


app.listen(3000,()=>{
	console.log('the app is running');
});

