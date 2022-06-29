import React from 'react';
import './register.css';
import CloseButton from 'react-bootstrap/CloseButton'
import { ThemeConsumer } from 'react-bootstrap/esm/ThemeProvider';

const defaultState = {
    display:false, 
    formfilled:false, 
    usernameValue:'',
    usernameValid:false,
    usernameError:'',
    passwordValue:'',
    passwordConfirmValue:'',
    passwordValid:false,
    passwordError:'',
    emailValue:'',
    emailValid:true,
    emailError:''
};

class Register extends React.Component {
    constructor(props){
        super(props);
        this.state = Object.assign({},defaultState);

        this.displayDropDown = this.displayDropDown.bind(this);
        this.closeDropDown = this.closeDropDown.bind(this);
        this.updateInputFilled = this.updateInputFilled.bind(this);
        this.updateUsernameValidity = this.updateUsernameValidity.bind(this);
        this.updatePasswordValidity = this.updatePasswordValidity.bind(this);
        this.updateEmailValidity = this.updateEmailValidity.bind(this);
        this.processAPIResponse = this.processAPIResponse.bind(this);
        this.submitInformation = this.submitInformation.bind(this);
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

    processAPIResponse(data){
        let copy = Object.assign({},this.state);
        if (data.success === true){
            copy.display = false;
            //change navbar
        }else{
            delete data.success;
            for (let property in data){
                copy[property] = data[property];
            }
        }
        this.updateSubmit(copy);
    }

    updateInputFilled(e){
        let copy = Object.assign({},this.state);
        let attr = e.target.id + 'Value';
        copy[attr] = e.target.value;

        this.state = copy; //page doesnt need to refresh; only storing data.
    }

    updateUsernameValidity(e){
		let regex = /[^a-zA-Z0-9]/g;
		let result = e.target.value.match(regex);
        let valid = false;
        let message = this.state.usernameError === 'This Username has already been taken.' ? this.state.usernameError : ''; //stops annoying jiggle from re-queuing server
        if (result != null && result.length > 0){
            let charSet = new Set(result); // make it into a set to avoid repeats
			let chars = Array.from(charSet).join('');
			let text = chars.length == 1 ? 'Invalid Character:' : 'Invalid Characters:';
			message = (text + " '" + chars + "'");
		}else if (e.target.value.length > 15){
			message = ("Username Must be 15 Characters or less.");
		}else if (e.target.value == ''){
			message = ("Please Enter a Username.");
		}else{
            valid = true;
            fetch('http://localhost:9000/register/checkUsername', {
                method: 'POST',
                body: JSON.stringify({username:e.target.value}),
                headers: {
                    'Content-type':'application/json'
                }
            })
            .then(res => res.json())
            .then(this.processAPIResponse) //this needs to be defined here because this needs to be binded in the constructor so that this.state can be called.
            .catch(err => err);
        }

        let copy = Object.assign({},this.state);
        copy.usernameError = message;
        copy.usernameValid = valid;

        this.updateSubmit(copy);
    }

    updatePasswordValidity(e){
        let copy = Object.assign({},this.state);
        let mismatch = copy.passwordValue !== copy.passwordConfirmValue;
        let error = '';
        let valid = false;
        if (mismatch){
            error = 'The Passwords do not Match.';
        }else if (copy.passwordValue.length < 8){
            error = 'Your password must have 8 or more characters.';
        }else if (copy.passwordValue.length >= 128){
            error = 'Your password must be less than 128 characters.';
        }else{
            valid = true;
        }
        copy.passwordError = error;
        copy.passwordValid = valid;

        
        this.updateSubmit(copy);
    }

    updateEmailValidity(e){
        let str = e.target.value;
        
        let atIndex = str.indexOf('@');
        let singleAtSign = atIndex === str.lastIndexOf('@');

        let dotIndex = str.lastIndexOf('.');

        let correctPosition = dotIndex - atIndex > 1;

        let valid = str === '' || (singleAtSign && correctPosition);
        
        let copy = Object.assign({},this.state);
        copy.emailValid = valid;
        copy.emailError = valid ? '' : 'Please Enter a Valid Email.';

        this.updateSubmit(copy);
    }

    updateSubmit(copy){
        copy.formfilled = copy.usernameValid && copy.passwordValid && copy.emailValid;

        this.setState(copy);
    }

    submitInformation(){
        let data = {
            username:this.state.usernameValue,
            password:this.state.passwordValue,
            email:this.state.emailValue
        };

        fetch('http://localhost:9000/register/createAccount', {
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

    render() {
        if (this.state.display){
            return (
                <React.Fragment>
                <button className = {this.props.className} onClick = {this.displayDropDown}>
                    Regsiter
                </button>
                <div className = "register_background">
                    <div className = "register_inner">
                        
                        <CloseButton variant = 'white' onClick = {this.closeDropDown}/>
                        <header className = 'registerHead'>Register</header>
                        <label htmlFor = 'username' className = 'registerLabel'>Username</label>
                        <input id = 'username' type="text" className = 'registerInput' onInput = {this.updateInputFilled} onBlur = {this.updateUsernameValidity}></input>
                        <span className = 'registerError'>{this.state.usernameError}</span>
                        <label htmlFor = 'password'  className = 'registerLabel'>Password</label>
                        <input id = 'password' type="password" className = 'registerInput' onInput = {this.updateInputFilled} onBlur = {this.updatePasswordValidity}></input>
                        <label htmlFor = 'passwordConfirm'  className = 'registerLabel'>Confirm Password</label>
                        <input id = 'passwordConfirm' type="password" className = 'registerInput' onInput = {this.updateInputFilled} onBlur = {this.updatePasswordValidity}></input>
                        <span className = 'registerError'>{this.state.passwordError}</span>
                        <label htmlFor = 'email'  className = 'registerLabel'>Email (Optional)</label>
                        <input id = 'email' type="text" className = 'registerInput' onInput = {this.updateInputFilled} onBlur = {this.updateEmailValidity}></input>
                        <span className = 'registerError'>{this.state.emailError}</span>
                        <button disabled={!this.state.formfilled} className = 'registerSubmit' onClick = {this.submitInformation}>Register</button>
                    </div>
                </div>
                </React.Fragment>
            );
        }else{
            return(
                <button className = {this.props.className} onClick = {this.displayDropDown}>
                    Regsiter
                </button>
            )
        }
    }
}
  
export default Register;
