import React from 'react';
import './navBar.css';
import { Outlet, NavLink } from "react-router-dom";

function RenderUsername(props){
  if (props.loggedIn){
    return <div className = 'navbar_right'>{props.username}</div>
  }else{
    return (
      <React.Fragment>
        <NavLink to="/login" className = 'navbar_right'>Login</NavLink> 
        <NavLink to="/register" className = 'navbar_right'>Register</NavLink>
      </React.Fragment>
    );
  }
}

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "", loggedIn: false };
  }
  
  callAPI() {
    fetch('http://localhost:9000/users')
      .then(res => res.text())
      .then(res => this.setState({ username: res, loggedIn: false }))
      .catch(err => err);
  }

  componentDidMount(){
    this.callAPI();
  }

  render() {
    return (
        <nav className = "navbar">
          <NavLink to="/play" className = 'navbar_left'>Play</NavLink>
          <NavLink to="/leaderboard" className = 'navbar_left'>Leaderboard</NavLink>
          <header className = 'navbar_title'>Ultris</header>
          <RenderUsername loggedIn = {this.state.loggedIn} username = {this.state.username}/>
        </nav>
    );
  }
}

export default NavBar;