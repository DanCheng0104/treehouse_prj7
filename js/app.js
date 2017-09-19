const express = require('express');
const bodyParser = require('body-parser');
const Twit = require('twit');
const config = require('../config.js');
const T = new Twit(config);
const app = express();
const moment = require('moment');
app.set('view engine','pug');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const paras = {};
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

//app.use(getCredentials);


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
    
    paras.bg = result.data.profile_banner_url;
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
     //get followers
     T.get('friends/list',{count:5})
     .catch(function (err) {
      console.log('caught error', err.stack)
    })
    .then(function(result){
         paras.users=[];
         result.data.users.forEach(u=>{
           const user = {};
           user['name']=u.name;
           user['screen_name']=u.screen_name;
           user['profile_image_url']=u.profile_image_url;
           paras.users.push(user);
         });
         //get messages sent from others
         T.get('direct_messages',{count:5})
         .catch(function (err) {
           console.log('caught error', err.stack)
         })
         .then(function(result){
           paras.messages=[];
           result.data.forEach(m=>{
            const msg={};
            msg['text'] = m.text;
            msg['sender_screen_name'] = m.sender_screen_name;
            msg['profile_image_url'] = m.sender.profile_image_url;
            msg['created_at'] = m.created_at;
            msg['recipient_screen_name'] = m.recipient_screen_name;
            msg['received'] = 1;
            paras.messages.push(msg);
           });
           //get messages sent by me
            T.get('direct_messages/sent',{count:5})
            .catch(function (err) {
              console.log('caught error', err.stack)
            })
            .then(function(result){
              result.data.forEach(m=>{
               const msg={};
               msg['text'] = m.text;
               msg['sender_screen_name'] = m.sender_screen_name;
               msg['profile_image_url'] = m.sender.profile_image_url;
               msg['created_at'] = m.created_at;
               msg['recipient_screen_name'] = m.recipient_screen_name;
               msg['received'] = 0;
               paras.messages.push(msg);
              });              
              createConversation(paras);
              formatTime(paras);
        
            });          
           
         });
    });
  });

  });

 //format the time to be like how long ago
  function formatTime(paras){
    paras.tweets.forEach(tweet=>{
      tweet.created_at = moment(tweet.created_at).fromNow();
    })

  }
  //sort the message based on the time they created
  function sortMsg(a,b){
   let comparison = 0;
   return comparison = (a.created_at > b.created_at)?1:-1;
   
  }
  //create a conversation based on the message I sent and received
  function createConversation(paras){
    let conversations = {};
    paras.messages.forEach(m=>{
     const send_screen_name = m['sender_screen_name'];
     if ((m['received'] ==1)&&(send_screen_name !== paras.screen_name) && (!conversations.hasOwnProperty(send_screen_name))) {
        conversations[send_screen_name]=[]
        conversations[send_screen_name].push(m);
     }
    });
    paras.messages.forEach(m=>{
     const recipient_screen_name = m['recipient_screen_name'];
     if (m['received'] ==0) {conversations[recipient_screen_name].push(m);}
    });

    for (let key in conversations){
      conversations[key].sort(sortMsg);
    }

    for (let key in conversations){
      conversations[key].forEach(convo=>{
        convo.created_at = moment(convo.created_at).fromNow();
      })
    }
    paras.conversations = conversations;
  }

  app.get('/',(req,res)=>{
     res.render('index',paras);
  });
  io.sockets.on('connection', function (socket) {
    // When the server receives a “message” type signal from the client   
    socket.on('message', function (newTweet) {
      T.post('statuses/update', { status: newTweet}, function(err, data, response) {
        const t_content = {};
        t_content['created_at'] = moment(data['created_at']).fromNow();
        t_content['text'] = data['text'];
        t_content['retweet_count'] = data['retweet_count'];
        t_content['favorite_count'] = data['favorite_count'];
        t_content['name'] = paras.name;
        t_content['screen_name'] = paras.screen_name;
        t_content['profile_image_url'] = paras.profile_image_url;
        paras.tweets.unshift(t_content);
        io.sockets.emit('new_tweet', t_content);
     },paras)
    },paras); 
});



server.listen(3000,()=>{
 console.log('the app is running');
});