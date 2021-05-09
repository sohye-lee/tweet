import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Auth from 'routes/Auth';
import Home from 'routes/Home';
import Profile from 'routes/Profile';
import Nav from './Nav';

// eslint-disable-next-line import/no-anonymous-default-export
const AppRouter = ({refreshUser, isLoggedIn, userObj}) =>  {
    return (
        <Router>
            {isLoggedIn && <Nav userObj={userObj} />}
            <Switch>
                {isLoggedIn ? 
                <>
                    <Route exact path="/">
                        <Home userObj={userObj} />
                    </Route>
                    <Route exact path="/profile">
                        <Profile userObj={userObj} refreshUser={refreshUser}/>
                    </Route>
                </>
                :<Route exact path="/">
                    <Auth/>
                </Route>}
            </Switch>
        </Router>
    )
}

export default AppRouter;