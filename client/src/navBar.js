import React from 'react';
import './navBar.css';
import { NavLink } from "react-router-dom";
import Login from './login.js'
import Register from './register.js'

function RenderUsername(props){
  if (props.loggedIn){
    return <div className = 'navbar_right navbar_child'>{props.username}</div>
  }else{
    return (
      <React.Fragment>
        <Login className = 'navbar_right navbar_child navbar_clickable'/>
        <Register className = 'navbar_right navbar_child navbar_clickable' updateLoggedIn = {props.fetchAPI}/>
      </React.Fragment>
    );
  }
}

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "", loggedIn: false };

    this.processAPIResponse = this.processAPIResponse.bind(this);
    this.fetchAPI = this.fetchAPI.bind(this);
  }
  
  processAPIResponse(data) {
    console.log(data);
    let copy = Object.assign({},this.state);

    copy.loggedIn = data.loggedIn;
    copy.username = data.username;

    this.setState(copy);
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
        <nav className = "navbar">
          <NavLink to="/play" className = 'navbar_left navbar_child navbar_clickable'>Play</NavLink>
          <NavLink to="/leaderboard" className = 'navbar_left navbar_child navbar_clickable'>Leaderboard</NavLink>
          <header className = 'navbar_title navbar_child'>Ultris</header>
          <RenderUsername loggedIn = {this.state.loggedIn} username = {this.state.username} fetchAPI = {this.fetchAPI}/>
        </nav>
    );
  }
}

export default NavBar;