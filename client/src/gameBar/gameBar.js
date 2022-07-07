import React from 'react';
import { NavLink } from "react-router-dom";

import Login from './login.js';
import Register from './register.js';
import User from './user.js';
import Settings from './settings/settings.js';

import './gameBar.css';
import '../global.css';
import { toHaveDisplayValue } from '@testing-library/jest-dom/dist/matchers.js';


function RenderUsername(props){
  if (props.loggedIn){
    return <User className = 'right gamebar_child gamebar_clickable' username = {props.username} updateLoggedIn = {props.fetchAPI}/>
  }else{
    return (
      <React.Fragment>
        <Login className = 'right gamebar_child gamebar_clickable' updateLoggedIn = {props.fetchAPI}/>
        <Register className = 'right gamebar_child gamebar_clickable' updateLoggedIn = {props.fetchAPI}/>
      </React.Fragment>
    );
  }
}

class GameBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "", loggedIn: false};

    this.processAPIResponse = this.processAPIResponse.bind(this);
    this.fetchAPI = this.fetchAPI.bind(this);
  }
  
  processAPIResponse(data) {
    this.setState({ username: data.username, loggedIn: data.loggedIn });
  }

  componentDidMount(){
    this.fetchAPI();
  }

  fetchAPI(){
    fetch('http://localhost:9000/users')
    .then(res => res.json())
    .then(this.processAPIResponse)
    .catch(err => err);
  }

  render() {
    return (
        <nav className = 'gamebar_primary'>
          <NavLink to="/play" className = 'right gamebar_child gamebar_clickable'>Play</NavLink>
          <NavLink to="/leaderboard" className = 'right gamebar_child gamebar_clickable'>Leaderboard</NavLink>
          <header className = 'grow gamebar_child'>Ultris</header>
          <Settings className = 'right gamebar_child gamebar_clickable' loggedIn = {this.state.loggedIn}/>
          <RenderUsername loggedIn = {this.state.loggedIn} username = {this.state.username} fetchAPI = {this.fetchAPI}/>
        </nav>
    );
  }
}

export default GameBar;