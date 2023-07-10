import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config'

async function main() {
    const twitter_consumer_key = process.env.TWITTER_CONSUMER_KEY;
    const twitter_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
    const twitter_oauth_token = process.env.TWITTER_OAUTH_TOKEN;
    const twitter_oauth_token_secret = process.env.TWITTER_OAUTH_TOKEN_SECRET;

    const missingDetails = !twitter_oauth_token
        || !twitter_oauth_token_secret
        || !twitter_consumer_key
        || !twitter_consumer_secret;

    if (missingDetails) throw new Error('Missing twitter oauth token/secret or app token/secret');

    const code = process.argv[2];
    
    if (!code) throw new Error('Missing code arg (add with `npm run get-access-token -- 1234567`)')

    const client = new TwitterApi({
        appKey: twitter_consumer_key,
        appSecret: twitter_consumer_secret,
        accessToken: twitter_oauth_token,
        accessSecret: twitter_oauth_token_secret,
    });

    const { accessToken, accessSecret } = await client.login(code);
    console.log({ accessToken, accessSecret });
}
main();