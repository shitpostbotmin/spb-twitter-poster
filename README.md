# spb-twitter-poster

1. start with TWITTER_CONSUMER_KEY and TWITTER_CONSUMER_SECRET filled in with your app key and app secret, created from the dashboard
2. log in by running `npm run get-oauth-url`. this command will give you a URL to get a code from, and also an oauth key and secret. put the oauth key and secret into .env, and hit the URL to get the code.
3. get the access tokens by running `npm run get-access-token -- 1234567`. put the access token and secret into the .env as well.
4. run `npm run post` to post.
