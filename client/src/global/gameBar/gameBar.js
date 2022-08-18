import React from 'react';
import { Link } from "react-router-dom";

import Settings from './settings/settings.js';

import Context from '../context.js';

import './gameBar.css';
import '../global.css';

class GameBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "", guest: true};

    this.fetchAPI = this.fetchAPI.bind(this);
  }

  static contextType = Context;

  componentDidMount(){
    this.context.refreshSession = this.fetchAPI;
    this.fetchAPI();
  }

  fetchAPI(){
    fetch('/account',{method:'POST'})
    .then(res => res.json())
    .then(function(res){
      this.setState(res);
    }.bind(this))
    .catch(err => err);
  }

  render() {
    let userInfo = this.state.guest ? 
    <React.Fragment>
      <Link to="/login" className = 'right gamebar_child gamebar_clickable'>Login</Link>
      <Link to="/register" className = 'right gamebar_child gamebar_clickable'>Register</Link>
    </React.Fragment> :
    <Link to="/account">{this.state.username}</Link>

    return (
      <React.Fragment>
        <nav className = 'gamebar_primary'>
          <Link to="/play" className = 'right gamebar_child gamebar_clickable'>Play</Link>
          <Link to="/leaderboard" className = 'right gamebar_child gamebar_clickable'>Leaderboard</Link>
          <header className = 'grow gamebar_child'>Ultris</header>
          <Settings className = 'right gamebar_child gamebar_clickable' loggedIn = {this.state.loggedIn}/>
          {userInfo}
        </nav>
      </React.Fragment>
    );
  }
}

export default GameBar;