import Tweet from 'components/Tweet';
import { dbService } from 'myFirebase';
import React, { useEffect, useState } from 'react';
import TweetFactory from 'components/TweetFactory';


const Home = ({userObj}) => {
    const [tweets, setTweets] = useState([]);
    
    useEffect(() => {
        dbService.collection("tweets").onSnapshot((snapshot) => {
            const tweetsArray = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
            setTweets(tweetsArray);
        });
    }, [])

    return (
        <div>
            <TweetFactory userObj={userObj} />
            <div>
                {tweets.map(t => <Tweet key={t.id} tweetObj={t} userObj={userObj} isOwner={t.creatorId === userObj.uid}/>)}
            </div>
        </div>
    )
}

export default Home;

