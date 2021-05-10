import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { dbService, storageService } from 'myFirebase';

const TweetFactory = ({userObj}) => {

    const [tweet, setTweet] = useState("");
    const [filepath, setFilepath] = useState("");

    const onChange = (e) => {
        setTweet(e.target.value);
    }
    
    const onFileChange = (e) => {
        const { target: { files }} = e;
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = finishedEvent => {
            const { currentTarget: { result }} = finishedEvent;
            setFilepath(result);
        }
        reader.readAsDataURL(file);
    }
    
    const submitHandler = async (e) => {
        e.preventDefault();

        let imgUrl = "";
        if (filepath !== "") {
            const fileRef = storageService.ref().child(`${userObj.uid}/${uuidv4()}`)
            const response = await fileRef.putString(filepath, "data_url");
            imgUrl = await response.ref.getDownloadURL();
        }

        const tweetObj = {
            creatorId: userObj.uid,
            creatorName: userObj.displayName,
            text: tweet,
            createdAt: Date.now(),
            imgUrl,
        }

        await dbService.collection("tweets").add(tweetObj);
        setTweet("");
        setFilepath("");
    }

    return (
        <div>
            <form onSubmit={submitHandler}>
                
                {filepath !== "" &&
                    <div>
                        <img src={filepath} alt="file" width="100px"/>
                        <button onClick={() => setFilepath(null)}>clear</button>
                    </div>
                }
                
                <input value={tweet} onChange={onChange} type="text" placeholder="What's in your mind?" maxLength={200} />
                <input type="file" accept="images/*" onChange={onFileChange}/>
                <input type="submit" value="Tweet" />
            </form>
        </div>
    )
}

export default TweetFactory;
