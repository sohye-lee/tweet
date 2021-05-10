import { dbService, storageService } from 'myFirebase';
import { v4 as uuidv4 } from 'uuid';
import React, { useState } from 'react';

const Tweet = ({tweetObj, userObj, isOwner}) => {
    const [editing, setEditing] = useState(false);
    const [newTweet, setNewTweet] = useState(tweetObj.text);
    const [newImg, setNewImg] = useState(tweetObj.imgUrl);
    const previousImg = tweetObj.imgUrl;

    const deleteHandler = async () => {
        const ok = window.confirm("Are you sure you wish to delete this tweet?");
        if (ok) {
            await dbService.doc(`tweets/${tweetObj.id}`).delete();
            try {
                await storageService.refFromURL(tweetObj.imgUrl).delete();

            } catch (error) {
                console.log(error.message);
            }
        }
    }

    const toggleEditing = () => {
        setEditing(prev => !prev);
    }

    const onFileChange = (e) => {
        const { target: { files }} = e;
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = finishedEvent => {
            const { currentTarget: { result }} = finishedEvent;
            setNewImg(result);
        }
        reader.readAsDataURL(file);
    }

    const submitHander = async (e) => {
        e.preventDefault();

        let imgUrl = "";
        if (newImg !== previousImg && newImg !== "") {
            const fileRef = storageService.ref().child(`${userObj.uid}/${uuidv4()}`)
            const response = await fileRef.putString(newImg, "data_url");
            imgUrl = await response.ref.getDownloadURL();
        }

        if (previousImg !== "" && previousImg !==null && imgUrl !== previousImg) {
            try {
                await storageService.refFromURL(tweetObj.imgUrl).delete();

            } catch (error) {
                console.log(error.message);
            }
        }

        await dbService.doc(`tweets/${tweetObj.id}`).update({
            text: newTweet,
            creatorName: userObj.displayName,
            imgUrl
        });
        setEditing(false);
    }

    return (
        <div>
            {
                editing? 
                <>
                    <img src={newImg} width="200px" alt="img"/>
                    <form onSubmit={submitHander}>
                        <input value={newTweet} required onChange={e => setNewTweet(e.target.value)} type="text"/>
                        <input type="file" accept="images/*" onChange={onFileChange} />
                        <input type="submit" value="Edit" />
                        <button onClick={toggleEditing}>Cancel</button>
                    </form>
                </>
                : 
                <>
                    <img src={tweetObj.imgUrl} width="200px" alt="img"/>
                    <h5>{tweetObj.text} - {tweetObj.creatorName}</h5>
                    {isOwner &&
                    <div>
                        <button onClick={deleteHandler}>Delete</button>
                        <button onClick={toggleEditing}>Edit</button>
                    </div>
                    }
                </>
            }
        </div>
    )
}

export default Tweet;
