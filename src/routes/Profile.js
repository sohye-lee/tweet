import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import { authService, dbService, storageService } from 'myFirebase';
import { useHistory } from 'react-router';
import Tweet from 'components/Tweet';
import defaultPhoto from '../images/user.jpg'

const Profile = ({userObj, refreshUser}) => {
    const history = useHistory();
    const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
    const [newPhoto, setNewPhoto] = useState(userObj.photoURL);
    const [myTweets, setMyTweets] = useState(null);
    const previousPhoto = userObj.photoURL;

    console.log(userObj.photoURL)
    const logout = () => {
        authService.signOut();
        history.push('/');
        refreshUser();
    }
    
    const getMyTweets = async() => {
        let newTweets = [];
        const tweets = await dbService.collection("tweets")
            .where("creatorId","==", userObj.uid)
            .orderBy("createdAt", "desc")
            .get();
        tweets.forEach(e => {
            newTweets.push(e.data());
        })
        setMyTweets(newTweets);
        
    }

    const onFileChange = (e) => {
        const { target: { files }} = e;
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = finishedEvent => {
            const { currentTarget: { result }} = finishedEvent;
            setNewPhoto(result);
        }
        reader.readAsDataURL(file);
    }

    const onChange = (e) => {
        const { target: { name, value }} = e;
        if (name==="name") {
            setNewDisplayName(value);
        } else if (name==="avatar") {
            setNewPhoto(value);
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        let imgUrl = userObj.photoURL;

        if (newPhoto !== imgUrl) {
            const fileRef = storageService.ref().child(`${userObj.uid}/${uuidv4()}`)
            const response = await fileRef.putString(newPhoto, "data_url");
            imgUrl = await response.ref.getDownloadURL();
            // try {
            //     await storageService.refFromURL(previousPhoto).delete();

            // } catch(error) {
            //     console.log(error.message);
            // }
        }
        
        const user = authService.currentUser;
        await user.updateProfile({
            displayName: newDisplayName,
            photoURL: imgUrl || defaultPhoto
        })

    }

    useEffect(() => {
        getMyTweets();
    }, [])

    return (
        <>
            <div>
                <form onSubmit={onSubmit}>
                    <div>
                        <img src={newPhoto || defaultPhoto} alt="profile" width="100px"/>
                    </div>
                    <input 
                        type="text" 
                        name="name"
                        placeholder="Your Name" 
                        value={newDisplayName}
                        onChange={onChange}
                    />
                    <input type="file" name="avatar" accept="images/*" onChange={onFileChange}/>
                    <input type="submit" value="Update" />
                </form>
                <button onClick={logout}>Log Out</button>
            </div>
            <div>
                <h2>My Tweets</h2>
                <div>
                    {myTweets ? myTweets.map(t => <Tweet key={t.id} tweetObj={t} userObj={userObj} isOwner={true}/>): "No tweet found."}
                </div>
            </div>
        </>
    )
}

export default Profile;
