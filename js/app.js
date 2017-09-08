const express = require('express');
const Twit = require('twit');
const config = require('../config.js');
const T = new Twit(config);
const app = express();
app.set('view engine','pug');
app.use(express.static('static'));
const paras = {};

T.get('account/verify_credentials', { skip_status: true })
  .catch(function (err) {
    console.log('caught error', err.stack)
  })
  .then(function (result) {
    // `result` is an Object with keys "data" and "resp".
    // `data` and `resp` are the same objects as the ones passed
    // to the callback.
    // See https://github.com/ttezel/twit#tgetpath-params-callback
    // for details.
    paras.name = result.data.name;
    paras.screen_name = result.data.screen_name;
    T.get('statuses/user_timeline', { screen_name: paras.screen_name , count: 5 })
      .catch(function (err) {
    console.log('caught error', err.stack)
  })
  .then(function (result){
    	paras.tweets=[];
    	result.data.forEach(t=>{
    		const t_content = {};
    		t_content['text'] = t['text'];
    		t_content['retweet_count'] = t['retweet_count'];
    		t_content['favorite_count'] = t['favorite_count'];
    		paras.tweets.push(t_content);

    	})
    	   console.log(paras);
  });

 //    T.get('statuses/user_timeline', { screen_name: paras.screen_name , count: 5 }, function(err, data, response) {
 //    	paras.tweets=[];
 //    	data.forEach(t=>{
 //    		const t_content = {};
 //    		t_content['text'] = t['text'];
 //    		t_content['retweet_count'] = t['retweet_count'];
 //    		t_content['favorite_count'] = t['favorite_count'];
 //    		paras.tweets.push(t_content);

 //    	})
 //    	   console.log(paras);
	// });
  })




// app.get('/',(req,res)=>{
//     res.render('index');
// });


app.listen(3000,()=>{
	console.log('the app is running');
});

