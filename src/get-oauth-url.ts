import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config'

async function main() {
    const twitter_consumer_key = process.env.TWITTER_CONSUMER_KEY;
    const twitter_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;

    const missingDetails = !twitter_consumer_key || !twitter_consumer_secret;

    if (missingDetails) throw new Error('Missing twitter consumer key + secret');

    const client = new TwitterApi({
        appKey: twitter_consumer_key,
        appSecret: twitter_consumer_secret,
    });

    console.log(await client.generateAuthLink(undefined, { authAccessType: 'write' }));
}

main();