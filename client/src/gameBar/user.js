import React from 'react';
import './user.css';

const defaultState = {
    display:false

};

class User extends React.Component {
    constructor(props){
        super(props);
        this.state = Object.assign({},defaultState);

        this.displayDropDown = this.displayDropDown.bind(this);
        this.closeDropDown = this.closeDropDown.bind(this);
        this.logout = this.logout.bind(this);
    }

    displayDropDown(e){
        let copy = Object.assign({},this.state);
        copy.display = true;

        this.setState(copy);
    }

    closeDropDown(e){
        let defaultCopy = Object.assign({},defaultState);

        this.setState(defaultCopy);
    }

    logout(){
        fetch('http://localhost:9000/account/logout',{method:'POST'})
        .then()
        .then(this.props.updateLoggedIn)
        .catch(err => err);
    }

    render() {
        if (this.state.display){
            return (
                <button className = {this.props.className} onMouseEnter={this.displayDropDown}>
                    {this.props.username}
                    <div className = 'user_menu' onMouseLeave={this.closeDropDown}>
                        <p className = 'user_child' onClick={this.logout}>LOGOUT</p>
                    </div>
                </button>
            )
        }else{
            return (
                <button className = {this.props.className} onMouseEnter={this.displayDropDown}>
                    {this.props.username}
                </button>
            )
        }
    }
}
  
export default User;
