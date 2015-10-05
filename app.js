var Twit = require('twit');
var config  = require('./config');
var MongoClient = require('mongodb').MongoClient;

var T = new Twit(config);

// Change these, depending on what you want your
// database, collection, and tracking hash tag to
// look like.
var dbName = 'myDatabaseName';
var collectionName = 'myCollectionName';
var hashTag = 'javascript';
// End change section

var tweetDb, tweetColl;

var stream = T.stream('statuses/filter', {track: hashTag});
stream.on('tweet', function(tweet) {
  console.log('Incoming Tweet');

  // Log the tweet no matter what, as log as a connection to Mongo has been established
  if(tweetColl) {
    tweetColl.insert(tweet, function(err, result) {
      if(err) console.log(err);
      else console.log('Tweet logged');
    });
  }

  // Determine if the tweet is something we might be interested, based on arbitrary criteria:
  if(
    !tweet.in_reply_to_user_id &&                   // Don't Fav/RT the middle of a convo
    tweet.user.screen_name !== 'freethejazz' &&     // Prevent Fav/RT/Following specific users
    tweet.lang === 'en' &&                          // Lock down the tweet language to english
    !blacklist.test(tweet.text.toLowerCase())       // Simple test for blacklisted words/phrases
  ) {

    // Roll the dice to favorite
    if(!tweet.favorited && isLucky(1/8)) {
      console.log('Scheduling Favorite');
      scheduleFuture(favoriteTweet, tweet);

      // Roll again to retweet
      if(!tweet.retweeted && isLucky(1/2)) {
        console.log('Scheduling RT');
        scheduleFuture(retweetTweet, tweet);

        // Roll a third time to follow
        if(!tweet.user.following && isLucky(1/2)) {
          console.log('Scheduling Follow');
          scheduleFuture(followUser, tweet.user);
        }
      }
    }
  }
});

// Naive blacklist, based on regex
var blacklist = new RegExp([
  'cookie',
  'excite',
  'won',
  'prize',
  'swag',
  'job',
  'hiring',
  'win'
].join('|'), 'i');

// Instead of Fav/RT/Follow immediately, do it after a variable delay.
// Makes things seem a bit more human.
var scheduleFuture = function(fn, arg) {
  setTimeout(fn, randomMsBetween(20000, 90000), arg);
};

//Choose a random number between two given numbers
var randomMsBetween = function(low, high) {
  return Math.floor(Math.random() * (high - low)) + low;
};

// Naive dice roll
var isLucky = function(chances) {
  return (Math.random() < chances);
};

var favoriteTweet = function(tweet) {
  console.log('Favoriting tweet:' + tweet.text);
  T.post('favorites/create', { id: tweet.id_str }, cb);
};

var retweetTweet = function(tweet) {
  console.log('Retweeting tweet:' + tweet.text);
  T.post('statuses/retweet/:id', { id: tweet.id_str }, cb);
};

var followUser = function(user) {
  console.log('Following user: ' + user.screen_name);
  T.post('friendships/create', {screen_name: user.screen_name, follow: true}, cb);
};

// Simple callback to swallow successes and log errors
var cb = function(err) {
  if(err) {
    console.log(err);
  }
};

//Connect to a local Mongo Instance
MongoClient.connect('mongodb://localhost:27017/' + dbName, function(err, db) {
  if(err) {
    console.log('ERROR: Cannot connect to mongo, tweets will not be logged');
  } else {
    console.log('Connected to mongo');
    tweetDb = db;
    tweetColl = db.collection(collectionName);
  }
});

//Gracefully handle SIGINT
process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  if(tweetDb) {
    tweetDb.close();
  }
  if(stream){
    stream.stop();
  }

  process.exit();
});
