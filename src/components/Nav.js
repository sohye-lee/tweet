import React from 'react';
import { Link } from 'react-router-dom';

const Nav = ({userObj}) => {

    return (
        <div>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/profile">{userObj.displayName}'s Profile</Link></li>
            </ul>
        </div>
    )
}

export default Nav;
