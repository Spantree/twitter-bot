This is a simple twitter bot written in node. After specifying a
hashtag to follow, the bot will filter tweets based on arbitrary
criteria (examples can be found in `app.js`), after which the tweet
could be favorited and retweeted, and the user could be followed based
on simple chance.

## Setup

In order to run this, you'll need to first go to dev.twitter.com to
create a new app ("Manage your apps" under tools at the very bottom).

Once you've created an app, you'll need to generate an access token and
token secret, which can be done through the "Keys and Access Tokens" tab
in the app management ui.

Then, run `npm install` to get the dependencies.

If you want to log to MongoDB, start up a local instance at the default
port.

## Configuration

To connect to the twitter API, you'll need to create a file in the root
of this project called `config.js`, which should look like this:

```
module.exports = {
    consumer_key: 'yourKey',
    consumer_secret: 'yourSecret',
    access_token: 'yourAccessToken',
    access_token_secret: 'yourTokenSecret'
};
```

In the first few lines of `app.js`, you'll see variables you can change
that will name the MongoDB database and collection. You can also specify
which word or hashtag you want to filter incoming tweets on.

## Running it

All you need to do to run the app is `node app.js`, after which you'll
see logged output for incoming tweets, as well as Fav/RT/Follow activity
scheduled and realized.

I like to persist the log while watching it, so I tend to run it like
so:

```
node app.js | tee -a some-file.log
```


## DISCLAIMER

This is a twitter bot that acts as if it were you, on your twitter
account. It's not smart. It can't make judgment calls like you might
want were you to be personally curating your twitter feed. As such, use
at your own risk, particularly if you have any social media capital
attached to the account you're using the bot on.
