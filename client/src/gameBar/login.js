import React from 'react';
import CloseButton from 'react-bootstrap/CloseButton';

import './login.css';

const defaultState = {
    display:false, 
    formfilled:false, 
    usernameValue:'',
    passwordValue:'',
    serverError:'',
};

class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = Object.assign({},defaultState);

        this.displayDropDown = this.displayDropDown.bind(this);
        this.closeDropDown = this.closeDropDown.bind(this);
        this.updateInputFilled = this.updateInputFilled.bind(this);
        this.submitInformation = this.submitInformation.bind(this);
        this.processAPIResponse = this.processAPIResponse.bind(this);
    }

    displayDropDown(){
        this.setState({display:true});
    }

    closeDropDown(e){
        this.setState(defaultState);
    }

    updateInputFilled(e){
        let copy = {};
        let attr = e.target.id + 'Value';
        copy[attr] = e.target.value;

        this.updateSubmit(copy);
    }

    updateSubmit(copy){
        copy.formfilled = copy.usernameValue !== '' && copy.passwordValue !== '';

        this.setState(copy);
    }

    submitInformation(){
        let data = {
            username:this.state.usernameValue,
            password:this.state.passwordValue
        };

        fetch('http://localhost:9000/account/login', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type':'application/json'
            }
        })
        .then(res => res.json())
        .then(this.processAPIResponse)
        .catch(err => err);
    }

    processAPIResponse(data){
        let copy = Object.assign({},this.state);
        if (data.success === true){
            copy.display = false;
            this.props.updateLoggedIn();
        }else{
            delete data.success;
            for (let property in data){
                copy[property] = data[property];
            }
        }
        this.updateSubmit(copy);
    }

    render() {
        if (this.state.display){
            return (
                <React.Fragment>
                <button className = {this.props.className} onClick = {this.displayDropDown}>
                    Login
                </button>
                <div className = 'login_outer'>
                    <div className = 'login_inner'>
                        <CloseButton variant = 'white' onClick = {this.closeDropDown}/>
                        <header className = 'login_head'>Login</header>
                        <label htmlFor = 'username' className = 'login_label'>Username</label>
                        <input id = 'username' type = "text" className ='login_input' onInput = {this.updateInputFilled}></input>
                        <label htmlFor = 'password'  className = 'login_label'>Password</label>
                        <input id = 'password' type = "password" className = 'login_input' onInput = {this.updateInputFilled}></input>
                        <span className = 'login_erorr'>{this.state.serverError}</span>
                        <button disabled={!this.state.formfilled} className = 'login_submit' onClick = {this.submitInformation}>Login</button>
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
