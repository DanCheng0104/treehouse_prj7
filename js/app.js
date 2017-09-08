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
    paras.profile_image_url = result.data.profile_image_url;
    paras.friends_count = result.data.friends_count;
    paras.followers_count = result.data.followers_count;

        		// t_content['profile_image_url'] = t['user']['profile_image_url'];
    T.get('statuses/user_timeline', { screen_name: paras.screen_name , count: 5})
      .catch(function (err) {
    console.log('caught error', err.stack)
  })
  .then(function (result){
    	paras.tweets=[];
    	// console.log(result.data);
    	result.data.forEach(t=>{
    		const t_content = {};

    		t_content['created_at'] = t['created_at'];
    		t_content['text'] = t['text'];
    		t_content['retweet_count'] = t['retweet_count'];
    		t_content['favorite_count'] = t['favorite_count'];
    		paras.tweets.push(t_content);

    	})
    	T.get('friends/list',{count:1})
    	.catch(function (err) {
    		console.log('caught error', err.stack)
  		})
  		.then(function(result){
  			console.log(result.data.users);
  			//name,screen_name,profile_background_image_url
  		});
	 //    app.get('/',(req,res)=>{
		// res.render('index',paras);
	 //   });
  });

  })


	 //    app.get('/',(req,res)=>{
		// res.render('index',{ screen_name: paras.screen_name});
	 //   });
app.listen(3000,()=>{
	console.log('the app is running');
});