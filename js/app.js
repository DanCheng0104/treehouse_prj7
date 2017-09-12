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
        
            });          
           
         });
    });
  //    app.get('/',(req,res)=>{
  // res.render('index',paras);
  //   });
  });

  });

  function sortMsg(a,b){
   let comparison = 0;
   return comparison = (a.created_at > b.created_at)?1:-1;
   
  }
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

    paras.conversations = conversations;
    console.log(paras.conversations);
  }


  //    app.get('/',(req,res)=>{
  // res.render('index',{ screen_name: paras.screen_name});
  //   });
app.listen(3000,()=>{
 console.log('the app is running');
});