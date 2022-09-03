import { Fragment } from 'react';
import { Link } from "react-router-dom";

import useSession from '../../assets/hooks/useSession.js';

import './navbar.css';

function Navbar(){
  let [session] = useSession();

  let userInfo = session.guest ? <Link to="/login">Sign In</Link> : null;

  return (
    <Fragment>
      <nav className = 'navbar'>
        <Link to="/play">Play</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <header>Ultris</header>
        {userInfo}
        <Link to="/dashboard">Dashboard</Link>
      </nav>
    </Fragment>
  )
}

export default Navbar;