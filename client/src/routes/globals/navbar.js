import { Fragment } from 'react';
import { Link } from "react-router-dom";

import useSession from '../../assets/hooks/useSession.js';

import './navbar.css';

function Navbar(){
  let session = useSession();

  let userInfo = session.guest ? 
  <Fragment>
    <Link to="/login">Login</Link>
    <Link to="/register">Register</Link>
  </Fragment> :
  <Link to="/account">{session.username}</Link>

  return (
    <Fragment>
      <nav className = 'navbar'>
        <Link to="/play">Play</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <header>Ultris</header>
        {userInfo}
      </nav>
    </Fragment>
  )
}

export default Navbar;