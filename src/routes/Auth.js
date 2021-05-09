import { authService, firebaseInstance } from 'myFirebase';
import React, { useState } from 'react';

const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newAccount, setNewAccount] = useState(true);
    const [error, setError] = useState("");

    const socialClick = async (e) => {
        const { target: { name }} = e;
        let provider;
     
            if (name === "google") {
                provider = new firebaseInstance.auth.GoogleAuthProvider();
            } else if (name === "facebook") {
                provider = new firebaseInstance.auth.FacebookAuthProvider();
            } else if (name === "github") {
                provider = new firebaseInstance.auth.GithubAuthProvider();
            }
        
        try {

            await authService.signInWithPopup(provider);
        }  catch (error) {
            setError(error.message);
        }
    }

    const changeHandler = (e) => {
        const {target: {name, value},} = e;
        if (name==='email') {
            setEmail(value); 
        } else if (name==='password') {
            setPassword(value);
        }
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            if (newAccount) {
                // Create Account
                await authService.createUserWithEmailAndPassword(email, password);
                setNewAccount(false);
            } else {
                // Log In
                await authService.signInWithEmailAndPassword(email, password);
            }
        } catch (error) {
            setError(error.message);
        }
    }

    const toggleAccount = () => setNewAccount(prev => !prev);
    return (
        <div>
            <form onSubmit={submitHandler}>
                <input name="email" type="text" placeholder="email" required value={email} onChange={changeHandler}/>
                <input name="password" type="password" placeholder="password" required value={password} onChange={changeHandler}/>
                <input type="submit" value={newAccount ? "Create Account" : "Log In"} />
                {error !== "" && <span>{error}</span>}
            </form>
            <span onClick={toggleAccount}>{newAccount ? "Sign In": "Create Account"}</span>
            <div>
                <button name="google" onClick={socialClick}>Continue with Google</button>
                <button name="facebook" onClick={socialClick}>Continue with Facebook</button>
                <button name="github" onClick={socialClick}>Continue with Github</button>
            </div>
            
        </div>
    );
}

export default Auth;
