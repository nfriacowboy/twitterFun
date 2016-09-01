require('dotenv').config();
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});



var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGO_DATABASE_URL;

var twitterRecords;

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    // Get the documents collection
    twitterRecords = db.collection('twitterRecords');
    startSaveTwitterToMyDisk();
  }
});

function startSaveTwitterToMyDisk() {
  var stream = client.stream('statuses/filter', {track: 'restaurant, drink, eat, bar, food'});
  stream.on('data', function (event) {
    var item = {
      message: event.text,
      timeStamp: event.created_at,
      userName: event.user.name,
      location: (event.user.location)? event.user.location : "somewhere on universe",
      nickName: event.user.screen_name,
      userImageUrl:  event.user.profile_image_url
    };

    twitterRecords.insert(item);

    console.log("=== New Message ====");
    console.log(item.userName + " (AKA " + item.nickName + ") said: '" + item.message + "'");
    console.log("on " + item.location + "  at " + item.timeStamp);
    console.log("====================");
    console.log();
  });

  stream.on('error', function (error) {
    throw error;
  });
}

