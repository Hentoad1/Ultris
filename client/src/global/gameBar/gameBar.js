import React from 'react';
import { NavLink } from "react-router-dom";

import Login from './login.js';
import Register from './register.js';
import User from './user.js';
import Settings from './settings/settings.js';

import './gameBar.css';
import '../global.css';

class GameBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "", loggedIn: false};

    this.fetchAPI = this.fetchAPI.bind(this);
  }

  componentDidMount(){
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
    var userInfo;
    if (this.state.loggedIn){
      userInfo = <User className = 'right gamebar_child gamebar_clickable' username = {this.state.username} updateLoggedIn = {this.fetchAPI}/>
    }else{
      userInfo = (
        <React.Fragment>
          <Login className = 'right gamebar_child gamebar_clickable' updateLoggedIn = {this.fetchAPI}/>
          <Register className = 'right gamebar_child gamebar_clickable' updateLoggedIn = {this.fetchAPI}/>
        </React.Fragment>
      );
    }

    return (
        <nav className = 'gamebar_primary'>
          <NavLink to="/play" className = 'right gamebar_child gamebar_clickable'>Play</NavLink>
          <NavLink to="/leaderboard" className = 'right gamebar_child gamebar_clickable'>Leaderboard</NavLink>
          <header className = 'grow gamebar_child'>Ultris</header>
          <Settings className = 'right gamebar_child gamebar_clickable' loggedIn = {this.state.loggedIn}/>
          {userInfo}
        </nav>
    );
  }
}

export default GameBar;