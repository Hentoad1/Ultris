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

  fetchAPI(callback){
    fetch('/account',{method:'POST'})
    .then(res => res.json())
    .then(function(res){
      this.setState(res);
      if (callback){
        callback();
      }
    }.bind(this))
    .catch(err => err);
  }

  render() {
    let userInfo = this.state.guest ? 
    <React.Fragment>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </React.Fragment> :
    <Link to="/account">{this.state.username}</Link>

    return (
      <React.Fragment>
        <nav className = 'gameBar'>
          <Link to="/play">Play</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <header>Ultris</header>
          <Settings loggedIn = {this.state.loggedIn}/>
          {userInfo}
        </nav>
      </React.Fragment>
    );
  }
}

export default GameBar;