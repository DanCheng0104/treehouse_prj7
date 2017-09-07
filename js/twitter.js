const Twit = require('twit');
const config = require('../config.js');
const T = new Twit(config);




function gotData() {
  T.get('search/tweets', {count: 5 }, function(){
	  var tweets = data.statuses;
	  return tweets;
  });

  // for (var i = 0; i < tweets.length; i++) {
  //   console.log(tweets[i].text);
  // }
}

module.exports.gotData = gotData;