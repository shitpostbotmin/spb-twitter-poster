import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import * as path from 'path';
import 'dotenv/config'
import fs from 'fs';


async function main() {
    const { filepath, memeId } = await downloadImageFromSpb();
    const tweetUrl = await postTweet(filepath);
    await updateSpbWithTweetUrl(tweetUrl, memeId);
    await cleanup(filepath);
}

function spbAxios() {
    return axios.create({
        baseURL: process.env.SPB_ENDPOINT,
        params: {
            'api-key': process.env.SPB_API_KEY,
        },
    })
}

async function downloadImageFromSpb(): Promise<{ memeId: string, filepath: string }> {
    const response = await spbAxios().get('/api/generate');

    if (!response.data.success) {
        throw new Error('SPB API error when generating meme: ' + response.data.msg);
    }

    return {
        filepath: await saveImageFromUrl(response.data.img),
        memeId: response.data.id,
    }
}

function saveImageFromUrl(spbImagePath: string): Promise<string> {
    return spbAxios().get(spbImagePath, {
        responseType: 'stream'
    }).then(response => {
        const filename = path.join(__dirname, '/../', Date.now() + '.jpg');
        const writer = fs.createWriteStream(filename);
        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error: Error | null = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(filename);
                }
            });
        });
    });
}

async function postTweet(filename: string): Promise<string> {
    const twitter_consumer_key = process.env.TWITTER_CONSUMER_KEY;
    const twitter_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
    const twitter_access_token = process.env.TWITTER_ACCESS_TOKEN;
    const twitter_access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

    const missingDetails = !twitter_access_token
        || !twitter_access_token_secret
        || !twitter_consumer_key
        || !twitter_consumer_secret;

    if (missingDetails) throw new Error('Missing twitter oauth token/secret or app token/secret');

    const client = new TwitterApi({
        appKey: twitter_consumer_key,
        appSecret: twitter_consumer_secret,
        accessToken: twitter_access_token,
        accessSecret: twitter_access_token_secret,
    });

    const mediaId = await client.v1.uploadMedia(filename)

    const response = await client.v2.tweet('', {
        media: {
            media_ids: [mediaId],
        },
    });

    return `https://twitter.com/${process.env.TWITTER_HANDLE}/status/${response.data.id}`;
}

async function updateSpbWithTweetUrl(tweetUrl: string, memeId: string): Promise<void> {
    const response = await spbAxios().get('/api/add-url', {
        params: {
            url: tweetUrl,
            'meme-id': memeId,
        },
    });

    if (!response.data.success) {
        throw new Error('SPB API error when adding url: ' + response.data.msg);
    }
}

function cleanup(filepath: string): Promise<void> {
    return fs.promises.unlink(filepath)
}

main();