import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import { authService, dbService, storageService } from 'myFirebase';
import { useHistory } from 'react-router';
import defaultPhoto from '../images/user.jpg'

const Profile = ({userObj, refreshUser}) => {
    const history = useHistory();
    const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
    const [newPhoto, setNewPhoto] = useState(userObj.photoURL);
    console.log(userObj.photoURL);
    const logout = () => {
        authService.signOut();
        history.push('/');
    }

    const getMyTweets = async() => {
        const tweets = await dbService.collection("tweets")
            .where("creatorId","==", userObj.uid)
            .orderBy("createdAt", "desc")
            .get();
        return tweets;
        
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
        const prevPhoto = userObj.photoURL;
        let imgUrl = prevPhoto;

        if (newPhoto !== prevPhoto) {
            const fileRef = storageService.ref().child(`${userObj.uid}/${uuidv4()}`)
            const response = await fileRef.putString(newPhoto, "data_url");
            imgUrl = await response.ref.getDownloadURL();
            setNewPhoto(imgUrl)
            console.log(imgUrl)
        }
    
        await storageService.refFromURL(prevPhoto).delete();

        const user = authService.currentUser;
        if(user.displayName !== newDisplayName) {
            await user.updateProfile({
                displayName: newDisplayName,
            })
            refreshUser();
        }

        if(user.photoURL !== imgUrl) {
            await user.updateProfile({
                photoURL: imgUrl
            })
            refreshUser();
        }
    }


    useEffect(() => {
        getMyTweets();
    }, [])

    return (
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
    )
}

export default Profile;
