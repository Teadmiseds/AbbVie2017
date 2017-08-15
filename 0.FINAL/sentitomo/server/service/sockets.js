/** @module Sockets */
import fs from 'fs';
import SocketIO from 'socket.io';
import moment from 'moment';
import { convertRawToCsv } from '../util/export';
import { detectTopicLDADynamic } from '../ML/ml_wrapper';
import { Tweet, TweetSentiment } from '../data/connectors';


/**
 * @function listenToSockets
 * @param  {Object} httpServer Express httpServer instance
 * @description Start up webserver sockets to allow a bidrectional communication between client and server. 
 * <br />  <strong>Possible events: </strong>
 *      <ul>
 *          <li>client:runTopicDetection - Runs the topic detection method with specified time range, and also joins it with the sentiment from the database, invoked from the client</li>
 *          <li>server:response - sends a status repsonse from server down to the client</li>
 *      </ul>
 * @return {void} 
 */
export function listenToSockets(httpServer) {
    var io = new SocketIO(httpServer);
    io.on('connection', function (socket) {
        socket.emit('news', {
            hello: 'world'
        });

        socket.on('client:runTopicDetection', data => {
            socket.emit('server:response', {
                level: 'success',
                message: 'Topic detection has started at: ' + new Date(),
                finished: false,
            });

            Tweet.findAll({
                where: {
                    created: {
                        $lt: data.to, // less than
                        $gt: data.from //greater than
                    }
                },
                raw: true //we use raw, we do not need to have access to the sequlize model here
            }).then(tweets => {
                tweets.forEach(function (tweet, index) {
                    // part and arr[index] point to the same object
                    // so changing the object that part points to changes the object that arr[index] points to
                    tweet.created = moment(tweet.created).format('YYYY-MM-DD hh:mm').toString();
                    tweet.createdAt = moment(tweet.createdAt).format('YYYY-MM-DD hh:mm')
                    tweet.updatedAt = moment(tweet.updatedAt).format('YYYY-MM-DD hh:mm')
                });

                const filename = './ML/Python/topic/lda/dynamic/tweets.csv';

                convertRawToCsv(tweets, filename)
                    .then(filename => {
                        detectTopicLDADynamic(filename).then(result => {
                            var result = JSON.parse(result.toString().replace("/\r?\n|\r/g", ""))
                            var tweetsIDs = result.map((entry) => { return entry.key })
                            var returnResult = new Array();

                            Tweet.findAll({ where: { id: tweetsIDs }, include: [TweetSentiment] }).then(tweets => {
                                tweets.forEach((tweet) => {
                                    var topicTweet = result.find(x => x.key === tweet.id)
                                    returnResult.push({
                                        id: tweet.id,
                                        message: tweet.message,
                                        topicId: topicTweet.id,
                                        topic: topicTweet.topic,
                                        topicProbability: topicTweet.probability,
                                        created: tweet.created,
                                        sentiment: tweet.TW_SENTIMENT ? tweet.TW_SENTIMENT.sentiment : null
                                    })
                                })
                                console.log('sending response now');
                                socket.emit('server:response', {
                                    level: 'success',
                                    message: 'Topic detection has finished at: ' + new Date(),
                                    finished: true,
                                    result: returnResult
                                });
                            })
                        });
                    })
            })
        });
    });
}

