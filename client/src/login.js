import React from 'react';
import './login.css';
import CloseButton from 'react-bootstrap/CloseButton'

const defaultState = {
    display:false, 
    formfilled:false, 
    usernameFilled:false,
    passwordFilled:false,
};

class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = Object.assign({},defaultState);

        this.displayDropDown = this.displayDropDown.bind(this);
        this.closeDropDown = this.closeDropDown.bind(this);
        this.updateInputFilled = this.updateInputFilled.bind(this);
    }

    displayDropDown(){
        let copy = Object.assign({},this.state);
        copy.display = true;

        this.setState(copy);
    }

    closeDropDown(e){
        let defaultCopy = Object.assign({},defaultState);

        this.setState(defaultCopy);
    }

    updateInputFilled(e){
        let copy = Object.assign({},this.state);
        let attr = e.target.id + 'Filled';
        copy[attr] = (e.target.value !== '');
        
        this.updateSubmit(copy);
    }

    updateSubmit(copy){
        copy.formfilled = copy.usernameFilled && copy.passwordFilled;

        this.setState(copy);
    }

    render() {
        if (this.state.display){
            return (
                <React.Fragment>
                <button className = {this.props.className} onClick = {this.displayDropDown}>
                    Login
                </button>
                <div className = "login_background">
                    <div className = "login_inner">
                        
                        <CloseButton variant = 'white' onClick = {this.closeDropDown}/>
                        <header className = 'loginHead'>Login</header>
                        <label htmlFor = 'username' className = 'loginLabel'>Username</label>
                        <input id = 'username' className = 'loginInput' onInput = {this.updateInputFilled}></input>
                        <label htmlFor = 'password'  className = 'loginLabel'>Password</label>
                        <input id = 'password' className = 'loginInput' onInput = {this.updateInputFilled}></input>
                        <button disabled={!this.state.formfilled} className = 'loginSubmit'>Login</button>
                    </div>
                </div>
                </React.Fragment>
            );
        }else{
            return(
                <button className = {this.props.className} onClick = {this.displayDropDown}>
                    Login
                </button>
            )
        }
    }
}
  
export default Login;
